"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

const ScoringConfigSchema = z.object({
  onTimeWeight: z.coerce.number().min(0).max(1),
  earlyWeight: z.coerce.number().min(0).max(1),
  completionRateWeight: z.coerce.number().min(0).max(1),
  streakWeight: z.coerce.number().min(0).max(1),
  qualityWeight: z.coerce.number().min(0).max(1),
  contributionWeight: z.coerce.number().min(0).max(1),
  initiativeWeight: z.coerce.number().min(0).max(1),
  overallRatingWeight: z.coerce.number().min(0).max(1),
});

export type ScoringActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateScoringConfig(
  _prevState: ScoringActionState,
  formData: FormData
): Promise<ScoringActionState> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const { role, id: actorId } = session.user;
  if (!["ADMIN", "HOD"].includes(role)) {
    return { success: false, error: "Forbidden: Only Admin or HOD can update scoring weights" };
  }

  const parsed = ScoringConfigSchema.safeParse({
    onTimeWeight: formData.get("onTimeWeight"),
    earlyWeight: formData.get("earlyWeight"),
    completionRateWeight: formData.get("completionRateWeight"),
    streakWeight: formData.get("streakWeight"),
    qualityWeight: formData.get("qualityWeight"),
    contributionWeight: formData.get("contributionWeight"),
    initiativeWeight: formData.get("initiativeWeight"),
    overallRatingWeight: formData.get("overallRatingWeight"),
  });

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const w = parsed.data;

  const current = await db.scoringConfig.findFirst({
    where: { isActive: true },
    orderBy: { version: "desc" },
  });

  const nextVersion = current ? current.version + 1 : 1;

  await db.scoringConfig.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  const newConfig = await db.scoringConfig.create({
    data: {
      version: nextVersion,
      setByAdminId: actorId,
      isActive: true,
      onTimeWeight: w.onTimeWeight,
      earlyWeight: w.earlyWeight,
      completionRateWeight: w.completionRateWeight,
      streakWeight: w.streakWeight,
      qualityWeight: w.qualityWeight,
      contributionWeight: w.contributionWeight,
      initiativeWeight: w.initiativeWeight,
      overallRatingWeight: w.overallRatingWeight,
    },
  });

  await writeAudit({
    actorId,
    action: "SCORING_CONFIG_UPDATED",
    entityType: "ScoringConfig",
    entityId: newConfig.id,
    beforeState: current
      ? { configVersion: current.version, previousConfig: true }
      : null,
    afterState: {
      configVersion: nextVersion,
      onTimeWeight: w.onTimeWeight,
      earlyWeight: w.earlyWeight,
      completionRateWeight: w.completionRateWeight,
      streakWeight: w.streakWeight,
      qualityWeight: w.qualityWeight,
      contributionWeight: w.contributionWeight,
      initiativeWeight: w.initiativeWeight,
      overallRatingWeight: w.overallRatingWeight,
    },
  });

  revalidatePath("/admin/scoring");
  revalidatePath("/hod/scoring");
  revalidatePath("/faculty/stars");

  return { success: true };
}