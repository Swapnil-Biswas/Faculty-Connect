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
    <div className="page-content" style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* BMSIT High-Tech Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '3px 10px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#F59E0B', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>
            <span>●</span> TASK DISPATCH // CLUSTER WORKLOAD MANAGEMENT
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Cluster Task Management
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, fontFamily: 'var(--font-mono)' }}>
            // Assign, track, and supervise academic and operational deliverables for your cluster
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', alignItems: 'start', gap: 24 }}>
        {/* Assign Task form */}
        <div
          style={{
            background: '#0E121B',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              paddingBottom: 14,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
              }}
            >
              <Plus size={18} />
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
                // DISPATCH CONSOLE
              </span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>
                Assign New Task
              </h3>
            </div>
          </div>
          <AssignTaskForm faculty={facultyList} />
        </div>

        {/* Task list */}
        <div
          style={{
            background: '#0E121B',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18,
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              paddingBottom: 14,
            }}
          >
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
                // ACTIVE PIPELINE
              </span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>
                Cluster Tasks Matrix ({tasks.length})
              </h3>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#64748B' }}>
              LIVE FEED
            </span>
          </div>

          {tasks.length === 0 ? (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#64748B',
                background: '#07090E',
                borderRadius: 8,
                border: '1px dashed rgba(255, 255, 255, 0.08)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <CheckSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.4, color: '#22C55E' }} />
              <div>// No tasks active in cluster queue</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                Assign your first task using the dispatch console.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="cyber-card-hover"
                  style={{
                    background: '#07090E',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 8,
                    padding: '16px 18px',
                    transition: 'border-color 0.15s ease',
                  }}
                >
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
                        boxShadow: `0 0 8px ${STATUS_COLORS[task.status] ?? '#888'}`,
                        flexShrink: 0,
                        marginTop: 5,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#F8FAFC',
                          marginBottom: 4,
                        }}
                      >
                        {task.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#94A3B8',
                          display: 'flex',
                          gap: 10,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <span style={{ color: '#CBD5E1' }}>→ {task.assignedTo.name}</span>
                        <span>Due {formatDate(task.deadline)}</span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: `${STATUS_COLORS[task.status]}15`,
                            color: STATUS_COLORS[task.status],
                            border: `1px solid ${STATUS_COLORS[task.status]}35`,
                          }}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#CBD5E1',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
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
