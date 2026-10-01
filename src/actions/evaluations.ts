"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeAudit } from "@/lib/audit";
import { sync } from "@/services/syncEngine";
import { revalidatePath } from "next/cache";

const CreateEvaluationSchema = z.object({
  facultyId: z.string().min(1, "Faculty member is required"),
  period: z.string().min(1, "Evaluation period is required").max(50),
  quality: z.coerce.number().int().min(1).max(5),
  contribution: z.coerce.number().int().min(1).max(5),
  initiative: z.coerce.number().int().min(1).max(5),
  overallRating: z.coerce.number().int().min(1).max(5),
  remarks: z.string().max(1000).optional(),
});

export type EvaluationActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createEvaluation(
  _prevState: EvaluationActionState,
  formData: FormData
): Promise<EvaluationActionState> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const { role, id: evaluatorId, clusterId } = session.user;
  if (!["CLUSTER_HEAD", "HOD", "ADMIN"].includes(role)) {
    return { success: false, error: "Forbidden: Insufficient role to evaluate faculty" };
  }

  const parsed = CreateEvaluationSchema.safeParse({
    facultyId: formData.get("facultyId"),
    period: formData.get("period"),
    quality: formData.get("quality"),
    contribution: formData.get("contribution"),
    initiative: formData.get("initiative"),
    overallRating: formData.get("overallRating"),
    remarks: formData.get("remarks") || undefined,
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { facultyId, period, quality, contribution, initiative, overallRating, remarks } =
    parsed.data;

  // Cannot evaluate yourself
  if (facultyId === evaluatorId) {
    return { success: false, error: "You cannot evaluate yourself" };
  }

  // If Cluster Head, target faculty must be in their cluster
  if (role === "CLUSTER_HEAD") {
    if (!clusterId) return { success: false, error: "No cluster assigned to you" };
    const membership = await db.clusterMembership.findFirst({
      where: { userId: facultyId, clusterId, leftAt: null },
    });
    if (!membership) {
      return { success: false, error: "Faculty member is not in your cluster" };
    }
  }

  const evaluation = await db.evaluation.create({
    data: {
      evaluatorId,
      facultyId,
      period,
      quality,
      contribution,
      initiative,
      overallRating,
      remarks,
    },
  });

  await writeAudit({
    actorId: evaluatorId,
    action: "EVALUATION_CREATED",
    entityType: "Evaluation",
    entityId: evaluation.id,
    afterState: {
      facultyId,
      period,
      quality,
      contribution,
      initiative,
      overallRating,
      remarks,
    },
  });

  // Fan-out to syncEngine (points calculation, notification, badge checks)
  await sync({
    type: "EVALUATION_CREATED",
    evaluationId: evaluation.id,
    facultyId,
    quality,
    contribution,
    initiative,
    overallRating,
  });

  revalidatePath("/cluster/evaluations");
  revalidatePath("/hod/leaderboard");
  revalidatePath("/faculty/stars");

  return { success: true };
}