import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { UpdateTaskStatusForm } from './UpdateTaskStatusForm'
import { CheckSquare, Clock, AlertTriangle, CheckCircle2, Circle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Tasks' }

const STATUS_CONFIG = {
  OPEN: { label: 'Open', icon: Circle, color: 'status-open' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'status-in-progress' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'status-completed' },
  OVERDUE: { label: 'Overdue', icon: AlertTriangle, color: 'status-overdue' },
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', color: 'priority-low' },
  MEDIUM: { label: 'Medium', color: 'priority-medium' },
  HIGH: { label: 'High', color: 'priority-high' },
  CRITICAL: { label: 'Critical', color: 'priority-critical' },
}

export default async function FacultyTasksPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const userId = session.user.id

  const tasks = await db.task.findMany({
    where: { assignedToId: userId, deletedAt: null },
    include: { assignedBy: true },
    orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
  })

  const counts = {
    open: tasks.filter((t) => t.status === 'OPEN').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    overdue: tasks.filter((t) => t.status === 'OVERDUE').length,
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">My Tasks</h2>
        <p className="page-subtitle">Track and update your assigned tasks.</p>
      </div>

      {/* Summary bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Open', count: counts.open, color: '#3B82F6' },
          { label: 'In Progress', count: counts.inProgress, color: '#F59E0B' },
          { label: 'Completed', count: counts.completed, color: '#22C55E' },
          { label: 'Overdue', count: counts.overdue, color: '#EF4444' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'hsl(var(--bg-surface))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: s.color,
                display: 'inline-block',
              }}
            />
            {s.count} {s.label}
          </div>
        ))}
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CheckSquare size={48} className="empty-state-icon" />
            <div className="empty-state-title">No tasks assigned</div>
            <div className="empty-state-desc">
              Your cluster head will assign tasks here. Check back later.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tasks.map((task) => {
            const statusCfg = STATUS_CONFIG[task.status]
            const priorityCfg = PRIORITY_CONFIG[task.priority]
            const isOverdue =
              task.status !== 'COMPLETED' && new Date(task.deadline) < new Date()
            const daysLeft = Math.ceil(
              (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )

            return (
              <div key={task.id} className="card" style={{ padding: '20px 24px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                  }}
                >
                  {/* Left: info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 6,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: 'hsl(var(--text-primary))',
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                        }}
                      >
                        {task.title}
                      </span>
                      <span className={`status-badge ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`status-badge ${priorityCfg.color}`}>
                        {priorityCfg.label}
                      </span>
                    </div>

                    {task.description && (
                      <p
                        style={{
                          fontSize: 13.5,
                          color: 'hsl(var(--text-secondary))',
                          marginBottom: 10,
                          lineHeight: 1.5,
                        }}
                      >
                        {task.description}
                      </p>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        gap: 18,
                        fontSize: 12.5,
                        color: 'hsl(var(--text-muted))',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={13} />
                        Due: {formatDate(task.deadline)}
                        {task.status !== 'COMPLETED' && (
                          <span
                            style={{
                              marginLeft: 4,
                              color: isOverdue
                                ? 'hsl(var(--color-danger))'
                                : daysLeft <= 3
                                ? 'hsl(var(--color-warning))'
                                : 'hsl(var(--color-success))',
                              fontWeight: 600,
                            }}
                          >
                            {isOverdue
                              ? `${Math.abs(daysLeft)}d overdue`
                              : `${daysLeft}d left`}
                          </span>
                        )}
                      </span>
                      <span>Assigned by: {task.assignedBy.name}</span>
                      {task.completedAt && (
                        <span style={{ color: 'hsl(var(--color-success))' }}>
                          ✓ Completed {formatDate(task.completedAt)}
                        </span>
                      )}
                    </div>

                    {task.remarks && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: '8px 12px',
                          background: 'hsl(var(--bg-subtle))',
                          borderRadius: 8,
                          fontSize: 12.5,
                          color: 'hsl(var(--text-secondary))',
                          fontStyle: 'italic',
                        }}
                      >
                        💬 {task.remarks}
                      </div>
                    )}
                  </div>

                  {/* Right: status update form */}
                  {task.status !== 'COMPLETED' && (
                    <div style={{ flexShrink: 0 }}>
                      <UpdateTaskStatusForm
                        taskId={task.id}
                        currentStatus={task.status}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
