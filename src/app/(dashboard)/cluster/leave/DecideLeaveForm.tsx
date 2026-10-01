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
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          color: '#22C55E',
          background: 'rgba(34, 197, 94, 0.12)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          padding: '4px 10px',
          borderRadius: 6,
        }}
      >
        <CheckCircle2 size={14} /> DECISION RECORDED
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
              setTimeout(() => {
                const form = document.getElementById(`decide-form-${leaveId}`)
                ;(form as HTMLFormElement)?.requestSubmit()
              }, 50)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.08) 100%)',
              color: '#22C55E',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              borderRadius: 6,
              cursor: 'pointer',
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
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              background: 'rgba(244, 63, 94, 0.08)',
              color: '#F43F5E',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            <XCircle size={13} /> REJECT
          </button>
        </div>

        {/* Remarks field — show when rejecting (required reasoning) */}
        {decision === 'REJECTED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <textarea
              name="remarks"
              rows={2}
              placeholder="Reason for rejection (optional)…"
              style={{
                resize: 'none',
                fontSize: 12,
                fontFamily: 'var(--font-mono)',
                background: '#07090E',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 6,
                padding: '8px 12px',
                color: '#F8FAFC',
                outline: 'none',
              }}
            />
            {state.error && (
              <span style={{ fontSize: 11, color: '#F43F5E', fontFamily: 'var(--font-mono)' }}>
                {state.error}
              </span>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <SubmitButton
                label="CONFIRM REJECT"
                pendingLabel="REJECTING…"
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  background: 'rgba(244, 63, 94, 0.2)',
                  color: '#F43F5E',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              />
              <button
                type="button"
                onClick={() => setDecision(null)}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#94A3B8',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                CANCEL
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
