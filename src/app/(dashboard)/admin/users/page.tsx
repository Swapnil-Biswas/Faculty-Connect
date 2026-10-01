import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, getInitials } from '@/lib/utils'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { CreateUserForm } from './CreateUserForm'
import { UserActionsMenu } from './UserActionsMenu'
import { Users, UserPlus, Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'User Management — Admin' }

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>
}) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const params = await searchParams
  const roleFilter = params.role
  const query = params.q?.trim()

  const [users, clusters] = await Promise.all([
    db.user.findMany({
      where: {
        deletedAt: null,
        ...(roleFilter ? { role: roleFilter as never } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        clusterMemberships: {
          where: { leftAt: null },
          include: { cluster: { select: { name: true } } },
        },
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    }),
    db.cluster.findMany({ where: { deletedAt: null }, select: { id: true, name: true } }),
  ])

  return (
    <div className="page-content" style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* BMSIT High-Tech Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '3px 10px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38BDF8', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 10 }}>
            <span>●</span> IDENTITY & ACCESS // IAM DIRECTORY
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F8FAFC', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            User Management & Role Directory
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, fontFamily: 'var(--font-mono)' }}>
            // Provision users, assign administrative roles & allocate cluster memberships
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 6, background: 'rgba(14, 18, 27, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E', display: 'inline-block' }}></span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#E2E8F0' }}>
            {users.length} IDENTITIES ACTIVE
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', alignItems: 'start', gap: 24 }}>
        {/* Create user form */}
        <div
          style={{
            background: '#0E121B',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 14 }}>
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
              <UserPlus size={18} />
            </div>
            <div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
                // PROVISIONING CONSOLE
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>
                Create New User
              </h3>
            </div>
          </div>
          <CreateUserForm clusters={clusters} />
        </div>

        {/* User list */}
        <div
          style={{
            background: '#0E121B',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Search + filter */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <form method="GET" style={{ display: 'flex', gap: 10, flex: 1 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748B',
                  }}
                />
                <input
                  name="q"
                  type="text"
                  placeholder="Search by name or email…"
                  defaultValue={query ?? ''}
                  style={{
                    width: '100%',
                    paddingLeft: 34,
                    paddingRight: 12,
                    paddingTop: 8,
                    paddingBottom: 8,
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    background: '#07090E',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 6,
                    color: '#F8FAFC',
                    outline: 'none',
                  }}
                />
              </div>
              <select
                name="role"
                defaultValue={roleFilter ?? ''}
                onChange={(e) => (e.target.form as HTMLFormElement).submit()}
                style={{
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  padding: '8px 12px',
                  background: '#07090E',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 6,
                  color: '#CBD5E1',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="">ALL ROLES</option>
                {['ADMIN', 'HOD', 'CLUSTER_HEAD', 'FACULTY'].map((r) => (
                  <option key={r} value={r}>{r.replace('_', ' ')}</option>
                ))}
              </select>
            </form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
              // ENROLLED USERS ({users.length})
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700 }}>USER</th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700 }}>ROLE</th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700 }}>CLUSTER</th>
                  <th style={{ padding: '10px 14px', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#94A3B8', fontWeight: 700 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: 'center',
                        padding: '36px',
                        color: '#64748B',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                      <br />
                      // No users match the current query
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 6,
                              background: 'rgba(56, 189, 248, 0.1)',
                              border: '1px solid rgba(56, 189, 248, 0.25)',
                              color: '#38BDF8',
                              fontFamily: 'var(--font-mono)',
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <RoleBadge role={u.role} />
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                        {u.clusterMemberships[0]?.cluster.name ?? '—'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <UserActionsMenu
                          userId={u.id}
                          currentRole={u.role}
                          clusters={clusters}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
