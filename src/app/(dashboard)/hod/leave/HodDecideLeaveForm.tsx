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
      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#198754', display: 'flex', alignItems: 'center', gap: 5 }}>
        <CheckCircle2 size={14} /> Decision recorded
      </span>
    )
  }

  if (!mode) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setMode('APPROVED')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: '#FFFFFF',
            backgroundColor: '#198754',
            border: '1px solid #198754',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          <CheckCircle2 size={13} /> Approve
        </button>
        <button
          type="button"
          onClick={() => setMode('REJECTED')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: '#C0392B',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(192, 57, 43, 0.35)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          <XCircle size={13} /> Reject
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 }}>
      <input type="hidden" name="leaveId" value={leaveId} />
      <input type="hidden" name="decision" value={mode} />

      {mode === 'REJECTED' && (
        <textarea
          name="remarks"
          className="form-input"
          rows={2}
          placeholder="Reason for rejection (optional)…"
          style={{
            resize: 'none',
            fontSize: 12,
            padding: '6px 10px',
            border: '1px solid #E4E7EC',
            borderRadius: 6,
          }}
        />
      )}

      {state.error && (
        <span style={{ fontSize: 11.5, color: '#C0392B' }}>{state.error}</span>
      )}

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <SubmitButton
          label={mode === 'APPROVED' ? 'Confirm Approval' : 'Confirm Rejection'}
          pendingLabel="Recording…"
          style={{
            fontSize: 12,
            padding: '6px 12px',
            backgroundColor: mode === 'REJECTED' ? '#C0392B' : '#198754',
            borderColor: mode === 'REJECTED' ? '#C0392B' : '#198754',
            color: '#FFFFFF',
            borderRadius: 6,
          }}
        />
        <button
          type="button"
          onClick={() => setMode(null)}
          style={{
            fontSize: 12,
            padding: '6px 10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: 6,
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
