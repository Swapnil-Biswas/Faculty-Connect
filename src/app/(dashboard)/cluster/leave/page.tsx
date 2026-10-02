import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, getInitials } from '@/lib/utils'
import { DecideLeaveForm } from './DecideLeaveForm'
import { Calendar, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'Leave Requests — Cluster' }

export default async function ClusterLeavePage() {
  const session = await auth()
  if (!session || !['CLUSTER_HEAD', 'HOD', 'ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const clusterId = session.user.clusterId
  if (!clusterId) {
    return (
      <div className="page-content">
        <div className="card">
          <div className="empty">
            <Calendar size={40} style={{ margin: '0 auto 10px', color: 'var(--grey-400)' }} />
            <div className="empty-title">No cluster assigned</div>
            <div className="empty-body">You must be assigned to an academic cluster to review leave requests.</div>
          </div>
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
    <div className="page-content" style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/cluster' },
          { label: 'Leave Sanctions' },
        ]}
        dotMatrixText="LEAVE"
        eyebrow="ABSENCE SANCTION · CLUSTER QUEUE"
        title="Cluster Leave Sanctions"
        subtitle="Review and decide on leave applications from your cluster members."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: 'var(--grey-50)', border: '1px solid var(--grey-200)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: pending.length > 0 ? '#d97706' : '#16a34a', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--grey-800)' }}>
              {pending.length} ACTION REQUIRED
            </span>
          </div>
        }
      />

      {/* Pending queue */}
      <div className="card" style={{ padding: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            borderBottom: '1px solid var(--grey-100)',
            paddingBottom: 14,
          }}
        >
          <div>
            <span className="section-eyebrow" style={{ marginBottom: 2 }}>
              // PENDING SANCTIONS
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--grey-900)' }}>
              Pending Cluster Applications
            </h3>
          </div>
          {pending.length > 0 && (
            <span className="badge" style={{ color: '#d97706', borderColor: '#d97706' }}>
              ● {pending.length} PENDING REVIEW
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="empty">
            <CheckCircle2 size={32} style={{ margin: '0 auto 10px', color: '#16a34a' }} />
            <div className="empty-title">All leave requests addressed</div>
            <div className="empty-body">No pending leave applications in your cluster queue.</div>
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
                    padding: 20,
                    background: 'var(--grey-50)',
                    borderRadius: 12,
                    border: '1px solid var(--grey-200)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="avatar"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: 'var(--grey-800)',
                        color: 'var(--white)',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(leave.applicant.name)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: 'var(--grey-900)',
                          marginBottom: 4,
                        }}
                      >
                        {leave.applicant.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--grey-500)',
                          marginBottom: 10,
                          display: 'flex',
                          gap: 12,
                          flexWrap: 'wrap',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--grey-800)' }}>
                          <Calendar size={12} />
                          {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                        </span>
                        <span style={{ fontWeight: 700, color: '#d97706' }}>
                          {days} day{days > 1 ? 's' : ''}
                        </span>
                        <span style={{ color: 'var(--grey-400)' }}>
                          Applied {formatDate(leave.createdAt)}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: 'var(--grey-700)',
                          lineHeight: 1.6,
                          marginBottom: 16,
                          background: 'var(--white)',
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: '1px solid var(--grey-200)',
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
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="section-eyebrow" style={{ marginBottom: 2 }}>
              // SANCTIONS AUDIT LOG
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--grey-900)' }}>
              Recent Cluster Decisions
            </h3>
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--grey-500)' }}>
            {decided.length} DECISIONS LOGGED
          </span>
        </div>

        {decided.length === 0 ? (
          <div className="empty" style={{ margin: 24 }}>
            <div className="empty-title">No historical decisions</div>
            <div className="empty-body">Past approved and rejected leave applications will appear here.</div>
          </div>
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>FACULTY</th>
                  <th>DURATION</th>
                  <th>STATUS</th>
                  <th>DECIDED BY</th>
                  <th>TIMESTAMP</th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {decided.map((leave) => (
                  <tr key={leave.id} className="cyber-row-hover">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          className="avatar"
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 6,
                            background: 'var(--grey-100)',
                            color: 'var(--grey-800)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(leave.applicant.name)}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--grey-900)' }}>
                          {leave.applicant.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12.5, color: 'var(--grey-600)', fontFamily: 'var(--font-mono)' }}>
                      {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          fontWeight: 700,
                          color: leave.status === 'APPROVED' ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {leave.status === 'APPROVED' ? '● APPROVED' : '▲ REJECTED'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--grey-700)' }}>
                      {leave.decidedBy?.name ?? '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--grey-500)', fontFamily: 'var(--font-mono)' }}>
                      {leave.decidedAt ? formatDate(leave.decidedAt) : '—'}
                    </td>
                    <td
                      style={{
                        fontSize: 12,
                        color: 'var(--grey-500)',
                        maxWidth: 240,
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
