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
          fontSize: 13,
          fontWeight: 600,
          color: 'hsl(var(--color-success))',
        }}
      >
        <CheckCircle2 size={16} />
        Decision saved
      </div>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="leaveId" value={leaveId} />
      {decision && <input type="hidden" name="decision" value={decision} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Quick approve / reject buttons that set decision then submit */}
          <button
            type="button"
            onClick={() => {
              setDecision('APPROVED')
              // submit the form after state updates
              setTimeout(() => {
                const form = document.getElementById(`decide-form-${leaveId}`)
                ;(form as HTMLFormElement)?.requestSubmit()
              }, 50)
            }}
            className="btn-gradient"
            style={{ padding: '7px 16px', fontSize: 12 }}
          >
            <CheckCircle2 size={14} /> Approve
          </button>

          <button
            type="button"
            onClick={() => setDecision('REJECTED')}
            className="btn-outline"
            style={{
              padding: '7px 16px',
              fontSize: 12,
              color: 'hsl(var(--color-danger))',
              borderColor: 'hsl(var(--color-danger) / 0.3)',
            }}
          >
            <XCircle size={14} /> Reject
          </button>
        </div>

        {/* Remarks field — show when rejecting (required reasoning) */}
        {decision === 'REJECTED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              name="remarks"
              className="form-input"
              rows={2}
              placeholder="Reason for rejection (optional)…"
              style={{ resize: 'none', fontSize: 13 }}
            />
            {state.error && (
              <span style={{ fontSize: 12, color: 'hsl(var(--color-danger))' }}>
                {state.error}
              </span>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <SubmitButton
                label="Confirm Reject"
                pendingLabel="Rejecting…"
                variant="danger"
              />
              <button
                type="button"
                onClick={() => setDecision(null)}
                className="btn-outline"
                style={{ fontSize: 13 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden form for programmatic submit (approve path) */}
      <form
        id={`decide-form-${leaveId}`}
        action={formAction}
        style={{ display: 'none' }}
      >
        <input type="hidden" name="leaveId" value={leaveId} />
        <input type="hidden" name="decision" value="APPROVED" />
      </form>
    </form>
  )
}
