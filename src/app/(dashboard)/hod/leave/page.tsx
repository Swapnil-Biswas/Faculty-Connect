import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, getInitials } from '@/lib/utils'
import { HodDecideLeaveForm } from './HodDecideLeaveForm'
import { PageHeader } from '@/components/ui/PageHeader'
import { Calendar, Filter } from 'lucide-react'
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
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header with BMSIT Dot Matrix */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Leave Requests" },
        ]}
        eyebrow="HOD // GOVERNANCE WORKFLOWS"
        dotMatrixText="LEAVE"
        dotMatrixFontSize={36}
        title="Department Leave Reviews"
        ghost="absence."
        subtitle="Review, audit, and approve faculty leave applications across all academic clusters."
        actions={
          pendingCount > 0 ? (
            <span className="badge" style={{ borderColor: 'rgba(217, 119, 6, 0.3)', color: '#D97706', background: '#FFFBEB' }}>
              <span className="badge-dot" style={{ backgroundColor: '#D97706' }} />
              {pendingCount} PENDING REVIEWS
            </span>
          ) : (
            <span className="badge status-published">
              <span className="badge-dot" />
              ALL REVIEWS CLEARED
            </span>
          )
        }
      />

      {/* Filters Bar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          gap: 12,
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
        <form method="GET" style={{ display: 'flex', gap: 10 }}>
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

          <select
            name="status"
            className="select"
            style={{ fontSize: 12, padding: '6px 12px', height: 34, width: 'auto' }}
            defaultValue={statusFilter}
            onChange={(e) => (e.target.form as HTMLFormElement).submit()}
          >
            {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="">ALL STATUSES</option>
          </select>
        </form>
      </div>

      {/* Leave list */}
      {leaves.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <Calendar size={36} style={{ color: '#B0B0B5', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1D1D1F' }}>No leave requests match current filters</div>
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
              <div key={leave.id} className="card cyber-card-hover" style={{ padding: '20px 24px', background: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: '#1D1D1F',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(leave.applicant.name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#1D1D1F' }}>
                        {leave.applicant.name}
                      </span>
                      <span className="badge" style={{ fontSize: 10, padding: '2px 8px' }}>
                        {leave.cluster?.name}
                      </span>
                      <span
                        className={`badge ${
                          leave.status === 'APPROVED'
                            ? 'status-published'
                            : leave.status === 'REJECTED'
                            ? 'btn-danger'
                            : 'status-draft'
                        }`}
                        style={{ fontSize: 10, padding: '2px 8px' }}
                      >
                        <span className="badge-dot" />
                        {leave.status}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 12.5,
                        color: '#6E6E73',
                        display: 'flex',
                        gap: 14,
                        marginBottom: 8,
                        flexWrap: 'wrap',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <span>
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </span>
                      <span style={{ color: '#1D1D1F', fontWeight: 600 }}>
                        {days} day{days > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: '#424245', lineHeight: 1.5, marginBottom: 12 }}>
                      {leave.reason}
                    </p>

                    {leave.status === 'PENDING' && (
                      <div style={{ marginTop: 8 }}>
                        <HodDecideLeaveForm leaveId={leave.id} />
                      </div>
                    )}

                    {leave.status !== 'PENDING' && leave.decidedBy && (
                      <div style={{ fontSize: 12, color: '#86868B', fontFamily: 'var(--font-mono)', marginTop: 8 }}>
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
