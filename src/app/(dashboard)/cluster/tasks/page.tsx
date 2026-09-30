import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { AssignTaskForm } from './AssignTaskForm'
import { DeleteTaskButton } from './DeleteTaskButton'
import { CheckSquare, Plus, AlertTriangle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cluster Tasks' }

export default async function ClusterTasksPage() {
  const session = await auth()
  if (!session || !['CLUSTER_HEAD', 'HOD', 'ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const clusterId = session.user.clusterId
  if (!clusterId) {
    return (
      <div className="card">
        <div className="empty-state">
          <AlertTriangle size={40} className="empty-state-icon" />
          <div className="empty-state-title">No cluster assigned</div>
        </div>
      </div>
    )
  }

  const [tasks, members] = await Promise.all([
    db.task.findMany({
      where: { clusterId, deletedAt: null },
      include: { assignedTo: true, assignedBy: true },
      orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
    }),
    db.clusterMembership.findMany({
      where: { clusterId, leftAt: null },
      include: { user: { select: { id: true, name: true, designation: true } } },
    }),
  ])

  const facultyList = members.map((m) => m.user)

  const STATUS_COLORS: Record<string, string> = {
    OPEN: '#3B82F6',
    IN_PROGRESS: '#F59E0B',
    COMPLETED: '#22C55E',
    OVERDUE: '#EF4444',
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Task Management</h2>
        <p className="page-subtitle">Assign, track, and manage tasks for your cluster.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 24 }}>
        {/* Assign Task form */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'hsl(var(--color-primary) / 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--color-primary))',
              }}
            >
              <Plus size={18} />
            </div>
            <h3 className="section-title" style={{ margin: 0 }}>
              Assign New Task
            </h3>
          </div>
          <AssignTaskForm faculty={facultyList} />
        </div>

        {/* Task list */}
        <div>
          <h3 className="section-title" style={{ marginBottom: 14 }}>
            Cluster Tasks ({tasks.length})
          </h3>

          {tasks.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <CheckSquare size={40} className="empty-state-icon" />
                <div className="empty-state-title">No tasks yet</div>
                <div className="empty-state-desc">
                  Assign your first task using the form.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((task) => (
                <div key={task.id} className="card" style={{ padding: '14px 18px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: STATUS_COLORS[task.status] ?? '#888',
                        flexShrink: 0,
                        marginTop: 6,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'hsl(var(--text-primary))',
                          marginBottom: 3,
                        }}
                      >
                        {task.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: 'hsl(var(--text-secondary))',
                          display: 'flex',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>→ {task.assignedTo.name}</span>
                        <span>Due {formatDate(task.deadline)}</span>
                        <span
                          className={`status-badge status-${task.status.toLowerCase().replace('_', '-')}`}
                          style={{ fontSize: 11 }}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                        <span
                          className={`status-badge priority-${task.priority.toLowerCase()}`}
                          style={{ fontSize: 11 }}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <DeleteTaskButton taskId={task.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
