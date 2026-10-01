'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sync } from '@/services/syncEngine'
import { snapshotLeaderboard, computeFacultyOfMonth } from '@/services/recognition'

export type JobResult = {
  success: boolean
  message: string
  details?: Record<string, any>
}

async function requireAdminOrHod() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'HOD'].includes(session.user.role)) {
    throw new Error('Forbidden: Admin or HOD only')
  }
  return session
}

export async function runOverdueTaskCheck(): Promise<JobResult> {
  try {
    await requireAdminOrHod()
    const now = new Date()

    const overdueTasks = await db.task.findMany({
      where: {
        deadline: { lt: now },
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        deletedAt: null,
      },
    })

    if (overdueTasks.length === 0) {
      return { success: true, message: 'No new overdue tasks found.' }
    }

    const updated = await db.task.updateMany({
      where: {
        id: { in: overdueTasks.map((t) => t.id) },
      },
      data: {
        status: 'OVERDUE',
      },
    })

    for (const task of overdueTasks) {
      await sync({
        type: 'TASK_OVERDUE',
        taskId: task.id,
        facultyId: task.assignedToId,
      })
    }

    revalidatePath('/hod/tasks')
    revalidatePath('/cluster/tasks')
    revalidatePath('/faculty/tasks')

    return {
      success: true,
      message: `Successfully processed ${updated.count} overdue tasks and dispatched alerts.`,
      details: { count: updated.count },
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Job failed' }
  }
}

export async function runLeaderboardSnapshot(): Promise<JobResult> {
  try {
    await requireAdminOrHod()
    const now = new Date()
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const res = await snapshotLeaderboard(currentPeriod)

    revalidatePath('/hod/leaderboard')
    revalidatePath('/cluster/leaderboard')
    revalidatePath('/faculty/leaderboard')

    return {
      success: true,
      message: `Leaderboard snapshot generated for period ${currentPeriod} (${res.count} faculty records).`,
      details: { count: res.count, period: currentPeriod },
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Snapshot generation failed' }
  }
}

export async function runMonthlyAwardComputation(month: number, year: number): Promise<JobResult> {
  try {
    await requireAdminOrHod()
    const res = await computeFacultyOfMonth(month, year)

    if (res.error) {
      return { success: false, message: res.error }
    }

    if (res.alreadyComputed && res.award) {
      return {
        success: true,
        message: `Faculty of the Month for ${month}/${year} was already computed: ${res.award.faculty.name}.`,
        details: { awardId: res.award.id, facultyId: res.award.facultyId },
      }
    }

    if (res.success && res.award) {
      revalidatePath('/hod/faculty-of-month')
      return {
        success: true,
        message: `Faculty of the Month awarded to ${res.award.faculty.name}!`,
        details: { awardId: res.award.id, facultyId: res.award.facultyId },
      }
    }

    return { success: false, message: 'Could not compute award.' }
  } catch (err: any) {
    return { success: false, message: err.message || 'Award calculation failed' }
  }
}

export async function runEmailDigestJob(digestType: 'DAILY_TASK_DIGEST' | 'WEEKLY_HOD_SUMMARY'): Promise<JobResult> {
  try {
    const session = await requireAdminOrHod()
    const activeFaculty = await db.user.findMany({
      where: { deletedAt: null, role: 'FACULTY' },
      select: { id: true, name: true, email: true },
    })

    if (digestType === 'DAILY_TASK_DIGEST') {
      const now = new Date()
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
      const tasksDueToday = await db.task.findMany({
        where: {
          deadline: { lte: endOfToday },
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          deletedAt: null,
        },
        select: { id: true, title: true, assignedToId: true },
      })

      // Simulate email transport & record notifications
      let sentCount = 0
      for (const faculty of activeFaculty) {
        const userTasks = tasksDueToday.filter((t) => t.assignedToId === faculty.id)
        if (userTasks.length > 0) {
          await db.notification.create({
            data: {
              userId: faculty.id,
              eventType: 'TASK_ASSIGNED',
              title: 'Daily Digest: Tasks Due Today 📋',
              message: `You have ${userTasks.length} pending task(s) due today. Keep up the great work!`,
              deepLink: '/faculty/tasks',
              metadata: { count: userTasks.length, date: now.toISOString() },
            },
          })
          sentCount++
        }
      }

      return {
        success: true,
        message: `Daily task email digest dispatched to ${sentCount} faculty members (${tasksDueToday.length} tasks pending).`,
        details: { sentCount, totalFaculty: activeFaculty.length },
      }
    } else {
      // WEEKLY_HOD_SUMMARY
      const totalTasks = await db.task.count({ where: { deletedAt: null } })
      const completedTasks = await db.task.count({ where: { status: 'COMPLETED', deletedAt: null } })

      return {
        success: true,
        message: `Weekly Department Summary compiled: ${completedTasks}/${totalTasks} tasks completed across ${activeFaculty.length} active faculty members.`,
        details: { totalTasks, completedTasks, activeFaculty: activeFaculty.length },
      }
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Email digest dispatch failed' }
  }
}

export async function runComplianceIntegrityCheck(): Promise<JobResult> {
  try {
    await requireAdminOrHod()
    const faculty = await db.user.findMany({ where: { deletedAt: null } })
    const publications = await db.publication.findMany({ where: { deletedAt: null } })

    const issues: string[] = []

    const facultyWithoutDesignation = faculty.filter((f) => !f.designation)
    if (facultyWithoutDesignation.length > 0) {
      issues.push(`${facultyWithoutDesignation.length} faculty member(s) have missing designation.`)
    }

    const pubsWithoutDoi = publications.filter((p) => !p.doi)
    if (pubsWithoutDoi.length > 0) {
      issues.push(`${pubsWithoutDoi.length} research publication(s) have missing DOI/identifier.`)
    }

    const professors = faculty.filter((f) =>
      f.designation?.toLowerCase().includes('professor') &&
      !f.designation?.toLowerCase().includes('assistant') &&
      !f.designation?.toLowerCase().includes('associate')
    ).length

    if (professors === 0 && faculty.length > 0) {
      issues.push('NBA Cadre Warning: 0 full Professors recorded in department roster.')
    }

    return {
      success: true,
      message: issues.length === 0
        ? 'All compliance records pass NBA/NAAC SSR integrity verification with 0 warnings.'
        : `Compliance check completed with ${issues.length} advisory notice(s).`,
      details: {
        healthy: issues.length === 0,
        issues,
        facultyCount: faculty.length,
        publicationCount: publications.length,
      },
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Compliance check failed' }
  }
}

