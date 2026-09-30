import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, getInitials } from '@/lib/utils'
import { HodDecideLeaveForm } from './HodDecideLeaveForm'
import { Calendar } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Department Leave — HOD' }

export default async function HodLeavePage({
  searchParams,
}: {
  searchParams: Promise<{ cluster?: string; status?: string }>
}) {
  const session = await auth()
  if (!session || !['HOD', 'ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const params = await searchParams
  const clusterFilter = params.cluster
  const statusFilter = params.status ?? 'PENDING'

  const [clusters, leaves] = await Promise.all([
    db.cluster.findMany({ where: { deletedAt: null }, select: { id: true, name: true } }),
    db.leaveApplication.findMany({
      where: {
        ...(clusterFilter ? { clusterId: clusterFilter } : {}),
        ...(statusFilter ? { status: statusFilter as never } : {}),
      },
      include: {
        applicant: true,
        cluster: { select: { name: true } },
        decidedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])

  const pendingCount = await db.leaveApplication.count({ where: { status: 'PENDING' } })

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">
          Department <span className="text-gradient">Leave</span>
        </h2>
        <p className="page-subtitle">
          Review all leave requests across clusters.
          {pendingCount > 0 && (
            <span
              style={{
                marginLeft: 10,
                padding: '2px 10px',
                background: 'hsl(var(--color-warning) / 0.15)',
                color: 'hsl(var(--color-warning))',
                borderRadius: 100,
                fontSize: 12.5,
                fontWeight: 700,
              }}
            >
              {pendingCount} pending dept-wide
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        <form method="GET" style={{ display: 'flex', gap: 10 }}>
          <select
            name="cluster"
            className="form-input"
            style={{ fontSize: 13, padding: '7px 12px' }}
            defaultValue={clusterFilter ?? ''}
            onChange={(e) => (e.target.form as HTMLFormElement).submit()}
          >
            <option value="">All Clusters</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            name="status"
            className="form-input"
            style={{ fontSize: 13, padding: '7px 12px' }}
            defaultValue={statusFilter}
            onChange={(e) => (e.target.form as HTMLFormElement).submit()}
          >
            {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="">ALL</option>
          </select>
        </form>
      </div>

      {/* Leave list */}
      {leaves.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Calendar size={40} className="empty-state-icon" />
            <div className="empty-state-title">No leave requests match</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {leaves.map((leave) => {
            const days =
              Math.ceil(
                (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              ) + 1

            return (
              <div key={leave.id} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div className="avatar avatar-md" style={{ flexShrink: 0 }}>
                    {getInitials(leave.applicant.name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
                        {leave.applicant.name}
                      </span>
                      <span
                        style={{
                          fontSize: 11.5,
                          color: 'hsl(var(--text-muted))',
                          background: 'hsl(var(--bg-subtle))',
                          padding: '1px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {leave.cluster?.name}
                      </span>
                      <span className={`status-badge status-${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: 'hsl(var(--text-secondary))',
                        display: 'flex',
                        gap: 14,
                        marginBottom: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </span>
                      <span style={{ color: 'hsl(var(--color-primary))', fontWeight: 600 }}>
                        {days} day{days > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: 'hsl(var(--text-secondary))', lineHeight: 1.5, marginBottom: 8 }}>
                      {leave.reason}
                    </p>

                    {leave.status === 'PENDING' && (
                      <HodDecideLeaveForm leaveId={leave.id} />
                    )}

                    {leave.status !== 'PENDING' && leave.decidedBy && (
                      <div style={{ fontSize: 12, color: 'hsl(var(--text-muted))' }}>
                        Decided by {leave.decidedBy.name} on {formatDate(leave.decidedAt!)}
                        {leave.remarks && ` — "${leave.remarks}"`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
