'use server'

/**
 * Leave / CL Server Actions — Phase 2
 *
 * State machine: PENDING → APPROVED | REJECTED, plus CANCELLED (faculty only, while PENDING)
 * Every transition: audit log entry + notification via Sync Engine
 */

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import { sync } from '@/services/syncEngine'
import { LeaveStatus } from '@prisma/client'

export type ActionState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const ApplyLeaveSchema = z.object({
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid start date'),
  endDate: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid end date'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(1000),
}).refine(
  (d) => new Date(d.endDate) >= new Date(d.startDate),
  { message: 'End date must be on or after start date', path: ['endDate'] }
)

const DecideLeaveSchema = z.object({
  leaveId: z.string().cuid(),
  decision: z.enum(['APPROVED', 'REJECTED']),
  remarks: z.string().max(500).optional(),
})

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getSessionOrThrow() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session
}

// ─── Apply for Leave ──────────────────────────────────────────────────────────

export async function applyLeave(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSessionOrThrow()
  const { id: applicantId, clusterId } = session.user

  if (!clusterId) {
    return { success: false, error: 'You are not assigned to a cluster yet.' }
  }

  const parsed = ApplyLeaveSchema.safeParse({
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    reason: formData.get('reason'),
  })

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { startDate, endDate, reason } = parsed.data

  // Check for overlapping approved/pending leave
  const overlap = await db.leaveApplication.findFirst({
    where: {
      applicantId,
      status: { in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      OR: [
        {
          startDate: { lte: new Date(endDate) },
          endDate: { gte: new Date(startDate) },
        },
      ],
    },
  })

  if (overlap) {
    return {
      success: false,
      error: 'You already have a pending or approved leave overlapping these dates.',
    }
  }

  const leave = await db.leaveApplication.create({
    data: {
      applicantId,
      clusterId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: LeaveStatus.PENDING,
    },
  })

  await writeAudit({
    actorId: applicantId,
    action: 'LEAVE_APPLIED',
    entityType: 'LeaveApplication',
    entityId: leave.id,
    afterState: { startDate, endDate, reason, status: 'PENDING' },
  })

  await sync({ type: 'LEAVE_APPLIED', leaveId: leave.id, applicantId })

  revalidatePath('/faculty/leave')
  revalidatePath('/cluster/leave')

  return { success: true }
}

// ─── Decide Leave (Approve / Reject) ─────────────────────────────────────────

export async function decideLeave(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSessionOrThrow()
  const { role, id: actorId, clusterId } = session.user

  if (!['CLUSTER_HEAD', 'HOD', 'ADMIN'].includes(role)) {
    return { success: false, error: 'Forbidden: insufficient role' }
  }

  const parsed = DecideLeaveSchema.safeParse({
    leaveId: formData.get('leaveId'),
    decision: formData.get('decision'),
    remarks: formData.get('remarks') || undefined,
  })

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { leaveId, decision, remarks } = parsed.data

  const leave = await db.leaveApplication.findUnique({
    where: { id: leaveId },
  })

  if (!leave) return { success: false, error: 'Leave application not found' }
  if (leave.status !== LeaveStatus.PENDING) {
    return { success: false, error: `Leave is already ${leave.status}` }
  }

  // CLUSTER_HEAD scope — can only decide their own cluster's leaves
  if (role === 'CLUSTER_HEAD' && leave.clusterId !== clusterId) {
    return { success: false, error: 'Forbidden: not in your cluster' }
  }

  const newStatus =
    decision === 'APPROVED' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED

  await db.leaveApplication.update({
    where: { id: leaveId },
    data: {
      status: newStatus,
      remarks,
      decidedById: actorId,
      decidedAt: new Date(),
    },
  })

  await writeAudit({
    actorId,
    action: `LEAVE_${decision}`,
    entityType: 'LeaveApplication',
    entityId: leaveId,
    beforeState: { status: 'PENDING' },
    afterState: { status: newStatus, remarks, decidedAt: new Date().toISOString() },
  })

  await sync({
    type: 'LEAVE_DECIDED',
    leaveId,
    applicantId: leave.applicantId,
    status: decision,
  })

  revalidatePath('/faculty/leave')
  revalidatePath('/cluster/leave')
  revalidatePath('/hod/leave')

  return { success: true }
}

// ─── Cancel Leave (Faculty — only while PENDING) ──────────────────────────────

export async function cancelLeave(leaveId: string): Promise<ActionState> {
  const session = await getSessionOrThrow()
  const { id: actorId } = session.user

  const leave = await db.leaveApplication.findFirst({
    where: { id: leaveId, applicantId: actorId },
  })

  if (!leave) return { success: false, error: 'Leave not found' }
  if (leave.status !== LeaveStatus.PENDING) {
    return { success: false, error: 'Only PENDING leaves can be cancelled' }
  }

  await db.leaveApplication.update({
    where: { id: leaveId },
    data: { status: LeaveStatus.CANCELLED },
  })

  await writeAudit({
    actorId,
    action: 'LEAVE_CANCELLED',
    entityType: 'LeaveApplication',
    entityId: leaveId,
    beforeState: { status: 'PENDING' },
    afterState: { status: 'CANCELLED' },
  })

  revalidatePath('/faculty/leave')

  return { success: true }
}
