import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, getInitials } from '@/lib/utils'
import { DecideLeaveForm } from './DecideLeaveForm'
import { Calendar, Clock, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui/PageHeader'
import { MetricBlock } from '@/components/ui/MetricBlock'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'

export const metadata: Metadata = { title: "Cluster Head // Leave Approvals" }

export default async function ClusterLeavePage() {
  const session = await auth()
  if (!session || !['CLUSTER_HEAD', 'HOD', 'ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const clusterId = session.user.clusterId
  if (!clusterId) {
    return (
      <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
        <PageHeader
          breadcrumbs={[
            { label: "CLUSTER_CONSOLE", href: "/cluster" },
            { label: "LEAVE_APPROVALS" },
          ]}
          title="Cluster Leave Sanctions"
          subtitle="Review and decide on leave applications from your cluster members."
          dotMatrixText="LEAVE"
        />
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: "rgba(183, 121, 31, 0.1)",
              border: "1px solid rgba(183, 121, 31, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#B7791F",
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#17202A", margin: "0 0 8px 0" }}>
            No Cluster Assigned
          </h2>
          <p style={{ fontSize: 14, color: "#667085", maxWidth: 460, margin: "0 auto" }}>
            You must be linked to an academic cluster to review and sanction leave requests.
          </p>
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

  const approvedCount = decided.filter((l) => l.status === 'APPROVED').length
  const rejectedCount = decided.filter((l) => ['REJECTED', 'CANCELLED'].includes(l.status)).length

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: 'CLUSTER_CONSOLE', href: '/cluster' },
          { label: 'LEAVE_APPROVALS' },
        ]}
        dotMatrixText="LEAVE"
        eyebrow="// ABSENCE GOVERNANCE · CLUSTER SANCTIONS"
        title="Cluster Leave Approvals & Sanctions"
        subtitle="Review, evaluate, and sanction absence requests submitted by faculty in your cluster."
        actions={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 6,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              color: '#17202A',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: pending.length > 0 ? '#B7791F' : '#198754',
              }}
            />
            {pending.length} ACTION REQUIRED
          </div>
        }
      />

      {/* 2. Metric Blocks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Pending Review"
          value={pending.length}
          context={pending.length > 0 ? "Awaiting your sanction decision" : "Review queue clear"}
          trendType={pending.length > 0 ? "warning" : "positive"}
          icon={<Clock size={18} color="#B7791F" />}
        />
        <MetricBlock
          label="Sanctions Granted"
          value={approvedCount}
          context="Approved cluster leaves"
          trendType="positive"
          icon={<CheckCircle2 size={18} color="#198754" />}
        />
        <MetricBlock
          label="Declined / Revoked"
          value={rejectedCount}
          context="Rejected or cancelled requests"
          trendType="neutral"
          icon={<AlertCircle size={18} color="#667085" />}
        />
      </div>

      {/* 3. Pending Queue Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4E7EC',
          borderRadius: 8,
          padding: '22px 24px',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
            borderBottom: '1px solid #F2F4F7',
            paddingBottom: 14,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#667085',
                textTransform: 'uppercase',
              }}
            >
              // PENDING SANCTIONS
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#17202A', margin: '2px 0 0' }}>
              Pending Cluster Applications
            </h2>
          </div>
          {pending.length > 0 && (
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: '#B7791F',
                backgroundColor: 'rgba(183, 121, 31, 0.08)',
                padding: '3px 8px',
                borderRadius: 4,
                border: '1px solid rgba(183, 121, 31, 0.25)',
              }}
            >
              {pending.length} PENDING REVIEW
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All Leave Requests Addressed"
            description="There are no pending leave applications in your cluster queue."
          />
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
                    padding: '18px 20px',
                    backgroundColor: '#F7F8FA',
                    borderRadius: 6,
                    border: '1px solid #E4E7EC',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        backgroundColor: '#173B67',
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(leave.applicant.name)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                          marginBottom: 4,
                        }}
                      >
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: '#17202A' }}>
                          {leave.applicant.name}
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#B7791F',
                            backgroundColor: 'rgba(183, 121, 31, 0.08)',
                            padding: '2px 8px',
                            borderRadius: 4,
                          }}
                        >
                          {days} {days === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: '#667085',
                          marginBottom: 10,
                          display: 'flex',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#17202A', fontWeight: 500 }}>
                          <Calendar size={13} color="#667085" />
                          {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                        </span>
                        <span>·</span>
                        <span>Applied {formatDate(leave.createdAt)}</span>
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: '#17202A',
                          lineHeight: 1.5,
                          marginBottom: 14,
                          backgroundColor: '#FFFFFF',
                          padding: '10px 14px',
                          borderRadius: 6,
                          border: '1px solid #E4E7EC',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#667085', fontSize: 11.5, display: 'block', marginBottom: 2 }}>
                          Reason for leave:
                        </span>
                        {leave.reason}
                      </div>

                      <DecideLeaveForm leaveId={leave.id} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Decided History Audit Log */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4E7EC',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E4E7EC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#FAFAFA',
          }}
        >
          <div>
            <span
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                color: '#667085',
                textTransform: 'uppercase',
              }}
            >
              // SANCTIONS AUDIT LOG
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#17202A', margin: '2px 0 0' }}>
              Recent Cluster Decisions
            </h2>
          </div>
          <span style={{ fontSize: 11.5, color: '#667085', fontWeight: 500 }}>
            {decided.length} DECISIONS LOGGED
          </span>
        </div>

        {decided.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No Historical Decisions"
            description="Past approved and rejected leave applications will appear here."
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E4E7EC', backgroundColor: '#F7F8FA' }}>
                  <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Faculty
                  </th>
                  <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Duration
                  </th>
                  <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Status
                  </th>
                  <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Decided By
                  </th>
                  <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Decided Date
                  </th>
                  <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {decided.map((leave) => {
                  const days =
                    Math.ceil(
                      (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) + 1

                  return (
                    <tr
                      key={leave.id}
                      style={{
                        borderBottom: '1px solid #F2F4F7',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 5,
                              backgroundColor: '#F2F4F7',
                              color: '#17202A',
                              fontFamily: 'var(--font-mono)',
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(leave.applicant.name)}
                          </div>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#17202A' }}>
                            {leave.applicant.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12.5, color: '#667085' }}>
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)} ({days}d)
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <StatusBadge status={leave.status} size="sm" />
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#17202A' }}>
                        {leave.decidedBy?.name ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12.5, color: '#667085' }}>
                        {leave.decidedAt ? formatDate(leave.decidedAt) : '—'}
                      </td>
                      <td
                        style={{
                          padding: '12px 16px',
                          fontSize: 12.5,
                          color: '#667085',
                          maxWidth: 240,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {leave.remarks ?? '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
