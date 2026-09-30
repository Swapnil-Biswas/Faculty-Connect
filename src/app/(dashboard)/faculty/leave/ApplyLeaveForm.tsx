'use client'

import { useActionState } from 'react'
import { applyLeave, type ActionState } from '@/actions/leave'
import { SubmitButton } from '@/components/ui/SubmitButton'

const initialState: ActionState = { success: false }

export function ApplyLeaveForm() {
  const [state, formAction] = useActionState(applyLeave, initialState)

  if (state.success) {
    return (
      <div
        style={{
          padding: '20px 24px',
          background: 'hsl(142 71% 45% / 0.08)',
          border: '1px solid hsl(142 71% 45% / 0.2)',
          borderRadius: 12,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'hsl(142 60% 35%)',
            marginBottom: 4,
          }}
        >
          Leave Applied Successfully
        </div>
        <div style={{ fontSize: 13, color: 'hsl(var(--text-secondary))' }}>
          Your application is pending review by your Cluster Head.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-outline"
          style={{ marginTop: 16, fontSize: 13 }}
        >
          Apply another
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="grid-2" style={{ gap: 14 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="startDate">
            Start Date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="form-input"
            required
            min={new Date().toISOString().split('T')[0]}
          />
          {state.fieldErrors?.startDate && (
            <span className="form-error">{state.fieldErrors.startDate[0]}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="endDate">
            End Date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            className="form-input"
            required
            min={new Date().toISOString().split('T')[0]}
          />
          {state.fieldErrors?.endDate && (
            <span className="form-error">{state.fieldErrors.endDate[0]}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="reason">
          Reason <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 400 }}>(min. 10 characters)</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          className="form-input"
          rows={4}
          placeholder="Please provide a brief reason for your leave request…"
          required
          minLength={10}
          maxLength={1000}
          style={{ resize: 'vertical' }}
        />
        {state.fieldErrors?.reason && (
          <span className="form-error">{state.fieldErrors.reason[0]}</span>
        )}
      </div>

      {state.error && (
        <div
          style={{
            padding: '10px 14px',
            background: 'hsl(0 84% 60% / 0.08)',
            border: '1px solid hsl(0 84% 60% / 0.2)',
            borderRadius: 8,
            fontSize: 13,
            color: 'hsl(0 70% 50%)',
          }}
        >
          {state.error}
        </div>
      )}

      <SubmitButton label="Submit Leave Application" pendingLabel="Submitting…" />
    </form>
  )
}
