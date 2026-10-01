/**
 * Sync Engine - "Enter Once, Use Everywhere"
 *
 * Every domain service (tasks, leave, recognition, publications) calls through
 * this module after a write. The engine then invalidates/updates:
 *   - Leaderboard cache & aggregates
 *   - Notification triggers
 *   - Audit log entries
 *   - Points Ledger & Badges
 */

import { db } from "@/lib/db";
import { NotificationEventType } from "@prisma/client";
import {
  getActiveScoringConfig,
  calculateTaskPoints,
  calculateEvaluationPoints,
  evaluateAndAwardBadges,
} from "@/services/recognition";

// --- Event Types --------------------------------------------------------------

export type SyncEvent =
  | {
      type: "TASK_ASSIGNED";
      taskId: string;
      assignedToId: string;
      assignedById: string;
    }
  | {
      type: "TASK_COMPLETED";
      taskId: string;
      facultyId: string;
      completedAt: Date;
      deadline: Date;
      qualityRating?: number | null;
    }
  | { type: "TASK_OVERDUE"; taskId: string; facultyId: string }
  | { type: "LEAVE_APPLIED"; leaveId: string; applicantId: string }
  | {
      type: "LEAVE_DECIDED";
      leaveId: string;
      applicantId: string;
      status: "APPROVED" | "REJECTED";
    }
  | {
      type: "EVALUATION_CREATED";
      evaluationId: string;
      facultyId: string;
      quality: number;
      contribution: number;
      initiative: number;
      overallRating: number;
    }
  | {
      type: "POINTS_AWARDED";
      facultyId: string;
      amount: number;
      source: string;
      reason: string;
      metadata?: object;
    }
  | {
      type: "ROLE_CHANGED";
      userId: string;
      actorId: string;
      oldRole: string;
      newRole: string;
    };

// --- Audit Logging ------------------------------------------------------------

export async function auditLog(params: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: object | null;
  afterState?: object | null;
  isImpersonated?: boolean;
  impersonatorId?: string;
  ipAddress?: string;
}) {
  await db.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      beforeState: params.beforeState ?? undefined,
      afterState: params.afterState ?? undefined,
      isImpersonated: params.isImpersonated ?? false,
      impersonatorId: params.impersonatorId,
      ipAddress: params.ipAddress,
    },
  });
}

// --- Notification Dispatch ----------------------------------------------------

async function isNotificationEnabled(
  eventType: NotificationEventType
): Promise<boolean> {
  const rule = await db.notificationRule.findUnique({ where: { eventType } });
  return rule?.enabled ?? true;
}

export async function dispatchNotification(params: {
  userId: string;
  eventType: NotificationEventType;
  title: string;
  message: string;
  deepLink?: string;
  metadata?: object;
}) {
  const enabled = await isNotificationEnabled(params.eventType);
  if (!enabled) return;

  await db.notification.create({
    data: {
      userId: params.userId,
      eventType: params.eventType,
      title: params.title,
      message: params.message,
      deepLink: params.deepLink,
      metadata: params.metadata,
    },
  });
}

// --- Points Ledger ------------------------------------------------------------

export async function awardPoints(params: {
  facultyId: string;
  source: string;
  amount: number;
  reason: string;
  metadata?: object;
  scoringConfigVersion?: number;
}) {
  const entry = await db.pointsLedger.create({
    data: {
      facultyId: params.facultyId,
      source: params.source,
      amount: params.amount,
      reason: params.reason,
      metadata: params.metadata,
      scoringConfigVersion: params.scoringConfigVersion,
    },
  });

  // Fan-out: notify user of points
  await dispatchNotification({
    userId: params.facultyId,
    eventType: "STARS_AWARDED",
    title: "Stars Awarded! ⭐",
    message: `You earned ${params.amount} points — ${params.reason}`,
    deepLink: "/faculty/stars",
    metadata: { amount: params.amount, source: params.source },
  });

  // Evaluate badge unlocks
  await evaluateAndAwardBadges(params.facultyId);

  return entry;
}

// --- Main Sync Engine Dispatcher ---------------------------------------------

export async function sync(event: SyncEvent): Promise<void> {
  switch (event.type) {
    case "TASK_ASSIGNED": {
      await dispatchNotification({
        userId: event.assignedToId,
        eventType: "TASK_ASSIGNED",
        title: "New Task Assigned",
        message: "You have been assigned a new task.",
        deepLink: `/faculty/tasks`,
        metadata: { taskId: event.taskId },
      });
      break;
    }

    case "TASK_COMPLETED": {
      const config = await getActiveScoringConfig();
      const calc = calculateTaskPoints({
        completedAt: event.completedAt,
        deadline: event.deadline,
        qualityRating: event.qualityRating,
        config,
      });

      await awardPoints({
        facultyId: event.facultyId,
        source: "TASK_COMPLETED",
        amount: calc.totalPoints,
        reason: `Task completed${
          calc.isEarly ? " early (+bonus)" : calc.isOnTime ? " on time" : " late"
        }`,
        metadata: {
          taskId: event.taskId,
          base: calc.basePoints,
          onTime: calc.onTimePoints,
          early: calc.earlyPoints,
          quality: calc.qualityPoints,
        },
        scoringConfigVersion: config.version,
      });
      break;
    }

    case "TASK_OVERDUE": {
      await dispatchNotification({
        userId: event.facultyId,
        eventType: "TASK_OVERDUE",
        title: "Task Overdue ⚠️",
        message: "A task has passed its deadline and is now marked overdue.",
        deepLink: `/faculty/tasks`,
        metadata: { taskId: event.taskId },
      });
      break;
    }

    case "LEAVE_APPLIED": {
      break;
    }

    case "LEAVE_DECIDED": {
      await dispatchNotification({
        userId: event.applicantId,
        eventType:
          event.status === "APPROVED" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
        title: event.status === "APPROVED" ? "Leave Approved ✅" : "Leave Rejected",
        message: `Your leave application has been ${event.status.toLowerCase()}.`,
        deepLink: `/faculty/leave`,
        metadata: { leaveId: event.leaveId },
      });
      break;
    }

    case "EVALUATION_CREATED": {
      const config = await getActiveScoringConfig();
      const points = calculateEvaluationPoints({
        quality: event.quality,
        contribution: event.contribution,
        initiative: event.initiative,
        overallRating: event.overallRating,
        config,
      });

      await awardPoints({
        facultyId: event.facultyId,
        source: "EVALUATION",
        amount: points,
        reason: `Received performance evaluation (${event.overallRating}/5 rating)`,
        metadata: {
          evaluationId: event.evaluationId,
          quality: event.quality,
          contribution: event.contribution,
          initiative: event.initiative,
          overallRating: event.overallRating,
        },
        scoringConfigVersion: config.version,
      });

      await dispatchNotification({
        userId: event.facultyId,
        eventType: "EVALUATION_RECEIVED",
        title: "New Evaluation Received ⭐",
        message: `You received an evaluation with an overall score of ${event.overallRating}/5 (${points} points awarded).`,
        deepLink: `/faculty/stars`,
        metadata: { evaluationId: event.evaluationId },
      });
      break;
    }

    case "POINTS_AWARDED": {
      await awardPoints({
        facultyId: event.facultyId,
        source: event.source,
        amount: event.amount,
        reason: event.reason,
        metadata: event.metadata,
      });
      break;
    }

    case "ROLE_CHANGED": {
      await dispatchNotification({
        userId: event.userId,
        eventType: "ROLE_CHANGED",
        title: "Role Updated",
        message: `Your role has been updated from ${event.oldRole} to ${event.newRole}.`,
      });
      break;
    }
  }
}