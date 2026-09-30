import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, getInitials } from '@/lib/utils'
import { AssignTaskForm } from './AssignTaskForm'
import { CheckSquare, Plus, Filter } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Department Tasks — HOD' }

export default async function HodTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ cluster?: string; status?: string; priority?: string }>
}) {
  const session = await auth()
  if (!session || !['HOD', 'ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const params = await searchParams
  const clusterFilter = params.cluster
  const statusFilter = params.status
  const priorityFilter = params.priority

  const [clusters, tasks, allFaculty] = await Promise.all([
    db.cluster.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
    }),
    db.task.findMany({
      where: {
        deletedAt: null,
        ...(clusterFilter ? { clusterId: clusterFilter } : {}),
        ...(statusFilter ? { status: statusFilter as never } : {}),
        ...(priorityFilter ? { priority: priorityFilter as never } : {}),
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
        assignedBy: { select: { id: true, name: true } },
        cluster: { select: { name: true } },
      },
      orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
    }),
    db.user.findMany({
      where: { role: { in: ['FACULTY', 'CLUSTER_HEAD'] }, deletedAt: null },
      select: { id: true, name: true, designation: true },
    }),
  ])

  // Stats
  const statsMap = {
    OPEN: tasks.filter((t) => t.status === 'OPEN').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    COMPLETED: tasks.filter((t) => t.status === 'COMPLETED').length,
    OVERDUE: tasks.filter((t) => t.status === 'OVERDUE').length,
  }

  const STATUS_COLORS: Record<string, string> = {
    OPEN: '#3B82F6',
    IN_PROGRESS: '#F59E0B',
    COMPLETED: '#22C55E',
    OVERDUE: '#EF4444',
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">
          Department <span className="text-gradient">Tasks</span>
        </h2>
        <p className="page-subtitle">
          View and assign tasks across all clusters in the department.
        </p>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {Object.entries(statsMap).map(([status, count]) => (
          <div
            key={status}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
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
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: STATUS_COLORS[status],
              }}
            />
            {count} {status.replace('_', ' ')}
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 24 }}>
        {/* Assign form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'hsl(var(--color-primary) / 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'hsl(var(--color-primary))',
              }}
            >
              <Plus size={18} />
            </div>
            <h3 className="section-title" style={{ margin: 0 }}>
              Assign Task (Dept-wide)
            </h3>
          </div>
          <AssignTaskForm faculty={allFaculty} clusters={clusters} />
        </div>

        {/* Filter + task list */}
        <div>
          {/* Filter bar */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 14,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                color: 'hsl(var(--text-muted))',
              }}
            >
              <Filter size={14} /> Filter:
            </span>

            {/* Cluster filter */}
            <form method="GET">
              {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
              {priorityFilter && <input type="hidden" name="priority" value={priorityFilter} />}
              <select
                name="cluster"
                className="form-input"
                style={{ fontSize: 12.5, padding: '6px 10px' }}
                defaultValue={clusterFilter ?? ''}
                onChange={(e) => (e.target.form as HTMLFormElement).submit()}
              >
                <option value="">All Clusters</option>
                {clusters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </form>

            {/* Status filter */}
            <form method="GET">
              {clusterFilter && <input type="hidden" name="cluster" value={clusterFilter} />}
              {priorityFilter && <input type="hidden" name="priority" value={priorityFilter} />}
              <select
                name="status"
                className="form-input"
                style={{ fontSize: 12.5, padding: '6px 10px' }}
                defaultValue={statusFilter ?? ''}
                onChange={(e) => (e.target.form as HTMLFormElement).submit()}
              >
                <option value="">All Statuses</option>
                {['OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'].map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </form>
          </div>

          <h3 className="section-title" style={{ marginBottom: 12 }}>
            Tasks ({tasks.length})
          </h3>

          {tasks.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <CheckSquare size={40} className="empty-state-icon" />
                <div className="empty-state-title">No tasks match filters</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="card"
                  style={{ padding: '12px 16px' }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 9, height: 9, borderRadius: '50%',
                        background: STATUS_COLORS[task.status] ?? '#888',
                        flexShrink: 0, marginTop: 5,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13.5, fontWeight: 700,
                          color: 'hsl(var(--text-primary))', marginBottom: 3,
                        }}
                      >
                        {task.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12, color: 'hsl(var(--text-secondary))',
                          display: 'flex', gap: 10, flexWrap: 'wrap',
                        }}
                      >
                        <span>→ {task.assignedTo.name}</span>
                        <span style={{ color: 'hsl(var(--text-muted))' }}>
                          {task.cluster?.name}
                        </span>
                        <span>Due {formatDate(task.deadline)}</span>
                        <span className={`status-badge status-${task.status.toLowerCase().replace('_', '-')}`}
                          style={{ fontSize: 10.5, padding: '1px 7px' }}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`status-badge priority-${task.priority.toLowerCase()}`}
                          style={{ fontSize: 10.5, padding: '1px 7px' }}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
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
