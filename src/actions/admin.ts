'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export type ActionState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin only')
  }
  return session
}

// ─── Create User ──────────────────────────────────────────────────────────────

const CreateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(Role),
  designation: z.string().max(100).optional(),
})

export async function createUser(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin()

  const parsed = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
    designation: formData.get('designation') || undefined,
  })

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { name, email, password, role, designation } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: 'A user with this email already exists.' }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await db.user.create({
    data: { name, email, passwordHash, role, designation },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'USER_CREATED',
    entityType: 'User',
    entityId: user.id,
    afterState: { name, email, role, designation },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Update Role ───────────────────────────────────────────────────────────────

const UpdateRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.nativeEnum(Role),
  clusterId: z.string().cuid().optional().nullable(),
})

export async function updateUserRole(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin()

  const parsed = UpdateRoleSchema.safeParse({
    userId: formData.get('userId'),
    role: formData.get('role'),
    clusterId: formData.get('clusterId') || null,
  })

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { userId, role, clusterId } = parsed.data

  if (userId === session.user.id) {
    return { success: false, error: 'You cannot change your own role.' }
  }

  const existing = await db.user.findUnique({ where: { id: userId } })
  if (!existing) return { success: false, error: 'User not found' }

  await db.user.update({ where: { id: userId }, data: { role } })

  // If becoming CLUSTER_HEAD and clusterId provided, update or create membership
  if (role === 'CLUSTER_HEAD' && clusterId) {
    await db.cluster.update({
      where: { id: clusterId },
      data: { headId: userId },
    })
  }

  await writeAudit({
    actorId: session.user.id,
    action: 'USER_ROLE_UPDATED',
    entityType: 'User',
    entityId: userId,
    beforeState: { role: existing.role },
    afterState: { role },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Soft Delete User ─────────────────────────────────────────────────────────

export async function softDeleteUser(userId: string): Promise<ActionState> {
  const session = await requireAdmin()

  if (userId === session.user.id) {
    return { success: false, error: 'You cannot delete your own account.' }
  }

  const existing = await db.user.findUnique({ where: { id: userId } })
  if (!existing) return { success: false, error: 'User not found' }
  if (existing.deletedAt) return { success: false, error: 'User already deleted' }

  await db.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'USER_SOFT_DELETED',
    entityType: 'User',
    entityId: userId,
    beforeState: { name: existing.name, email: existing.email },
    afterState: { deletedAt: new Date().toISOString() },
  })

  revalidatePath('/admin/users')
  return { success: true }
}

// ─── Assign User to Cluster ───────────────────────────────────────────────────

const AssignClusterSchema = z.object({
  userId: z.string().cuid(),
  clusterId: z.string().cuid(),
})

export async function assignUserToCluster(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireAdmin()

  const parsed = AssignClusterSchema.safeParse({
    userId: formData.get('userId'),
    clusterId: formData.get('clusterId'),
  })

  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { userId, clusterId } = parsed.data

  // Close existing memberships
  await db.clusterMembership.updateMany({
    where: { userId, leftAt: null },
    data: { leftAt: new Date() },
  })

  // Create new membership
  await db.clusterMembership.create({
    data: { userId, clusterId },
  })

  await writeAudit({
    actorId: session.user.id,
    action: 'USER_ASSIGNED_TO_CLUSTER',
    entityType: 'ClusterMembership',
    entityId: `${userId}:${clusterId}`,
    afterState: { userId, clusterId },
  })

  revalidatePath('/admin/users')
  return { success: true }
}
