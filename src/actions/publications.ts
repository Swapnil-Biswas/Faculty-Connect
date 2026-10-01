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

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session
}

const PublicationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(300),
  type: z.enum(['JOURNAL', 'CONFERENCE', 'BOOK_CHAPTER', 'PATENT', 'OTHER']),
  journal: z.string().max(200).optional().nullable(),
  conference: z.string().max(200).optional().nullable(),
  year: z.number().min(1950).max(new Date().getFullYear() + 1),
  doi: z.string().max(100).optional().nullable(),
})

export async function createPublication(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireUser()

    const yearRaw = formData.get('year') as string
    const journalRaw = formData.get('journal') as string
    const conferenceRaw = formData.get('conference') as string
    const doiRaw = formData.get('doi') as string

    const parsed = PublicationSchema.safeParse({
      title: formData.get('title'),
      type: formData.get('type'),
      journal: journalRaw && journalRaw.trim() !== '' ? journalRaw : null,
      conference: conferenceRaw && conferenceRaw.trim() !== '' ? conferenceRaw : null,
      year: parseInt(yearRaw, 10),
      doi: doiRaw && doiRaw.trim() !== '' ? doiRaw : null,
    })

    if (!parsed.success) {
      return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
    }

    const { title, type, journal, conference, year, doi } = parsed.data

    const pub = await db.publication.create({
      data: {
        authorId: session.user.id,
        title,
        type,
        journal,
        conference,
        year,
        doi,
      },
    })

    // Award recognition points for research publication
    const pointsAmount = type === 'JOURNAL' ? 15 : type === 'PATENT' ? 25 : 10
    await db.pointsLedger.create({
      data: {
        facultyId: session.user.id,
        source: 'RESEARCH_PUBLICATION',
        amount: pointsAmount,
        reason: `Published research: ${title.slice(0, 50)}...`,
        metadata: { publicationId: pub.id, type, year },
      },
    })

    await writeAudit({
      actorId: session.user.id,
      action: 'PUBLICATION_CREATED',
      entityType: 'Publication',
      entityId: pub.id,
      afterState: { title, type, year, doi },
    })

    revalidatePath('/faculty/publications')
    revalidatePath('/faculty/stars')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add publication' }
  }
}

export async function deletePublication(publicationId: string): Promise<ActionState> {
  try {
    const session = await requireUser()

    const pub = await db.publication.findUnique({
      where: { id: publicationId },
    })

    if (!pub) return { success: false, error: 'Publication not found' }
    if (pub.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return { success: false, error: 'Forbidden: You can only delete your own publications' }
    }

    await db.publication.update({
      where: { id: publicationId },
      data: { deletedAt: new Date() },
    })

    await writeAudit({
      actorId: session.user.id,
      action: 'PUBLICATION_DELETED',
      entityType: 'Publication',
      entityId: publicationId,
      beforeState: { title: pub.title },
    })

    revalidatePath('/faculty/publications')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete publication' }
  }
}
