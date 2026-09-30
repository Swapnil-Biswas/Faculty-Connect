'use client'

import { useActionState, useState } from 'react'
import { decideLeave } from '@/actions/leave'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { CheckCircle2, XCircle } from 'lucide-react'

export function HodDecideLeaveForm({ leaveId }: { leaveId: string }) {
  const [state, formAction] = useActionState(decideLeave, { success: false })
  const [mode, setMode] = useState<null | 'APPROVED' | 'REJECTED'>(null)

  if (state.success) {
    return (
      <span style={{ fontSize: 13, fontWeight: 600, color: 'hsl(var(--color-success))', display: 'flex', alignItems: 'center', gap: 5 }}>
        <CheckCircle2 size={15} /> Decision saved
      </span>
    )
  }

  if (!mode) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => setMode('APPROVED')}
          className="btn-gradient"
          style={{ padding: '6px 14px', fontSize: 12 }}
        >
          <CheckCircle2 size={13} /> Approve
        </button>
        <button
          type="button"
          onClick={() => setMode('REJECTED')}
          className="btn-outline"
          style={{ padding: '6px 14px', fontSize: 12, color: 'hsl(var(--color-danger))', borderColor: 'hsl(var(--color-danger) / 0.3)' }}
        >
          <XCircle size={13} /> Reject
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input type="hidden" name="leaveId" value={leaveId} />
      <input type="hidden" name="decision" value={mode} />

      {mode === 'REJECTED' && (
        <textarea
          name="remarks"
          className="form-input"
          rows={2}
          placeholder="Reason for rejection (optional)…"
          style={{ resize: 'none', fontSize: 13 }}
        />
      )}

      {state.error && (
        <span style={{ fontSize: 12, color: 'hsl(var(--color-danger))' }}>{state.error}</span>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <SubmitButton
          label={mode === 'APPROVED' ? 'Confirm Approve' : 'Confirm Reject'}
          pendingLabel="Saving…"
          variant={mode === 'REJECTED' ? 'danger' : 'gradient'}
        />
        <button
          type="button"
          onClick={() => setMode(null)}
          className="btn-outline"
          style={{ fontSize: 13 }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
