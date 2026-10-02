import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { AssignTaskForm } from './AssignTaskForm'
import { DeleteTaskButton } from './DeleteTaskButton'
import { PageHeader } from '@/components/ui/PageHeader'
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
      <div className="card" style={{ padding: 48, textAlign: 'center' }}>
        <AlertTriangle size={40} style={{ color: "#D97706", margin: "0 auto 12px" }} />
        <h2 className="card-title" style={{ marginBottom: 6 }}>No Cluster Assigned</h2>
        <p className="card-muted">Contact the department HOD to assign you to a cluster node.</p>
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
          { label: "Cluster Console", href: "/cluster" },
          { label: "Task Dispatch" },
        ]}
        eyebrow="CLUSTER // WORKLOAD DISPATCH"
        dotMatrixText="TASKS"
        dotMatrixFontSize={36}
        title="Cluster Task Management"
        ghost="pipeline."
        subtitle="Assign, track, and supervise academic and operational deliverables for your cluster."
        actions={
          <span className="badge badge-dark">
            {tasks.length} Cluster Deliverables
          </span>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', alignItems: 'start', gap: 24 }}>
        {/* Assign Task form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: '#1D1D1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Plus size={18} />
            </div>
            <div>
              <span className="section-eyebrow">// DIRECT DISPATCH</span>
              <h3 className="card-title" style={{ margin: 0 }}>
                Assign New Deliverable
              </h3>
            </div>
          </div>
          <AssignTaskForm faculty={facultyList} clusterId={clusterId} />
        </div>

        {/* Task list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="section-eyebrow">// ACTIVE DELIVERABLES</span>
            <span className="badge">{tasks.length} Assigned</span>
          </div>

          {tasks.length === 0 ? (
            <div className="card" style={{ padding: 48, textAlign: 'center' }}>
              <CheckSquare size={36} style={{ color: '#B0B0B5', margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>No tasks assigned in this cluster yet</div>
              <p className="card-muted" style={{ marginTop: 4 }}>Use the form on the left to dispatch a task to a faculty member.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="card cyber-card-hover"
                  style={{ padding: '16px 20px', background: '#FFFFFF' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: STATUS_COLORS[task.status] ?? '#888',
                          flexShrink: 0,
                          marginTop: 6,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F', marginBottom: 4 }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <p style={{ fontSize: 13, color: '#6E6E73', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                            {task.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', fontSize: 12, color: '#6E6E73' }}>
                          <span style={{ fontWeight: 600, color: '#1D1D1F' }}>→ {task.assignedTo.name}</span>
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
