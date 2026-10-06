'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sync } from '@/services/syncEngine'
import { snapshotLeaderboard, computeFacultyOfMonth } from '@/services/recognition'
import { writeAudit } from '@/lib/audit'

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
  let session: Awaited<ReturnType<typeof requireAdminOrHod>> | null = null
  try {
    session = await requireAdminOrHod()
    const now = new Date()

    const overdueTasks = await db.task.findMany({
      where: {
        deadline: { lt: now },
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        deletedAt: null,
      },
    })

    if (overdueTasks.length === 0) {
      const message = 'No new overdue tasks found.'
      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'overdue_tasks',
        afterState: {
          jobKey: 'overdue_tasks',
          jobName: 'Nightly Overdue Task Sweeper',
          success: true,
          overdueCount: 0,
          message,
        },
      }).catch(() => {})

      return { success: true, message }
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

    const message = `Successfully processed ${updated.count} overdue tasks and dispatched alerts.`

    await writeAudit({
      actorId: session.user.id,
      action: 'JOB_MANUALLY_DISPATCHED',
      entityType: 'SystemJob',
      entityId: 'overdue_tasks',
      afterState: {
        jobKey: 'overdue_tasks',
        jobName: 'Nightly Overdue Task Sweeper',
        success: true,
        overdueCount: updated.count,
        message,
      },
    }).catch(() => {})

    return {
      success: true,
      message,
      details: { count: updated.count },
    }
  } catch (err: any) {
    if (session?.user?.id) {
      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'overdue_tasks',
        afterState: {
          jobKey: 'overdue_tasks',
          jobName: 'Nightly Overdue Task Sweeper',
          success: false,
          error: err.message || 'Job failed',
        },
      }).catch(() => {})
    }
    return { success: false, message: err.message || 'Job failed' }
  }
}

export async function runLeaderboardSnapshot(): Promise<JobResult> {
  let session: Awaited<ReturnType<typeof requireAdminOrHod>> | null = null
  try {
    session = await requireAdminOrHod()
    const now = new Date()
    const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const res = await snapshotLeaderboard(currentPeriod)

    revalidatePath('/hod/leaderboard')
    revalidatePath('/cluster/leaderboard')
    revalidatePath('/faculty/leaderboard')

    const message = `Leaderboard snapshot generated for period ${currentPeriod} (${res.count} faculty records).`

    await writeAudit({
      actorId: session.user.id,
      action: 'JOB_MANUALLY_DISPATCHED',
      entityType: 'SystemJob',
      entityId: 'leaderboard_snapshot',
      afterState: {
        jobKey: 'leaderboard_snapshot',
        jobName: 'Monthly Leaderboard Snapshot',
        period: currentPeriod,
        recordsCreated: res.count,
        success: true,
        message,
      },
    }).catch(() => {})

    return {
      success: true,
      message,
      details: { count: res.count, period: currentPeriod },
    }
  } catch (err: any) {
    if (session?.user?.id) {
      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'leaderboard_snapshot',
        afterState: {
          jobKey: 'leaderboard_snapshot',
          jobName: 'Monthly Leaderboard Snapshot',
          success: false,
          error: err.message || 'Snapshot generation failed',
        },
      }).catch(() => {})
    }
    return { success: false, message: err.message || 'Snapshot generation failed' }
  }
}

export async function runMonthlyAwardComputation(month: number, year: number): Promise<JobResult> {
  let session: Awaited<ReturnType<typeof requireAdminOrHod>> | null = null
  try {
    session = await requireAdminOrHod()
    const res = await computeFacultyOfMonth(month, year)

    if (res.error) {
      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'faculty_of_month',
        afterState: {
          jobKey: 'faculty_of_month',
          jobName: 'Faculty of the Month Evaluator',
          month,
          year,
          success: false,
          error: res.error,
        },
      }).catch(() => {})
      return { success: false, message: res.error }
    }

    if (res.alreadyComputed && res.award) {
      const message = `Faculty of the Month for ${month}/${year} was already computed: ${res.award.faculty.name}.`
      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'faculty_of_month',
        afterState: {
          jobKey: 'faculty_of_month',
          jobName: 'Faculty of the Month Evaluator',
          month,
          year,
          awardId: res.award.id,
          facultyId: res.award.facultyId,
          facultyName: res.award.faculty.name,
          alreadyComputed: true,
          success: true,
          message,
        },
      }).catch(() => {})

      return {
        success: true,
        message,
        details: { awardId: res.award.id, facultyId: res.award.facultyId },
      }
    }

    if (res.success && res.award) {
      revalidatePath('/hod/faculty-of-month')
      const message = `Faculty of the Month awarded to ${res.award.faculty.name}!`
      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'faculty_of_month',
        afterState: {
          jobKey: 'faculty_of_month',
          jobName: 'Faculty of the Month Evaluator',
          month,
          year,
          awardId: res.award.id,
          facultyId: res.award.facultyId,
          facultyName: res.award.faculty.name,
          alreadyComputed: false,
          success: true,
          message,
        },
      }).catch(() => {})

      return {
        success: true,
        message,
        details: { awardId: res.award.id, facultyId: res.award.facultyId },
      }
    }

    await writeAudit({
      actorId: session.user.id,
      action: 'JOB_MANUALLY_DISPATCHED',
      entityType: 'SystemJob',
      entityId: 'faculty_of_month',
      afterState: {
        jobKey: 'faculty_of_month',
        jobName: 'Faculty of the Month Evaluator',
        month,
        year,
        success: false,
        error: 'Could not compute award.',
      },
    }).catch(() => {})

    return { success: false, message: 'Could not compute award.' }
  } catch (err: any) {
    if (session?.user?.id) {
      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'faculty_of_month',
        afterState: {
          jobKey: 'faculty_of_month',
          jobName: 'Faculty of the Month Evaluator',
          month,
          year,
          success: false,
          error: err.message || 'Award calculation failed',
        },
      }).catch(() => {})
    }
    return { success: false, message: err.message || 'Award calculation failed' }
  }
}

export async function runEmailDigestJob(digestType: 'DAILY_TASK_DIGEST' | 'WEEKLY_HOD_SUMMARY'): Promise<JobResult> {
  let session: Awaited<ReturnType<typeof requireAdminOrHod>> | null = null
  try {
    session = await requireAdminOrHod()
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

      const message = `Daily task email digest dispatched to ${sentCount} faculty members (${tasksDueToday.length} tasks pending).`

      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'email_digest',
        afterState: {
          jobKey: 'email_digest',
          jobName: 'Weekly Departmental Digest',
          digestType,
          sentCount,
          totalFaculty: activeFaculty.length,
          tasksDueToday: tasksDueToday.length,
          success: true,
          message,
        },
      }).catch(() => {})

      return {
        success: true,
        message,
        details: { sentCount, totalFaculty: activeFaculty.length },
      }
    } else {
      // WEEKLY_HOD_SUMMARY
      const totalTasks = await db.task.count({ where: { deletedAt: null } })
      const completedTasks = await db.task.count({ where: { status: 'COMPLETED', deletedAt: null } })

      const message = `Weekly Department Summary compiled: ${completedTasks}/${totalTasks} tasks completed across ${activeFaculty.length} active faculty members.`

      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'email_digest',
        afterState: {
          jobKey: 'email_digest',
          jobName: 'Weekly Departmental Digest',
          digestType,
          totalTasks,
          completedTasks,
          activeFaculty: activeFaculty.length,
          success: true,
          message,
        },
      }).catch(() => {})

      return {
        success: true,
        message,
        details: { totalTasks, completedTasks, activeFaculty: activeFaculty.length },
      }
    }
  } catch (err: any) {
    if (session?.user?.id) {
      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'email_digest',
        afterState: {
          jobKey: 'email_digest',
          jobName: 'Weekly Departmental Digest',
          digestType,
          success: false,
          error: err.message || 'Email digest dispatch failed',
        },
      }).catch(() => {})
    }
    return { success: false, message: err.message || 'Email digest dispatch failed' }
  }
}

export async function runComplianceIntegrityCheck(): Promise<JobResult> {
  let session: Awaited<ReturnType<typeof requireAdminOrHod>> | null = null
  try {
    session = await requireAdminOrHod()
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

    const message = issues.length === 0
      ? 'All compliance records pass NBA/NAAC SSR integrity verification with 0 warnings.'
      : `Compliance check completed with ${issues.length} advisory notice(s).`

    await writeAudit({
      actorId: session.user.id,
      action: 'JOB_MANUALLY_DISPATCHED',
      entityType: 'SystemJob',
      entityId: 'compliance_check',
      afterState: {
        jobKey: 'compliance_check',
        jobName: 'NBA / NAAC Compliance Validator',
        healthy: issues.length === 0,
        issues,
        facultyCount: faculty.length,
        publicationCount: publications.length,
        success: true,
        message,
      },
    }).catch(() => {})

    return {
      success: true,
      message,
      details: {
        healthy: issues.length === 0,
        issues,
        facultyCount: faculty.length,
        publicationCount: publications.length,
      },
    }
  } catch (err: any) {
    if (session?.user?.id) {
      await writeAudit({
        actorId: session.user.id,
        action: 'JOB_MANUALLY_DISPATCHED',
        entityType: 'SystemJob',
        entityId: 'compliance_check',
        afterState: {
          jobKey: 'compliance_check',
          jobName: 'NBA / NAAC Compliance Validator',
          success: false,
          error: err.message || 'Compliance check failed',
        },
      }).catch(() => {})
    }
    return { success: false, message: err.message || 'Compliance check failed' }
  }
}
