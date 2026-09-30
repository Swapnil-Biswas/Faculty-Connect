import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, getInitials } from '@/lib/utils'
import { DecideLeaveForm } from './DecideLeaveForm'
import { Calendar, CheckCircle2, XCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leave Requests — Cluster' }

export default async function ClusterLeavePage() {
  const session = await auth()
  if (!session || !['CLUSTER_HEAD', 'HOD', 'ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const clusterId = session.user.clusterId
  if (!clusterId) {
    return (
      <div className="card">
        <div className="empty-state">
          <Calendar size={40} className="empty-state-icon" />
          <div className="empty-state-title">No cluster assigned</div>
        </div>
      </div>
    )
  }

  const [pending, decided] = await Promise.all([
    db.leaveApplication.findMany({
      where: { clusterId, status: 'PENDING' },
      include: { applicant: true },
      orderBy: { createdAt: 'asc' },
    }),
    db.leaveApplication.findMany({
      where: { clusterId, status: { in: ['APPROVED', 'REJECTED', 'CANCELLED'] } },
      include: { applicant: true, decidedBy: true },
      orderBy: { decidedAt: 'desc' },
      take: 20,
    }),
  ])

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Leave Requests</h2>
        <p className="page-subtitle">
          Review and decide on leave applications from your cluster.
        </p>
      </div>

      {/* Pending queue */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <h3 className="section-title" style={{ margin: 0 }}>
            Pending Requests
            {pending.length > 0 && (
              <span
                style={{
                  marginLeft: 10,
                  padding: '2px 8px',
                  background: 'hsl(var(--color-warning) / 0.15)',
                  color: 'hsl(var(--color-warning))',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {pending.length}
              </span>
            )}
          </h3>
        </div>

        {pending.length === 0 ? (
          <div className="empty-state" style={{ padding: '28px' }}>
            <CheckCircle2 size={40} className="empty-state-icon" style={{ color: 'hsl(var(--color-success))' }} />
            <div className="empty-state-title">All caught up!</div>
            <div className="empty-state-desc">No pending leave requests.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {pending.map((leave) => {
              const days =
                Math.ceil(
                  (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1

              return (
                <div
                  key={leave.id}
                  style={{
                    padding: '16px 20px',
                    background: 'hsl(var(--bg-subtle))',
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                    }}
                  >
                    {/* Avatar + name */}
                    <div className="avatar avatar-md" style={{ flexShrink: 0 }}>
                      {getInitials(leave.applicant.name)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: 'hsl(var(--text-primary))',
                          marginBottom: 2,
                        }}
                      >
                        {leave.applicant.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: 'hsl(var(--text-secondary))',
                          marginBottom: 8,
                          display: 'flex',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} />
                          {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: 'hsl(var(--color-primary))',
                          }}
                        >
                          {days} day{days > 1 ? 's' : ''}
                        </span>
                        <span style={{ color: 'hsl(var(--text-muted))' }}>
                          Applied {formatDate(leave.createdAt)}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: 'hsl(var(--text-secondary))',
                          lineHeight: 1.5,
                          marginBottom: 14,
                        }}
                      >
                        {leave.reason}
                      </p>
                      <DecideLeaveForm leaveId={leave.id} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Decided history */}
      <div>
        <h3 className="section-title" style={{ marginBottom: 14 }}>
          Recent Decisions
        </h3>

        {decided.length === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: 'hsl(var(--text-muted))',
              textAlign: 'center',
              padding: '24px',
            }}
          >
            No decided leaves yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Faculty</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Decided By</th>
                  <th>Decided On</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {decided.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm">{getInitials(leave.applicant.name)}</div>
                        <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                          {leave.applicant.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'hsl(var(--text-secondary))' }}>
                      {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                    </td>
                    <td>
                      <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'hsl(var(--text-secondary))' }}>
                      {leave.decidedBy?.name ?? '—'}
                    </td>
                    <td style={{ fontSize: 13, color: 'hsl(var(--text-muted))' }}>
                      {leave.decidedAt ? formatDate(leave.decidedAt) : '—'}
                    </td>
                    <td
                      style={{
                        fontSize: 12.5,
                        color: 'hsl(var(--text-muted))',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {leave.remarks ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
