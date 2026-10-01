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
    <div className="page-content" style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* BMSIT High-Tech Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '3px 10px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#F59E0B', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>
            <span>●</span> ABSENCE SANCTION // CLUSTER LEAVE QUEUE
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Cluster Leave Sanctions
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, fontFamily: 'var(--font-mono)' }}>
            // Review and decide on leave applications from your cluster members
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 6, background: 'rgba(14, 18, 27, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: pending.length > 0 ? '#F59E0B' : '#22C55E', boxShadow: `0 0 8px ${pending.length > 0 ? '#F59E0B' : '#22C55E'}`, display: 'inline-block' }}></span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E2E8F0' }}>
            {pending.length} ACTION REQUIRED
          </span>
        </div>
      </div>

      {/* Pending queue */}
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
            justifyContent: 'space-between',
            marginBottom: 20,
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            paddingBottom: 14,
          }}
        >
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
              // PENDING SANCTIONS
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>
              Pending Cluster Applications
            </h3>
          </div>
          {pending.length > 0 && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 4,
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#F59E0B',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              ● {pending.length} PENDING REVIEW
            </span>
          )}
        </div>

        {pending.length === 0 ? (
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
            <CheckCircle2 size={32} style={{ margin: '0 auto 10px', opacity: 0.5, color: '#22C55E' }} />
            <div>// All leave requests have been addressed</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>No pending leave applications in cluster queue.</div>
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
                    padding: '20px',
                    background: '#07090E',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                    }}
                  >
                    {/* Avatar + name */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        color: '#F59E0B',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: 15,
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
                          fontSize: 15,
                          fontWeight: 700,
                          color: '#F8FAFC',
                          marginBottom: 4,
                        }}
                      >
                        {leave.applicant.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: '#94A3B8',
                          marginBottom: 10,
                          display: 'flex',
                          gap: 12,
                          flexWrap: 'wrap',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#38BDF8' }}>
                          <Calendar size={12} />
                          {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: '#F59E0B',
                          }}
                        >
                          {days} day{days > 1 ? 's' : ''}
                        </span>
                        <span style={{ color: '#64748B' }}>
                          Applied {formatDate(leave.createdAt)}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: '#CBD5E1',
                          lineHeight: 1.6,
                          marginBottom: 16,
                          background: 'rgba(255, 255, 255, 0.02)',
                          padding: '10px 14px',
                          borderRadius: 6,
                          border: '1px solid rgba(255, 255, 255, 0.04)',
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
      <div
        style={{
          background: '#0E121B',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
              // SANCTIONS AUDIT LOG
            </span>
            <h3 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>
              Recent Cluster Decisions
            </h3>
          </div>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#64748B' }}>
            {decided.length} DECISIONS LOGGED
          </span>
        </div>

        {decided.length === 0 ? (
          <div
            style={{
              fontSize: 13,
              color: '#64748B',
              textAlign: 'center',
              padding: '36px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            // No historical decisions recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700 }}>FACULTY</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700 }}>DURATION</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700 }}>STATUS</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700 }}>DECIDED BY</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700 }}>TIMESTAMP</th>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700 }}>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {decided.map((leave) => (
                  <tr
                    key={leave.id}
                    className="cyber-row-hover"
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 6,
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#CBD5E1',
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {getInitials(leave.applicant.name)}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#F8FAFC' }}>
                          {leave.applicant.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 12.5, color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                      {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          background: leave.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                          color: leave.status === 'APPROVED' ? '#22C55E' : '#F43F5E',
                          border: `1px solid ${leave.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
                        }}
                      >
                        {leave.status === 'APPROVED' ? '● APPROVED' : '▲ REJECTED'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 13, color: '#CBD5E1' }}>
                      {leave.decidedBy?.name ?? '—'}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                      {leave.decidedAt ? formatDate(leave.decidedAt) : '—'}
                    </td>
                    <td
                      style={{
                        padding: '14px 20px',
                        fontSize: 12,
                        color: '#64748B',
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
