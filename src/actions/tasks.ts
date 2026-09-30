'use server'

/**
 * Task Server Actions — Phase 2
 *
 * Security model (per PRD §3 & Next.js docs):
 * - Every action re-authenticates via auth() — never trusts client claims
 * - Cluster Head can only assign/update tasks in their cluster
 * - HOD/Admin can operate department-wide
 * - Input validated with Zod before any DB write
 * - All mutations wrapped in writeAudit()
 */

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import { sync } from '@/services/syncEngine'
import { TaskPriority, TaskStatus } from '@prisma/client'

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const CreateTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  assignedToId: z.string().cuid('Invalid user ID'),
  priority: z.nativeEnum(TaskPriority),
  deadline: z.string().refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
})

const UpdateTaskStatusSchema = z.object({
  taskId: z.string().cuid(),
  status: z.nativeEnum(TaskStatus),
  remarks: z.string().max(1000).optional(),
  qualityRating: z.coerce.number().int().min(1).max(5).optional(),
})

export type ActionState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getSessionOrThrow() {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')
  return session
}

/** Verify a task belongs to the actor's cluster (for CLUSTER_HEAD) */
async function assertClusterAccess(taskId: string, clusterId: string) {
  const task = await db.task.findFirst({
    where: { id: taskId, clusterId, deletedAt: null },
  })
  if (!task) throw new Error('Forbidden: task not in your cluster')
  return task
}

// ─── Create Task ─────────────────────────────────────────────────────────────

export async function createTask(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSessionOrThrow()
  const { role, id: actorId, clusterId } = session.user

  if (!['CLUSTER_HEAD', 'HOD', 'ADMIN'].includes(role)) {
    return { success: false, error: 'Forbidden: insufficient role' }
  }

  const parsed = CreateTaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    assignedToId: formData.get('assignedToId'),
    priority: formData.get('priority'),
    deadline: formData.get('deadline'),
  })

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { title, description, assignedToId, priority, deadline } = parsed.data

  // Cluster Head can only assign to users in their cluster
  let effectiveClusterId = clusterId
  if (role === 'CLUSTER_HEAD') {
    if (!clusterId) return { success: false, error: 'No cluster assigned' }
    const membership = await db.clusterMembership.findFirst({
      where: { userId: assignedToId, clusterId, leftAt: null },
    })
    if (!membership) {
      return { success: false, error: 'Assignee is not in your cluster' }
    }
  } else {
    // HOD/Admin: derive cluster from the assignee
    const membership = await db.clusterMembership.findFirst({
      where: { userId: assignedToId, leftAt: null },
    })
    effectiveClusterId = membership?.clusterId ?? null
    if (!effectiveClusterId) {
      return { success: false, error: 'Assignee has no cluster' }
    }
  }

  // Narrow type — guards above guarantee this is set
  if (!effectiveClusterId) {
    return { success: false, error: 'Could not determine cluster for assignee' }
  }

  const task = await db.task.create({
    data: {
      title,
      description,
      assignedToId,
      assignedById: actorId,
      clusterId: effectiveClusterId,
      priority,
      deadline: new Date(deadline),
      status: TaskStatus.OPEN,
    },
  })

  await writeAudit({
    actorId,
    action: 'TASK_CREATED',
    entityType: 'Task',
    entityId: task.id,
    afterState: { title, assignedToId, priority, deadline },
  })

  // Sync Engine fan-out: notify assignee
  await sync({
    type: 'TASK_ASSIGNED',
    taskId: task.id,
    assignedToId,
    assignedById: actorId,
  })

  revalidatePath('/faculty/tasks')
  revalidatePath('/cluster/tasks')
  revalidatePath('/hod/tasks')

  return { success: true }
}

// ─── Update Task Status ───────────────────────────────────────────────────────

export async function updateTaskStatus(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSessionOrThrow()
  const { role, id: actorId, clusterId } = session.user

  const parsed = UpdateTaskStatusSchema.safeParse({
    taskId: formData.get('taskId'),
    status: formData.get('status'),
    remarks: formData.get('remarks') || undefined,
    qualityRating: formData.get('qualityRating') || undefined,
  })

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { taskId, status, remarks, qualityRating } = parsed.data

  // Fetch current state for audit + ownership check
  const existing = await db.task.findFirst({
    where: { id: taskId, deletedAt: null },
  })
  if (!existing) return { success: false, error: 'Task not found' }

  // CLUSTER_HEAD scope check
  if (role === 'CLUSTER_HEAD') {
    if (existing.clusterId !== clusterId) {
      return { success: false, error: 'Forbidden: task not in your cluster' }
    }
  }

  // FACULTY can only mark their own tasks as IN_PROGRESS or COMPLETED
  if (role === 'FACULTY') {
    if (existing.assignedToId !== actorId) {
      return { success: false, error: 'Forbidden: not your task' }
    }
    if (!['IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return { success: false, error: 'Faculty can only set IN_PROGRESS or COMPLETED' }
    }
  }

  const completedAt =
    status === TaskStatus.COMPLETED ? new Date() : existing.completedAt

  const updated = await db.task.update({
    where: { id: taskId },
    data: { status, remarks, qualityRating, completedAt },
  })

  await writeAudit({
    actorId,
    action: 'TASK_STATUS_UPDATED',
    entityType: 'Task',
    entityId: taskId,
    beforeState: { status: existing.status },
    afterState: { status, remarks, qualityRating },
  })

  // If completed, fan-out to sync engine (points, notifications)
  if (status === TaskStatus.COMPLETED && existing.status !== TaskStatus.COMPLETED) {
    await sync({
      type: 'TASK_COMPLETED',
      taskId,
      facultyId: existing.assignedToId,
      completedAt: completedAt!,
      deadline: existing.deadline,
    })
  }

  revalidatePath('/faculty/tasks')
  revalidatePath('/cluster/tasks')

  return { success: true }
}

// ─── Soft Delete Task (Admin/HOD/Cluster Head) ────────────────────────────────

export async function deleteTask(taskId: string): Promise<ActionState> {
  const session = await getSessionOrThrow()
  const { role, id: actorId, clusterId } = session.user

  if (!['CLUSTER_HEAD', 'HOD', 'ADMIN'].includes(role)) {
    return { success: false, error: 'Forbidden' }
  }

  const existing = await db.task.findFirst({
    where: { id: taskId, deletedAt: null },
  })
  if (!existing) return { success: false, error: 'Task not found' }

  if (role === 'CLUSTER_HEAD' && existing.clusterId !== clusterId) {
    return { success: false, error: 'Forbidden: not in your cluster' }
  }

  await db.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  })

  await writeAudit({
    actorId,
    action: 'TASK_DELETED',
    entityType: 'Task',
    entityId: taskId,
    beforeState: { title: existing.title, status: existing.status },
    afterState: { deletedAt: new Date().toISOString() },
  })

  revalidatePath('/faculty/tasks')
  revalidatePath('/cluster/tasks')

  return { success: true }
}
