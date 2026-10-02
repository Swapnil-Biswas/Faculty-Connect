import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getInitials } from '@/lib/utils'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { CreateUserForm } from './CreateUserForm'
import { UserActionsMenu } from './UserActionsMenu'
import { Users, UserPlus, Search } from 'lucide-react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui/PageHeader'

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
      <PageHeader
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Users' },
        ]}
        dotMatrixText="USERS"
        eyebrow="IDENTITY & ACCESS · IAM DIRECTORY"
        title="User Management & Role Directory"
        subtitle="Provision users, assign administrative roles & allocate cluster memberships."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: 'var(--grey-50)', border: '1px solid var(--grey-200)' }}>
            <span className="tech-led led-green" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--grey-800)' }}>
              {users.length} IDENTITIES ACTIVE
            </span>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', alignItems: 'start', gap: 24 }}>
        {/* Create user form */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, borderBottom: '1px solid var(--grey-100)', paddingBottom: 14 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: 'var(--grey-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--grey-800)',
              }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <span className="section-eyebrow" style={{ marginBottom: 2 }}>
                // PROVISIONING CONSOLE
              </span>
              <h3 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--grey-900)' }}>
                Create New User
              </h3>
            </div>
          </div>
          <CreateUserForm clusters={clusters} />
        </div>

        {/* User list */}
        <div className="card" style={{ padding: 24 }}>
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
                    color: 'var(--grey-400)',
                  }}
                />
                <input
                  name="q"
                  type="text"
                  placeholder="Search by name or email…"
                  defaultValue={query ?? ''}
                  className="input"
                  style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 12 }}
                />
              </div>
              <select
                name="role"
                defaultValue={roleFilter ?? ''}
                className="select"
                style={{ width: 'auto', fontSize: 12, padding: '8px 12px' }}
              >
                <option value="">ALL ROLES</option>
                {['ADMIN', 'HOD', 'CLUSTER_HEAD', 'FACULTY'].map((r) => (
                  <option key={r} value={r}>{r.replace('_', ' ')}</option>
                ))}
              </select>
            </form>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--grey-100)', paddingBottom: 10 }}>
            <span className="section-eyebrow" style={{ margin: 0 }}>
              // ENROLLED USERS ({users.length})
            </span>
          </div>

          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>CLUSTER</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: 'var(--grey-400)' }}>
                      <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                      <br />
                      // No users match the current query
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="cyber-row-hover">
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
                            {getInitials(u.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-900)' }}>{u.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--grey-500)', fontFamily: 'var(--font-mono)' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <RoleBadge role={u.role} />
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--grey-600)', fontFamily: 'var(--font-mono)' }}>
                        {u.clusterMemberships[0]?.cluster.name ?? '—'}
                      </td>
                      <td>
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
