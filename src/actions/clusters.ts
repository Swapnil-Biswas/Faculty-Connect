'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeAudit } from '@/lib/audit'
import { z } from 'zod'

export type ActionState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

async function requireAdminOrHod() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'HOD'].includes(session.user.role)) {
    throw new Error('Forbidden: Admin or HOD only')
  }
  return session
}

const ClusterSchema = z.object({
  name: z.string().min(2, 'Cluster name must be at least 2 characters').max(100),
  description: z.string().max(255).optional(),
  headId: z.string().cuid().optional().nullable(),
})

export async function createCluster(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireAdminOrHod()

    const headIdRaw = formData.get('headId') as string
    const parsed = ClusterSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      headId: headIdRaw && headIdRaw !== 'none' ? headIdRaw : null,
    })

    if (!parsed.success) {
      return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
    }

    const { name, description, headId } = parsed.data

    const cluster = await db.cluster.create({
      data: {
        name,
        description: description ?? null,
        headId: headId ?? null,
      },
    })

    // If headId assigned, ensure their role is CLUSTER_HEAD and they are a member
    if (headId) {
      await db.user.update({
        where: { id: headId },
        data: { role: 'CLUSTER_HEAD' },
      })

      await db.clusterMembership.upsert({
        where: { userId_clusterId: { userId: headId, clusterId: cluster.id } },
        create: { userId: headId, clusterId: cluster.id },
        update: { leftAt: null },
      })
    }

    await writeAudit({
      actorId: session.user.id,
      action: 'CLUSTER_CREATED',
      entityType: 'Cluster',
      entityId: cluster.id,
      afterState: { name, description, headId },
    })

    revalidatePath('/admin/clusters')
    revalidatePath('/hod/clusters')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create cluster' }
  }
}

export async function updateCluster(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireAdminOrHod()

    const id = formData.get('id') as string
    if (!id) return { success: false, error: 'Cluster ID required' }

    const headIdRaw = formData.get('headId') as string
    const parsed = ClusterSchema.safeParse({
      name: formData.get('name'),
      description: formData.get('description') || undefined,
      headId: headIdRaw && headIdRaw !== 'none' ? headIdRaw : null,
    })

    if (!parsed.success) {
      return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
    }

    const { name, description, headId } = parsed.data
    const existing = await db.cluster.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Cluster not found' }

    await db.cluster.update({
      where: { id },
      data: {
        name,
        description: description ?? null,
        headId: headId ?? null,
      },
    })

    if (headId && headId !== existing.headId) {
      await db.user.update({
        where: { id: headId },
        data: { role: 'CLUSTER_HEAD' },
      })

      await db.clusterMembership.upsert({
        where: { userId_clusterId: { userId: headId, clusterId: id } },
        create: { userId: headId, clusterId: id },
        update: { leftAt: null },
      })
    }

    await writeAudit({
      actorId: session.user.id,
      action: 'CLUSTER_UPDATED',
      entityType: 'Cluster',
      entityId: id,
      beforeState: { name: existing.name, headId: existing.headId },
      afterState: { name, description, headId },
    })

    revalidatePath('/admin/clusters')
    revalidatePath('/hod/clusters')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update cluster' }
  }
}

export async function deleteCluster(clusterId: string): Promise<ActionState> {
  try {
    const session = await requireAdminOrHod()

    const existing = await db.cluster.findUnique({
      where: { id: clusterId },
      include: { members: { where: { leftAt: null } } },
    })

    if (!existing) return { success: false, error: 'Cluster not found' }

    // If there are members, don't allow hard delete or close them
    if (existing.members.length > 0) {
      return {
        success: false,
        error: `Cannot delete cluster with ${existing.members.length} active members. Reassign members first.`,
      }
    }

    await db.cluster.delete({ where: { id: clusterId } })

    await writeAudit({
      actorId: session.user.id,
      action: 'CLUSTER_DELETED',
      entityType: 'Cluster',
      entityId: clusterId,
      beforeState: { name: existing.name },
    })

    revalidatePath('/admin/clusters')
    revalidatePath('/hod/clusters')
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete cluster' }
  }
}
