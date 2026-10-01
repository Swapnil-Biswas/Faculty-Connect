import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { dispatchNotification } from "@/services/syncEngine";

export interface DefaultWeights {
  onTimeWeight: number;
  earlyWeight: number;
  completionRateWeight: number;
  streakWeight: number;
  qualityWeight: number;
  contributionWeight: number;
  initiativeWeight: number;
  overallRatingWeight: number;
}

export const DEFAULT_WEIGHTS: DefaultWeights = {
  onTimeWeight: 0.20,
  earlyWeight: 0.10,
  completionRateWeight: 0.15,
  streakWeight: 0.05,
  qualityWeight: 0.20,
  contributionWeight: 0.10,
  initiativeWeight: 0.10,
  overallRatingWeight: 0.10,
};

export async function getActiveScoringConfig() {
  const config = await db.scoringConfig.findFirst({
    where: { isActive: true },
    orderBy: { version: "desc" },
  });

  return config ?? {
    id: "default-fallback",
    version: 1,
    ...DEFAULT_WEIGHTS,
    setByAdminId: "system",
    createdAt: new Date(),
    isActive: true,
  };
}

export function calculateTaskPoints(params: {
  completedAt: Date;
  deadline: Date;
  qualityRating?: number | null;
  config: {
    onTimeWeight: number;
    earlyWeight: number;
    qualityWeight: number;
  };
}) {
  const isOnTime = params.completedAt.getTime() <= params.deadline.getTime();
  const isEarly =
    params.deadline.getTime() - params.completedAt.getTime() >= 24 * 60 * 60 * 1000;

  let basePoints = 10;
  let onTimePoints = isOnTime ? Math.round(params.config.onTimeWeight * 100) : 0;
  let earlyPoints = isEarly ? Math.round(params.config.earlyWeight * 100) : 0;
  let qualityPoints = 0;

  if (params.qualityRating && params.qualityRating > 0) {
    qualityPoints = Math.round(
      (params.qualityRating / 5) * (params.config.qualityWeight * 100)
    );
  }

  const totalPoints = basePoints + onTimePoints + earlyPoints + qualityPoints;

  return {
    totalPoints,
    basePoints,
    onTimePoints,
    earlyPoints,
    qualityPoints,
    isOnTime,
    isEarly,
  };
}

export function calculateEvaluationPoints(params: {
  quality: number;
  contribution: number;
  initiative: number;
  overallRating: number;
  config: {
    qualityWeight: number;
    contributionWeight: number;
    initiativeWeight: number;
    overallRatingWeight: number;
  };
}) {
  // Scale 1-5 to a 50-point pool
  const qPts = (params.quality / 5) * (params.config.qualityWeight * 100);
  const cPts = (params.contribution / 5) * (params.config.contributionWeight * 100);
  const iPts = (params.initiative / 5) * (params.config.initiativeWeight * 100);
  const oPts = (params.overallRating / 5) * (params.config.overallRatingWeight * 100);

  const total = Math.max(5, Math.round(qPts + cPts + iPts + oPts));
  return total;
}

export async function evaluateAndAwardBadges(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      badges: { include: { badge: true } },
      assignedTasks: { where: { deletedAt: null } },
      pointsLedger: true,
      evaluationsReceived: true,
    },
  });

  if (!user) return [];

  const existingBadgeNames = new Set(user.badges.map((b) => b.badge.name));
  const newlyAwarded: string[] = [];

  const completedTasks = user.assignedTasks.filter(
    (t) => t.status === "COMPLETED" && t.completedAt
  );

  // 1. Early Bird: Completed at least 5 tasks at least 24 hours early
  if (!existingBadgeNames.has("Early Bird")) {
    const earlyTasksCount = completedTasks.filter((t) => {
      if (!t.completedAt) return false;
      return t.deadline.getTime() - t.completedAt.getTime() >= 24 * 60 * 60 * 1000;
    }).length;

    if (earlyTasksCount >= 5) {
      await awardBadgeToUser(userId, "Early Bird");
      newlyAwarded.push("Early Bird");
    }
  }

  // 2. Task Master: 10 or more completed tasks
  if (!existingBadgeNames.has("Task Master")) {
    if (completedTasks.length >= 10) {
      await awardBadgeToUser(userId, "Task Master");
      newlyAwarded.push("Task Master");
    }
  }

  // 3. Consistent Performer: 5 consecutive on-time completed tasks
  if (!existingBadgeNames.has("Consistent Performer")) {
    const sortedCompleted = [...completedTasks].sort(
      (a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)
    );
    let streak = 0;
    for (const t of sortedCompleted) {
      if (t.completedAt && t.completedAt.getTime() <= t.deadline.getTime()) {
        streak++;
        if (streak >= 5) break;
      } else {
        break;
      }
    }
    if (streak >= 5) {
      await awardBadgeToUser(userId, "Consistent Performer");
      newlyAwarded.push("Consistent Performer");
    }
  }

  // 4. Perfect Score: received 5/5 across all categories in any evaluation
  if (!existingBadgeNames.has("Perfect Score")) {
    const hasPerfect = user.evaluationsReceived.some(
      (e) =>
        e.quality === 5 &&
        e.contribution === 5 &&
        e.initiative === 5 &&
        e.overallRating === 5
    );
    if (hasPerfect) {
      await awardBadgeToUser(userId, "Perfect Score");
      newlyAwarded.push("Perfect Score");
    }
  }

  // 5. Century Club: Total accumulated points >= 100
  if (!existingBadgeNames.has("Century Club")) {
    const totalPoints = user.pointsLedger.reduce((sum, p) => sum + p.amount, 0);
    if (totalPoints >= 100) {
      await awardBadgeToUser(userId, "Century Club");
      newlyAwarded.push("Century Club");
    }
  }

  return newlyAwarded;
}

async function awardBadgeToUser(userId: string, badgeName: string) {
  let badge = await db.badge.findUnique({ where: { name: badgeName } });
  if (!badge) {
    badge = await db.badge.create({
      data: {
        name: badgeName,
        description: `Achieved ${badgeName} milestone`,
        rule: { name: badgeName },
      },
    });
  }

  await db.userBadge.upsert({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
    create: { userId, badgeId: badge.id },
    update: {},
  });

  await dispatchNotification({
    userId,
    eventType: "BADGE_EARNED",
    title: "New Badge Unlocked! 🏆",
    message: `Congratulations! You unlocked the "${badgeName}" badge.`,
    deepLink: "/faculty/stars",
    metadata: { badgeId: badge.id, badgeName },
  });
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  email: string;
  designation: string | null;
  clusterName: string;
  totalPoints: number;
  completedTasks: number;
  onTimeTasks: number;
  onTimeRate: number;
  evaluationsCount: number;
  avgEvaluation: number;
  badgesCount: number;
  rank: number;
}

export async function getLiveLeaderboard(params?: {
  clusterId?: string;
  since?: Date;
}): Promise<LeaderboardEntry[]> {
  const whereUsers: Prisma.UserWhereInput = {
    deletedAt: null,
    role: { in: ["FACULTY", "CLUSTER_HEAD"] },
  };

  if (params?.clusterId) {
    whereUsers.clusterMemberships = {
      some: { clusterId: params.clusterId, leftAt: null },
    };
  }

  const users = await db.user.findMany({
    where: whereUsers,
    include: {
      clusterMemberships: {
        where: { leftAt: null },
        include: { cluster: true },
      },
      pointsLedger: {
        where: params?.since ? { createdAt: { gte: params.since } } : undefined,
      },
      assignedTasks: {
        where: {
          deletedAt: null,
          ...(params?.since ? { createdAt: { gte: params.since } } : {}),
        },
      },
      evaluationsReceived: {
        where: params?.since ? { createdAt: { gte: params.since } } : undefined,
      },
      badges: true,
    },
  });

  const entries: LeaderboardEntry[] = users.map((u) => {
    const totalPoints = u.pointsLedger.reduce((sum, p) => sum + p.amount, 0);
    const completedTasks = u.assignedTasks.filter(
      (t) => t.status === "COMPLETED"
    );
    const onTimeTasks = completedTasks.filter((t) => {
      if (!t.completedAt) return false;
      return t.completedAt.getTime() <= t.deadline.getTime();
    });

    const onTimeRate =
      completedTasks.length > 0
        ? Math.round((onTimeTasks.length / completedTasks.length) * 100)
        : 0;

    const evalRatings = u.evaluationsReceived.map((e) => e.overallRating);
    const avgEvaluation =
      evalRatings.length > 0
        ? Math.round(
            (evalRatings.reduce((sum, r) => sum + r, 0) / evalRatings.length) * 10
          ) / 10
        : 0;

    const clusterName =
      u.clusterMemberships[0]?.cluster?.name ?? "General";

    return {
      userId: u.id,
      name: u.name,
      email: u.email,
      designation: u.designation,
      clusterName,
      totalPoints,
      completedTasks: completedTasks.length,
      onTimeTasks: onTimeTasks.length,
      onTimeRate,
      evaluationsCount: u.evaluationsReceived.length,
      avgEvaluation,
      badgesCount: u.badges.length,
      rank: 0,
    };
  });

  entries.sort((a, b) => b.totalPoints - a.totalPoints || b.onTimeRate - a.onTimeRate);

  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}

export async function snapshotLeaderboard(period: string = "current_month") {
  const leaderboard = await getLiveLeaderboard();
  const today = new Date();
  const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (const entry of leaderboard) {
    await db.leaderboardSnapshot.upsert({
      where: {
        facultyId_period_date: {
          facultyId: entry.userId,
          period,
          date: dateOnly,
        },
      },
      create: {
        facultyId: entry.userId,
        rank: entry.rank,
        points: entry.totalPoints,
        period,
        date: dateOnly,
      },
      update: {
        rank: entry.rank,
        points: entry.totalPoints,
      },
    });
  }

  return { success: true, count: leaderboard.length };
}

export async function computeFacultyOfMonth(month: number, year: number) {
  const existing = await db.facultyOfMonth.findUnique({
    where: { month_year: { month, year } },
    include: { faculty: true },
  });

  if (existing) {
    return { alreadyComputed: true, award: existing };
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const monthlyRankings = await getLiveLeaderboard({ since: startDate });

  if (monthlyRankings.length === 0) {
    return { error: "No faculty performance records found for this period" };
  }

  const winner = monthlyRankings[0];

  const award = await db.facultyOfMonth.create({
    data: {
      month,
      year,
      facultyId: winner.userId,
      snapshotStats: {
        pointsEarned: winner.totalPoints,
        completedTasks: winner.completedTasks,
        onTimeRate: winner.onTimeRate,
        clusterName: winner.clusterName,
        avgEvaluation: winner.avgEvaluation,
      },
    },
    include: { faculty: true },
  });

  await dispatchNotification({
    userId: winner.userId,
    eventType: "FACULTY_OF_MONTH",
    title: "🌟 Faculty of the Month Winner!",
    message: `You have been selected as Faculty of the Month for ${month}/${year}!`,
    deepLink: "/faculty/stars",
    metadata: { month, year, points: winner.totalPoints },
  });

  return { success: true, award };
}