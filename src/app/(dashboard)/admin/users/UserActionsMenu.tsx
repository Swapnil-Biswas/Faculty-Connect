'use client'

import { useActionState, useState, useTransition } from 'react'
import { updateUserRole, assignUserToCluster, softDeleteUser } from '@/actions/admin'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'
import { MoreVertical, Pencil, Trash2, Users } from 'lucide-react'

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
        className="btn-ghost"
        onClick={() => setOpen((v) => !v)}
        aria-label="User actions"
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
              background: 'hsl(var(--bg-surface))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 10,
              boxShadow: 'var(--shadow-lg)',
              minWidth: mode ? 240 : 170,
              padding: 6,
            }}
          >
            {!mode && (
              <>
                <button
                  className="dropdown-item"
                  onClick={() => setMode('role')}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Pencil size={14} /> Change Role
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => setMode('cluster')}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Users size={14} /> Assign Cluster
                </button>
                <div style={{ height: 1, background: 'hsl(var(--border))', margin: '4px 0' }} />
                <button
                  className="dropdown-item"
                  onClick={() => setMode('delete')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    color: 'hsl(var(--color-danger))',
                  }}
                >
                  <Trash2 size={14} /> Delete User
                </button>
              </>
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
    <form action={formAction} style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input type="hidden" name="userId" value={userId} />
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
        Change Role
      </div>
      <select name="role" className="form-input" defaultValue={currentRole} style={{ fontSize: 13 }}>
        {(['FACULTY', 'CLUSTER_HEAD', 'HOD', 'ADMIN'] as Role[]).map((r) => (
          <option key={r} value={r}>{r.replace('_', ' ')}</option>
        ))}
      </select>
      {state.error && <span style={{ fontSize: 12, color: 'hsl(var(--color-danger))' }}>{state.error}</span>}
      <SubmitButton label="Save" pendingLabel="Saving…" />
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
    <form action={formAction} style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input type="hidden" name="userId" value={userId} />
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
        Assign to Cluster
      </div>
      <select name="clusterId" className="form-input" defaultValue="" style={{ fontSize: 13 }}>
        <option value="" disabled>Select cluster…</option>
        {clusters.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {state.error && <span style={{ fontSize: 12, color: 'hsl(var(--color-danger))' }}>{state.error}</span>}
      <SubmitButton label="Assign" pendingLabel="Assigning…" />
    </form>
  )
}

function DeleteUserConfirm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  return (
    <div style={{ padding: '8px 4px' }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'hsl(var(--color-danger))', marginBottom: 8 }}>
        Soft-delete this user?
      </div>
      <div style={{ fontSize: 12, color: 'hsl(var(--text-secondary))', marginBottom: 10 }}>
        They will be deactivated and cannot log in. Audit logs are preserved.
      </div>
      {error && <div style={{ fontSize: 12, color: 'hsl(var(--color-danger))', marginBottom: 8 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          disabled={isPending}
          className="btn-outline"
          style={{ fontSize: 12, padding: '6px 14px', flex: 1, color: 'hsl(var(--color-danger))', borderColor: 'hsl(var(--color-danger) / 0.3)' }}
          onClick={() => {
            startTransition(async () => {
              const res = await softDeleteUser(userId)
              if (res.success) { router.refresh(); onDone() }
              else setError(res.error ?? 'Error')
            })
          }}
        >
          {isPending ? 'Deleting…' : 'Confirm Delete'}
        </button>
        <button className="btn-ghost" onClick={onDone} style={{ fontSize: 12 }}>Cancel</button>
      </div>
    </div>
  )
}
