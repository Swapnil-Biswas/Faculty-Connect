import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { ApplyLeaveForm } from './ApplyLeaveForm'
import { CancelLeaveButton } from './CancelLeaveButton'
import { Calendar, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Leave Requests' }

export default async function FacultyLeavePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const leaves = await db.leaveApplication.findMany({
    where: { applicantId: session.user.id },
    include: { decidedBy: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Leave Requests</h2>
        <p className="page-subtitle">Apply for Casual Leave and track your applications.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 24 }}>
        {/* Apply form */}
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 20 }}>
            Apply for Leave
          </h3>
          <ApplyLeaveForm />
        </div>

        {/* History */}
        <div>
          <h3 className="section-title" style={{ marginBottom: 14 }}>
            Leave History
          </h3>

          {leaves.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <Calendar size={40} className="empty-state-icon" />
                <div className="empty-state-title">No leave requests yet</div>
                <div className="empty-state-desc">Your applications will appear here.</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {leaves.map((leave) => (
                <div key={leave.id} className="card" style={{ padding: '16px 20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <span
                          className={`status-badge status-${leave.status.toLowerCase()}`}
                        >
                          {leave.status}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: 'hsl(var(--text-muted))',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <Clock size={12} />
                          Applied {formatDate(leave.createdAt)}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'hsl(var(--text-primary))',
                          marginBottom: 4,
                        }}
                      >
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </div>

                      <p
                        style={{
                          fontSize: 13,
                          color: 'hsl(var(--text-secondary))',
                          lineHeight: 1.5,
                        }}
                      >
                        {leave.reason}
                      </p>

                      {leave.remarks && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: '8px 10px',
                            background: 'hsl(var(--bg-subtle))',
                            borderRadius: 8,
                            fontSize: 12.5,
                            color: 'hsl(var(--text-secondary))',
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>
                            Remarks ({leave.decidedBy?.name ?? 'Reviewer'}):
                          </span>{' '}
                          {leave.remarks}
                        </div>
                      )}
                    </div>

                    {leave.status === 'PENDING' && (
                      <CancelLeaveButton leaveId={leave.id} />
                    )}
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
