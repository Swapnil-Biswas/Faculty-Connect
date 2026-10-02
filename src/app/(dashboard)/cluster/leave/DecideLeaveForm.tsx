'use client'

import { useActionState } from 'react'
import { decideLeave } from '@/actions/leave'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'

interface DecideLeaveFormProps {
  leaveId: string
}

export function DecideLeaveForm({ leaveId }: DecideLeaveFormProps) {
  const [state, formAction] = useActionState(decideLeave, { success: false })
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null)

  if (state.success) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          fontWeight: 600,
          color: '#198754',
          backgroundColor: 'rgba(25, 135, 84, 0.08)',
          border: '1px solid rgba(25, 135, 84, 0.25)',
          padding: '4px 10px',
          borderRadius: 6,
        }}
      >
        <CheckCircle2 size={14} /> DECISION RECORDED
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Primary Action Buttons */}
      {decision !== 'REJECTED' && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              const form = document.getElementById(`approve-form-${leaveId}`) as HTMLFormElement
              form?.requestSubmit()
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: '#198754',
              color: '#FFFFFF',
              border: '1px solid #198754',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
          >
            <CheckCircle2 size={13} /> APPROVE
          </button>

          <button
            type="button"
            onClick={() => setDecision('REJECTED')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              color: '#C0392B',
              border: '1px solid #E4E7EC',
              borderRadius: 6,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <XCircle size={13} /> REJECT
          </button>
        </div>
      )}

      {/* Hidden form for instant Approve submission */}
      <form
        id={`approve-form-${leaveId}`}
        action={formAction}
        style={{ display: 'none' }}
      >
        <input type="hidden" name="leaveId" value={leaveId} />
        <input type="hidden" name="decision" value="APPROVED" />
      </form>

      {/* Rejection Remarks Form */}
      {decision === 'REJECTED' && (
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          <input type="hidden" name="leaveId" value={leaveId} />
          <input type="hidden" name="decision" value="REJECTED" />

          <label
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: '#17202A',
            }}
          >
            Reason for Rejection (Optional)
          </label>
          <textarea
            name="remarks"
            rows={2}
            placeholder="Specify reason for sanction refusal…"
            style={{
              resize: 'none',
              fontSize: 12.5,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: 6,
              padding: '8px 12px',
              color: '#17202A',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />

          {state.error && (
            <span style={{ fontSize: 11.5, color: '#C0392B' }}>
              {state.error}
            </span>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <SubmitButton
              label="CONFIRM REJECTION"
              pendingLabel="REJECTING…"
              style={{
                padding: '6px 14px',
                fontSize: 11.5,
                fontWeight: 600,
                backgroundColor: '#C0392B',
                color: '#FFFFFF',
                border: '1px solid #C0392B',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            />
            <button
              type="button"
              onClick={() => setDecision(null)}
              style={{
                padding: '6px 12px',
                fontSize: 11.5,
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E4E7EC',
                color: '#667085',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              CANCEL
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
