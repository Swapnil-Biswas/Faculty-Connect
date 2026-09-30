import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, getInitials } from '@/lib/utils'
import { Shield, Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Audit Log — Admin' }

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED: '#22C55E',
  USER_ROLE_UPDATED: '#3B82F6',
  USER_SOFT_DELETED: '#EF4444',
  USER_ASSIGNED_TO_CLUSTER: '#8B5CF6',
  TASK_CREATED: '#06B6D4',
  TASK_STATUS_UPDATED: '#F59E0B',
  TASK_DELETED: '#EF4444',
  LEAVE_APPLIED: '#3B82F6',
  LEAVE_APPROVED: '#22C55E',
  LEAVE_REJECTED: '#EF4444',
  LEAVE_CANCELLED: '#9CA3AF',
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    entity?: string
    actor?: string
    action?: string
    page?: string
  }>
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const params = await searchParams
  const entityFilter = params.entity?.trim()
  const actorFilter = params.actor?.trim()
  const actionFilter = params.action?.trim()
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const PAGE_SIZE = 30

  const where = {
    ...(entityFilter ? { entityType: { contains: entityFilter, mode: 'insensitive' as const } } : {}),
    ...(actorFilter
      ? {
          actor: {
            OR: [
              { name: { contains: actorFilter, mode: 'insensitive' as const } },
              { email: { contains: actorFilter, mode: 'insensitive' as const } },
            ],
          },
        }
      : {}),
    ...(actionFilter ? { action: { contains: actionFilter, mode: 'insensitive' as const } } : {}),
  }

  const [total, logs] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, name: true, email: true } } },
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">
          <span className="text-gradient">Audit</span> Log
        </h2>
        <p className="page-subtitle">
          Complete immutable record of all system actions. {total.toLocaleString()} events total.
        </p>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <form method="GET" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Action</label>
            <input
              name="action"
              type="text"
              className="form-input"
              placeholder="e.g. TASK_CREATED"
              defaultValue={actionFilter ?? ''}
              style={{ fontSize: 13 }}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Entity Type</label>
            <input
              name="entity"
              type="text"
              className="form-input"
              placeholder="e.g. Task"
              defaultValue={entityFilter ?? ''}
              style={{ fontSize: 13 }}
            />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Actor (name or email)</label>
            <input
              name="actor"
              type="text"
              className="form-input"
              placeholder="Search actor…"
              defaultValue={actorFilter ?? ''}
              style={{ fontSize: 13 }}
            />
          </div>
          <button type="submit" className="btn-gradient" style={{ height: 40, alignSelf: 'flex-end' }}>
            <Search size={15} /> Filter
          </button>
          {(actionFilter || entityFilter || actorFilter) && (
            <a href="/admin/audit" className="btn-outline" style={{ height: 40, alignSelf: 'flex-end', fontSize: 13 }}>
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Log entries */}
      {logs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Shield size={40} className="empty-state-icon" />
            <div className="empty-state-title">No audit events match</div>
            <div className="empty-state-desc">Try adjusting your filters.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map((log) => {
            const color = ACTION_COLORS[log.action] ?? '#8B5CF6'
            return (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 18px',
                  background: log.isImpersonated
                    ? 'hsl(326 100% 65% / 0.05)'
                    : 'hsl(var(--bg-surface))',
                  border: `1px solid ${log.isImpersonated ? 'hsl(326 100% 65% / 0.2)' : 'hsl(var(--border))'}`,
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 10,
                }}
              >
                {/* Actor avatar */}
                <div className="avatar avatar-sm" style={{ flexShrink: 0, fontSize: 10 }}>
                  {getInitials(log.actor.name)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        color,
                        background: `${color}1A`,
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {log.action}
                    </span>
                    {log.isImpersonated && (
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          color: 'hsl(326 80% 50%)',
                          background: 'hsl(326 100% 65% / 0.1)',
                          padding: '1px 7px',
                          borderRadius: 4,
                          border: '1px solid hsl(326 100% 65% / 0.2)',
                        }}
                      >
                        IMPERSONATED
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: 'hsl(var(--text-secondary))',
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      by <strong>{log.actor.name}</strong>
                    </span>
                    <span style={{ color: 'hsl(var(--text-muted))' }}>
                      {log.entityType} #{log.entityId.slice(0, 8)}…
                    </span>
                  </div>

                  {/* Before/After state preview */}
                  {(log.beforeState || log.afterState) && (
                    <div
                      style={{
                        marginTop: 6,
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      {log.beforeState && (
                        <code
                          style={{
                            fontSize: 11,
                            background: 'hsl(0 84% 60% / 0.06)',
                            border: '1px solid hsl(0 84% 60% / 0.15)',
                            padding: '2px 8px',
                            borderRadius: 4,
                            color: 'hsl(0 60% 45%)',
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          − {JSON.stringify(log.beforeState)}
                        </code>
                      )}
                      {log.afterState && (
                        <code
                          style={{
                            fontSize: 11,
                            background: 'hsl(142 71% 45% / 0.06)',
                            border: '1px solid hsl(142 71% 45% / 0.15)',
                            padding: '2px 8px',
                            borderRadius: 4,
                            color: 'hsl(142 60% 35%)',
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          + {JSON.stringify(log.afterState)}
                        </code>
                      )}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 11.5,
                    color: 'hsl(var(--text-muted))',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {formatDate(log.timestamp)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
            marginTop: 24,
          }}
        >
          {page > 1 && (
            <a
              href={`/admin/audit?page=${page - 1}${actionFilter ? `&action=${actionFilter}` : ''}${entityFilter ? `&entity=${entityFilter}` : ''}${actorFilter ? `&actor=${actorFilter}` : ''}`}
              className="btn-outline"
              style={{ fontSize: 13, padding: '7px 16px' }}
            >
              ← Prev
            </a>
          )}
          <span style={{ fontSize: 13, color: 'hsl(var(--text-muted))' }}>
            Page {page} of {totalPages} ({total.toLocaleString()} events)
          </span>
          {page < totalPages && (
            <a
              href={`/admin/audit?page=${page + 1}${actionFilter ? `&action=${actionFilter}` : ''}${entityFilter ? `&entity=${entityFilter}` : ''}${actorFilter ? `&actor=${actorFilter}` : ''}`}
              className="btn-outline"
              style={{ fontSize: 13, padding: '7px 16px' }}
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
