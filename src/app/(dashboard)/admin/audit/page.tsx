import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, getInitials } from '@/lib/utils'
import { Shield, Search } from 'lucide-react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui/PageHeader'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Audit Log — Admin' }

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED: '#16a34a',
  USER_ROLE_UPDATED: '#0284c7',
  USER_SOFT_DELETED: '#dc2626',
  USER_ASSIGNED_TO_CLUSTER: '#7c3aed',
  TASK_CREATED: '#0891b2',
  TASK_STATUS_UPDATED: '#d97706',
  TASK_DELETED: '#dc2626',
  LEAVE_APPLIED: '#0284c7',
  LEAVE_APPROVED: '#16a34a',
  LEAVE_REJECTED: '#dc2626',
  LEAVE_CANCELLED: '#6e6e73',
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
    <div className="page-content" style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Audit Log' },
        ]}
        dotMatrixText="AUDIT"
        eyebrow="CRYPTOGRAPHIC LEDGER · SECURITY TRACEABILITY"
        title="Security Audit Log & Ledger"
        subtitle={`Complete immutable record of all system events. ${total.toLocaleString()} records indexed.`}
      />

      {/* Filter bar */}
      <div className="card" style={{ padding: 20 }}>
        <form method="GET" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="field-label">Action</label>
            <input
              name="action"
              type="text"
              className="input"
              placeholder="e.g. TASK_CREATED"
              defaultValue={actionFilter ?? ''}
              style={{ fontSize: 13 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="field-label">Entity Type</label>
            <input
              name="entity"
              type="text"
              className="input"
              placeholder="e.g. Task"
              defaultValue={entityFilter ?? ''}
              style={{ fontSize: 13 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="field-label">Actor (name or email)</label>
            <input
              name="actor"
              type="text"
              className="input"
              placeholder="Search actor…"
              defaultValue={actorFilter ?? ''}
              style={{ fontSize: 13 }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ height: 42, padding: '0 20px' }}>
            <Search size={14} style={{ marginRight: 6 }} /> Filter
          </button>
          {(actionFilter || entityFilter || actorFilter) && (
            <Link href="/admin/audit" className="btn-secondary" style={{ height: 42, padding: '0 16px' }}>
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Log entries */}
      {logs.length === 0 ? (
        <div className="card">
          <div className="empty">
            <Shield size={40} style={{ color: 'var(--grey-400)', margin: '0 auto 10px' }} />
            <div className="empty-title">No audit events match</div>
            <div className="empty-body">Try adjusting your filters or resetting the search parameters.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map((log) => {
            const color = ACTION_COLORS[log.action] ?? 'var(--grey-800)'
            return (
              <div
                key={log.id}
                className="cyber-card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 18px',
                  background: log.isImpersonated
                    ? 'rgba(220, 38, 38, 0.04)'
                    : 'var(--white)',
                  border: `1px solid ${log.isImpersonated ? 'rgba(220, 38, 38, 0.25)' : 'var(--grey-100)'}`,
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 12,
                }}
              >
                {/* Actor avatar */}
                <div
                  className="avatar avatar-sm"
                  style={{
                    flexShrink: 0,
                    fontSize: 10,
                    background: 'var(--grey-100)',
                    color: 'var(--grey-800)',
                  }}
                >
                  {getInitials(log.actor.name)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color,
                        background: 'var(--grey-50)',
                        border: '1px solid var(--grey-200)',
                        padding: '2px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {log.action}
                    </span>
                    {log.isImpersonated && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#dc2626',
                          background: 'rgba(220, 38, 38, 0.08)',
                          padding: '1px 7px',
                          borderRadius: 4,
                          border: '1px solid rgba(220, 38, 38, 0.2)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        IMPERSONATED
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--grey-600)',
                      display: 'flex',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      by <strong style={{ color: 'var(--grey-900)' }}>{log.actor.name}</strong>
                    </span>
                    <span style={{ color: 'var(--grey-400)', fontFamily: 'var(--font-mono)' }}>
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
                            background: 'rgba(220, 38, 38, 0.05)',
                            border: '1px solid rgba(220, 38, 38, 0.15)',
                            padding: '2px 8px',
                            borderRadius: 4,
                            color: '#b91c1c',
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          − {JSON.stringify(log.beforeState)}
                        </code>
                      )}
                      {log.afterState && (
                        <code
                          style={{
                            fontSize: 11,
                            background: 'rgba(22, 163, 74, 0.05)',
                            border: '1px solid rgba(22, 163, 74, 0.15)',
                            padding: '2px 8px',
                            borderRadius: 4,
                            color: '#15803d',
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            fontFamily: 'var(--font-mono)',
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
                    color: 'var(--grey-400)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    fontFamily: 'var(--font-mono)',
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
            <Link
              href={`/admin/audit?page=${page - 1}${actionFilter ? `&action=${actionFilter}` : ''}${entityFilter ? `&entity=${entityFilter}` : ''}${actorFilter ? `&actor=${actorFilter}` : ''}`}
              className="btn-secondary btn-sm"
            >
              ← Prev
            </Link>
          )}
          <span style={{ fontSize: 13, color: 'var(--grey-500)', fontFamily: 'var(--font-mono)' }}>
            Page {page} of {totalPages} ({total.toLocaleString()} events)
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/audit?page=${page + 1}${actionFilter ? `&action=${actionFilter}` : ''}${entityFilter ? `&entity=${entityFilter}` : ''}${actorFilter ? `&actor=${actorFilter}` : ''}`}
              className="btn-secondary btn-sm"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
