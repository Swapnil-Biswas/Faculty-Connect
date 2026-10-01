"use server";

import { auth } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { snapshotLeaderboard, computeFacultyOfMonth } from "@/services/recognition";
import { revalidatePath } from "next/cache";

export interface LeaderboardActionState {
  success: boolean;
  message?: string;
  error?: string;
}

export async function refreshLeaderboard(
  period: string,
  _prevState: LeaderboardActionState,
  _formData: FormData
): Promise<LeaderboardActionState>;
export async function refreshLeaderboard(
  period: string
): Promise<LeaderboardActionState>;
export async function refreshLeaderboard(
  period: string = "current_month",
  _prevState?: LeaderboardActionState,
  _formData?: FormData
): Promise<LeaderboardActionState> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const { role, id: actorId } = session.user;
  if (!["HOD", "ADMIN"].includes(role)) {
    return { success: false, error: "Forbidden" };
  }

  const result = await snapshotLeaderboard(period);

  await writeAudit({
    actorId,
    action: "LEADERBOARD_SNAPSHOT_CREATED",
    entityType: "LeaderboardSnapshot",
    entityId: period,
    afterState: { period, snapshotsCount: result.count },
  });

  revalidatePath("/hod/leaderboard");
  revalidatePath("/cluster/leaderboard");
  revalidatePath("/faculty/leaderboard");

  return {
    success: true,
    message: `Leaderboard snapshot generated for ${result.count} faculty members.`,
  };
}

export async function runFacultyOfMonth(
  month: number,
  year: number
): Promise<LeaderboardActionState> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const { role, id: actorId } = session.user;
  if (!["HOD", "ADMIN"].includes(role)) {
    return { success: false, error: "Forbidden" };
  }

  const result = await computeFacultyOfMonth(month, year);

  if ("error" in result && result.error) {
    return { success: false, error: result.error as string };
  }

  if ("alreadyComputed" in result && result.alreadyComputed) {
    const award = result.award as { faculty: { name: string } };
    return {
      success: true,
      message: `Faculty of the Month for ${month}/${year} is already awarded to ${award.faculty.name}.`,
    };
  }

  if ("award" in result && result.award) {
    const award = result.award as { id: string; facultyId: string; faculty: { name: string } };
    await writeAudit({
      actorId,
      action: "FACULTY_OF_MONTH_AWARDED",
      entityType: "FacultyOfMonth",
      entityId: award.id,
      afterState: { month, year, winnerId: award.facultyId, winnerName: award.faculty.name },
    });
  }

  revalidatePath("/hod/faculty-of-month");
  revalidatePath("/hod/leaderboard");
  revalidatePath("/faculty/stars");

  return {
    success: true,
    message: `Faculty of the Month successfully selected and spotlighted!`,
  };
}