import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getInitials } from '@/lib/utils'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { CreateUserForm } from './CreateUserForm'
import { UserActionsMenu } from './UserActionsMenu'
import { Users, UserPlus, Search, Filter } from 'lucide-react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui/PageHeader'

export const metadata: Metadata = { title: 'User Directory — Admin | Faculty Connect' }

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
    <div
      style={{
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        backgroundColor: '#F7F8FA',
        minHeight: '100%',
      }}
    >
      <PageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'User Directory' },
        ]}
        title="User Directory"
        subtitle="Provision institutional accounts, manage administrative roles, and allocate cluster memberships."
        actions={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              fontSize: 12,
              fontWeight: 600,
              color: '#17202A',
            }}
          >
            <Users size={14} color="#667085" />
            <span>{users.length} {users.length === 1 ? 'Account' : 'Accounts'} Listed</span>
          </div>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          alignItems: 'start',
          gap: 24,
        }}
      >
        {/* Create user form */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid #F2F4F7',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: '#F2F4F7',
                border: '1px solid #E4E7EC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#173B67',
                flexShrink: 0,
              }}
            >
              <UserPlus size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#17202A' }}>
                Provision New Account
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#667085' }}>
                Create credentials, assign role, and set initial profile details.
              </p>
            </div>
          </div>
          <CreateUserForm clusters={clusters} />
        </div>

        {/* User list */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: 12,
            padding: 24,
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 18,
              paddingBottom: 14,
              borderBottom: '1px solid #F2F4F7',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#17202A' }}>
                Enrolled Directory
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#667085' }}>
                Search, inspect, and configure accounts across institutional roles.
              </p>
            </div>
          </div>

          {/* Search + filter */}
          <form
            method="GET"
            style={{
              display: 'flex',
              gap: 10,
              marginBottom: 18,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#98A2B3',
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
                  fontSize: 12.5,
                  borderRadius: 6,
                  border: '1px solid #E4E7EC',
                  backgroundColor: '#FFFFFF',
                  color: '#17202A',
                  outline: 'none',
                }}
              />
            </div>
            <select
              name="role"
              defaultValue={roleFilter ?? ''}
              style={{
                width: 'auto',
                fontSize: 12.5,
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #E4E7EC',
                backgroundColor: '#FFFFFF',
                color: '#17202A',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">All Roles</option>
              <option value="FACULTY">Faculty</option>
              <option value="CLUSTER_HEAD">Cluster Head</option>
              <option value="HOD">Head of Department</option>
              <option value="ADMIN">Administrator</option>
            </select>
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                fontWeight: 600,
                padding: '8px 14px',
                borderRadius: 6,
                backgroundColor: '#173B67',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Filter size={13} />
              Filter
            </button>
            {(query || roleFilter) && (
              <a
                href="/admin/users"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: 12.5,
                  padding: '8px 12px',
                  borderRadius: 6,
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E4E7EC',
                  color: '#667085',
                  textDecoration: 'none',
                }}
              >
                Clear
              </a>
            )}
          </form>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid #E4E7EC' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#667085', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    User
                  </th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#667085', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Role
                  </th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#667085', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Cluster
                  </th>
                  <th style={{ padding: '10px 12px', fontWeight: 600, color: '#667085', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'right' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '40px 16px', color: '#667085' }}>
                      <Users size={32} style={{ margin: '0 auto 8px', color: '#98A2B3' }} />
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#17202A' }}>No matching users found</div>
                      <p style={{ fontSize: 12, color: '#667085', margin: '4px 0 0 0' }}>
                        Try adjusting your search criteria or clear active filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const clusterName = u.clusterMemberships[0]?.cluster.name
                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: '1px solid #F2F4F7',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                backgroundColor: '#173B67',
                                color: '#FFFFFF',
                                fontSize: 11.5,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(u.name)}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#17202A' }}>
                                {u.name}
                              </div>
                              <div style={{ fontSize: 11.5, color: '#667085' }}>
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <RoleBadge role={u.role} />
                        </td>
                        <td style={{ padding: '12px', fontSize: 12.5, color: clusterName ? '#17202A' : '#98A2B3' }}>
                          {clusterName ? (
                            <span style={{ fontWeight: 500 }}>{clusterName}</span>
                          ) : (
                            <span style={{ fontStyle: 'italic', fontSize: 12 }}>Unassigned</span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <UserActionsMenu
                            userId={u.id}
                            currentRole={u.role}
                            clusters={clusters}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
