'use client'

import { useActionState, useState, useTransition } from 'react'
import { updateUserRole, assignUserToCluster, softDeleteUser } from '@/actions/admin'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'
import { MoreVertical, Pencil, Trash2, Users, AlertTriangle } from 'lucide-react'

interface Props {
  userId: string
  currentRole: Role
  clusters: { id: string; name: string }[]
}

export function UserActionsMenu({ userId, currentRole, clusters }: Props) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'role' | 'cluster' | 'delete' | null>(null)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User actions"
        style={{
          background: 'none',
          border: 'none',
          padding: '6px',
          borderRadius: 6,
          cursor: 'pointer',
          color: '#667085',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.15s ease, background-color 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F2F4F7')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => { setOpen(false); setMode(null) }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              zIndex: 50,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: 8,
              boxShadow: '0 10px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.05)',
              minWidth: mode ? 240 : 180,
              padding: 6,
            }}
          >
            {!mode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  onClick={() => setMode('role')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#17202A',
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F8FA')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Pencil size={14} color="#667085" />
                  <span>Change Role</span>
                </button>

                <button
                  onClick={() => setMode('cluster')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#17202A',
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F8FA')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Users size={14} color="#667085" />
                  <span>Assign Cluster</span>
                </button>

                <div style={{ height: 1, backgroundColor: '#F2F4F7', margin: '4px 0' }} />

                <button
                  onClick={() => setMode('delete')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#C0392B',
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(192, 57, 43, 0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Trash2 size={14} color="#C0392B" />
                  <span>Deactivate User</span>
                </button>
              </div>
            )}

            {mode === 'role' && (
              <ChangeRoleForm
                userId={userId}
                currentRole={currentRole}
                onDone={() => { setMode(null); setOpen(false) }}
              />
            )}

            {mode === 'cluster' && (
              <AssignClusterForm
                userId={userId}
                clusters={clusters}
                onDone={() => { setMode(null); setOpen(false) }}
              />
            )}

            {mode === 'delete' && (
              <DeleteUserConfirm
                userId={userId}
                onDone={() => { setMode(null); setOpen(false) }}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ChangeRoleForm({
  userId,
  currentRole,
  onDone,
}: {
  userId: string
  currentRole: Role
  onDone: () => void
}) {
  const [state, formAction] = useActionState(updateUserRole, { success: false })
  if (state.success) { onDone(); return null }

  return (
    <form action={formAction} style={{ padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input type="hidden" name="userId" value={userId} />
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#17202A' }}>
        Change Institutional Role
      </div>
      <select
        name="role"
        defaultValue={currentRole}
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4E7EC',
          borderRadius: 6,
          padding: '7px 10px',
          fontSize: 12.5,
          color: '#17202A',
          outline: 'none',
        }}
      >
        {(['FACULTY', 'CLUSTER_HEAD', 'HOD', 'ADMIN'] as Role[]).map((r) => (
          <option key={r} value={r}>{r.replace('_', ' ')}</option>
        ))}
      </select>
      {state.error && <span style={{ fontSize: 11.5, color: '#C0392B' }}>{state.error}</span>}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <SubmitButton
          label="Save"
          pendingLabel="Saving…"
          style={{
            flex: 1,
            backgroundColor: '#173B67',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 6,
            padding: '7px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        />
        <button
          type="button"
          onClick={onDone}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: 6,
            padding: '7px 12px',
            fontSize: 12,
            color: '#667085',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function AssignClusterForm({
  userId,
  clusters,
  onDone,
}: {
  userId: string
  clusters: { id: string; name: string }[]
  onDone: () => void
}) {
  const [state, formAction] = useActionState(assignUserToCluster, { success: false })
  if (state.success) { onDone(); return null }

  return (
    <form action={formAction} style={{ padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input type="hidden" name="userId" value={userId} />
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#17202A' }}>
        Assign Academic Cluster
      </div>
      <select
        name="clusterId"
        defaultValue=""
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E4E7EC',
          borderRadius: 6,
          padding: '7px 10px',
          fontSize: 12.5,
          color: '#17202A',
          outline: 'none',
        }}
      >
        <option value="" disabled>Select cluster…</option>
        {clusters.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {state.error && <span style={{ fontSize: 11.5, color: '#C0392B' }}>{state.error}</span>}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <SubmitButton
          label="Assign"
          pendingLabel="Assigning…"
          style={{
            flex: 1,
            backgroundColor: '#173B67',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 6,
            padding: '7px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        />
        <button
          type="button"
          onClick={onDone}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: 6,
            padding: '7px 12px',
            fontSize: 12,
            color: '#667085',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function DeleteUserConfirm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  return (
    <div style={{ padding: '8px 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#C0392B', marginBottom: 6 }}>
        <AlertTriangle size={15} />
        <span>Deactivate Account</span>
      </div>
      <div style={{ fontSize: 12, color: '#667085', lineHeight: 1.4, marginBottom: 12 }}>
        The user will be soft-deleted and prevented from logging in. Audit logs remain intact.
      </div>
      {error && <div style={{ fontSize: 11.5, color: '#C0392B', marginBottom: 8 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const res = await softDeleteUser(userId)
              if (res.success) { router.refresh(); onDone() }
              else setError(res.error ?? 'Error')
            })
          }}
          style={{
            flex: 1,
            backgroundColor: '#C0392B',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 6,
            padding: '7px 12px',
            fontSize: 12,
            fontWeight: 600,
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Deactivating…' : 'Deactivate'}
        </button>
        <button
          onClick={onDone}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: 6,
            padding: '7px 12px',
            fontSize: 12,
            color: '#667085',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
