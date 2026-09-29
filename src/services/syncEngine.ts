/**
 * Sync Engine — "Enter Once, Use Everywhere"
 *
 * Every domain service (tasks, leave, recognition, publications) calls through
 * this module after a write. The engine then invalidates/updates:
 *   - Leaderboard cache
 *   - Dashboard aggregates
 *   - Notification triggers
 *   - Audit log entries
 *
 * Phase 1: skeleton with event bus pattern. Real implementations added per phase.
 * Phase 2+: BullMQ queues replace the synchronous fan-out below.
 */

import { db } from "@/lib/db";
import { NotificationEventType } from "@prisma/client";

// --- Event Types --------------------------------------------------------------

export type SyncEvent =
  | { type: "TASK_ASSIGNED"; taskId: string; assignedToId: string; assignedById: string }
  | { type: "TASK_COMPLETED"; taskId: string; facultyId: string; completedAt: Date; deadline: Date }
  | { type: "TASK_OVERDUE"; taskId: string; facultyId: string }
  | { type: "LEAVE_APPLIED"; leaveId: string; applicantId: string }
  | { type: "LEAVE_DECIDED"; leaveId: string; applicantId: string; status: "APPROVED" | "REJECTED" }
  | { type: "EVALUATION_CREATED"; evaluationId: string; facultyId: string }
  | { type: "POINTS_AWARDED"; facultyId: string; amount: number; source: string; reason: string }
  | { type: "ROLE_CHANGED"; userId: string; actorId: string; oldRole: string; newRole: string };

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

async function isNotificationEnabled(eventType: NotificationEventType): Promise<boolean> {
  const rule = await db.notificationRule.findUnique({ where: { eventType } });
  return rule?.enabled ?? true; // default: enabled
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
    title: "Points Awarded! ?",
    message: `You earned ${params.amount} points — ${params.reason}`,
    metadata: { amount: params.amount, source: params.source },
  });

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
        deepLink: `/faculty/tasks/${event.taskId}`,
        metadata: { taskId: event.taskId },
      });
      break;
    }

    case "TASK_COMPLETED": {
      const isOnTime = event.completedAt <= event.deadline;
      const isEarly =
        event.deadline.getTime() - event.completedAt.getTime() > 24 * 60 * 60 * 1000;

      // Get active scoring config
      const config = await db.scoringConfig.findFirst({
        where: { isActive: true },
        orderBy: { version: "desc" },
      });

      let points = 10; // base points
      if (isOnTime) points += config ? config.onTimeWeight * 100 : 20;
      if (isEarly) points += config ? config.earlyWeight * 100 : 10;

      await awardPoints({
        facultyId: event.facultyId,
        source: "TASK_COMPLETED",
        amount: points,
        reason: `Task completed${isEarly ? " early" : isOnTime ? " on time" : " late"}`,
        metadata: { taskId: event.taskId, isOnTime, isEarly },
        scoringConfigVersion: config?.version,
      });
      break;
    }

    case "TASK_OVERDUE": {
      await dispatchNotification({
        userId: event.facultyId,
        eventType: "TASK_OVERDUE",
        title: "Task Overdue ??",
        message: "A task has passed its deadline and is now marked overdue.",
        deepLink: `/faculty/tasks/${event.taskId}`,
        metadata: { taskId: event.taskId },
      });
      break;
    }

    case "LEAVE_APPLIED": {
      // Notify cluster head — Phase 2 will resolve cluster head from task assignment
      break;
    }

    case "LEAVE_DECIDED": {
      await dispatchNotification({
        userId: event.applicantId,
        eventType: event.status === "APPROVED" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
        title: event.status === "APPROVED" ? "Leave Approved ?" : "Leave Rejected",
        message: `Your leave application has been ${event.status.toLowerCase()}.`,
        deepLink: `/faculty/leave/${event.leaveId}`,
        metadata: { leaveId: event.leaveId },
      });
      break;
    }

    case "EVALUATION_CREATED": {
      await dispatchNotification({
        userId: event.facultyId,
        eventType: "EVALUATION_RECEIVED",
        title: "New Evaluation",
        message: "You have received a new performance evaluation.",
        deepLink: `/faculty/evaluations`,
        metadata: { evaluationId: event.evaluationId },
      });
      break;
    }

    case "ROLE_CHANGED": {
      await dispatchNotification({
        userId: event.userId,
        eventType: "ROLE_CHANGED",
        title: "Role Updated",
        message: `Your role has been changed from ${event.oldRole} to ${event.newRole}.`,
      });
      break;
    }
  }
}
