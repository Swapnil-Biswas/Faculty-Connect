'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import { NotificationEventType } from '@prisma/client'
import { z } from 'zod'

export type ActionState = {
  success: boolean
  error?: string
}

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function markNotificationAsRead(notificationId: string): Promise<ActionState> {
  try {
    const session = await requireUser()

    await db.notification.updateMany({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    revalidatePath('/faculty/notifications')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to mark notification as read' }
  }
}

export async function markAllNotificationsAsRead(): Promise<ActionState> {
  try {
    const session = await requireUser()

    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    revalidatePath('/faculty/notifications')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to mark all as read' }
  }
}

export async function deleteNotification(notificationId: string): Promise<ActionState> {
  try {
    const session = await requireUser()

    await db.notification.deleteMany({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    })

    revalidatePath('/faculty/notifications')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete notification' }
  }
}

const UpdateRuleSchema = z.object({
  eventType: z.nativeEnum(NotificationEventType),
  enabled: z.boolean(),
  threshold: z.number().nullable().optional(),
})

export async function updateNotificationRule(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireUser()
    if (session.user.role !== 'ADMIN') {
      return { success: false, error: 'Forbidden: Admin only' }
    }

    const eventTypeStr = formData.get('eventType') as string
    const enabled = formData.get('enabled') === 'true'
    const thresholdRaw = formData.get('threshold')
    const threshold = thresholdRaw ? parseInt(thresholdRaw as string, 10) : null

    const parsed = UpdateRuleSchema.safeParse({
      eventType: eventTypeStr,
      enabled,
      threshold,
    })

    if (!parsed.success) {
      return { success: false, error: 'Invalid form data' }
    }

    const existing = await db.notificationRule.findUnique({
      where: { eventType: parsed.data.eventType },
    })

    const rule = await db.notificationRule.upsert({
      where: { eventType: parsed.data.eventType },
      create: {
        eventType: parsed.data.eventType,
        enabled: parsed.data.enabled,
        threshold: parsed.data.threshold ?? null,
      },
      update: {
        enabled: parsed.data.enabled,
        threshold: parsed.data.threshold ?? null,
      },
    })

    await writeAudit({
      actorId: session.user.id,
      action: 'NOTIFICATION_RULE_UPDATED',
      entityType: 'NotificationRule',
      entityId: rule.id,
      beforeState: existing
        ? {
            eventType: existing.eventType,
            enabled: existing.enabled,
            threshold: existing.threshold,
          }
        : null,
      afterState: {
        eventType: rule.eventType,
        enabled: rule.enabled,
        threshold: rule.threshold,
      },
    })

    revalidatePath('/admin/notifications')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update rule' }
  }
}
