import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { AssignTaskForm } from './AssignTaskForm'
import { PageHeader } from '@/components/ui/PageHeader'
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
    OPEN: '#1D1D1F',
    IN_PROGRESS: '#D97706',
    COMPLETED: '#16A34A',
    OVERDUE: '#E11D48',
  }

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header with BMSIT Dot Matrix */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Tasks" },
        ]}
        eyebrow="HOD // OPERATIONAL WORKFLOWS"
        dotMatrixText="TASKS"
        dotMatrixFontSize={36}
        title="Department Tasks"
        ghost="dispatch."
        subtitle="View, allocate, and track tasks across all clusters in the department."
      />

      {/* Summary status pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {Object.entries(statsMap).map(([status, count]) => (
          <div
            key={status}
            className="badge"
            style={{
              padding: '6px 14px',
              fontSize: 11.5,
              background: '#FFFFFF',
              borderColor: '#E8E8ED',
              color: '#1D1D1F',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: STATUS_COLORS[status],
              }}
            />
            <span>{count} {status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 24 }}>
        {/* Assign form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: '#1D1D1F',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Plus size={18} />
            </div>
            <div>
              <span className="section-eyebrow">// DIRECT DISPATCH</span>
              <h3 className="card-title" style={{ margin: 0 }}>
                Assign Task (Dept-wide)
              </h3>
            </div>
          </div>
          <AssignTaskForm faculty={allFaculty} clusters={clusters} />
        </div>

        {/* Filter + task list */}
        <div>
          {/* Filter bar */}
          <div
            className="card"
            style={{
              padding: '12px 18px',
              display: 'flex',
              gap: 12,
              marginBottom: 16,
              flexWrap: 'wrap',
              alignItems: 'center',
              background: '#FAFAFA',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: '#6E6E73',
              }}
            >
              <Filter size={13} /> FILTER:
            </span>

            {/* Cluster filter */}
            <form method="GET" style={{ display: 'inline-flex' }}>
              {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
              {priorityFilter && <input type="hidden" name="priority" value={priorityFilter} />}
              <select
                name="cluster"
                className="select"
                style={{ fontSize: 12, padding: '6px 12px', height: 34, width: 'auto' }}
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
            <form method="GET" style={{ display: 'inline-flex' }}>
              {clusterFilter && <input type="hidden" name="cluster" value={clusterFilter} />}
              {priorityFilter && <input type="hidden" name="priority" value={priorityFilter} />}
              <select
                name="status"
                className="select"
                style={{ fontSize: 12, padding: '6px 12px', height: 34, width: 'auto' }}
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="section-eyebrow">// TASK REGISTRY</span>
            <span className="badge badge-dark">{tasks.length} Records</span>
          </div>

          {tasks.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <CheckSquare size={36} style={{ color: '#B0B0B5', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>No tasks match current filters</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="card cyber-card-hover"
                  style={{ padding: '14px 18px', background: '#FFFFFF' }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: STATUS_COLORS[task.status] ?? '#888',
                        flexShrink: 0, marginTop: 6,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14, fontWeight: 700,
                          color: '#1D1D1F', marginBottom: 4,
                        }}
                      >
                        {task.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12, color: '#6E6E73',
                          display: 'flex', gap: 10, flexWrap: 'wrap',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#1D1D1F' }}>→ {task.assignedTo.name}</span>
                        <span style={{ color: '#86868B', fontFamily: 'var(--font-mono)' }}>
                          {task.cluster?.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>Due {formatDate(task.deadline)}</span>
                        <span className="badge" style={{ fontSize: 9.5, padding: '2px 6px' }}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className="badge" style={{ fontSize: 9.5, padding: '2px 6px' }}>
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
