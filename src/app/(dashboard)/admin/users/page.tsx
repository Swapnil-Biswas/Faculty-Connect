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
    <div>
      <div className="page-header">
        <h2 className="page-title">
          User <span className="text-gradient">Management</span>
        </h2>
        <p className="page-subtitle">
          Create, manage roles, and assign cluster memberships for all users.
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 24 }}>
        {/* Create user form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'hsl(var(--color-primary) / 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'hsl(var(--color-primary))',
              }}
            >
              <UserPlus size={18} />
            </div>
            <h3 className="section-title" style={{ margin: 0 }}>Create User</h3>
          </div>
          <CreateUserForm clusters={clusters} />
        </div>

        {/* User list */}
        <div>
          {/* Search + filter */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <form method="GET" style={{ display: 'flex', gap: 10, flex: 1 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: 11,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'hsl(var(--text-muted))',
                  }}
                />
                <input
                  name="q"
                  type="text"
                  className="form-input"
                  placeholder="Search name or email…"
                  defaultValue={query ?? ''}
                  style={{ paddingLeft: 32, fontSize: 13 }}
                />
              </div>
              <select
                name="role"
                className="form-input"
                style={{ fontSize: 13, padding: '8px 12px' }}
                defaultValue={roleFilter ?? ''}
                onChange={(e) => (e.target.form as HTMLFormElement).submit()}
              >
                <option value="">All Roles</option>
                {['ADMIN', 'HOD', 'CLUSTER_HEAD', 'FACULTY'].map((r) => (
                  <option key={r} value={r}>{r.replace('_', ' ')}</option>
                ))}
              </select>
            </form>
          </div>

          <h3 className="section-title" style={{ marginBottom: 12 }}>
            Users ({users.length})
          </h3>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Cluster</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: 'center',
                        padding: '32px',
                        color: 'hsl(var(--text-muted))',
                      }}
                    >
                      <Users size={36} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                      <br />
                      No users match the current filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">{getInitials(u.name)}</div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 12, color: 'hsl(var(--text-muted))' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <RoleBadge role={u.role} />
                      </td>
                      <td style={{ fontSize: 13, color: 'hsl(var(--text-secondary))' }}>
                        {u.clusterMemberships[0]?.cluster.name ?? '—'}
                      </td>
                      <td style={{ fontSize: 12.5, color: 'hsl(var(--text-muted))' }}>
                        {formatDate(u.createdAt)}
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
