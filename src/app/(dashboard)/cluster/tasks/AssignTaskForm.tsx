'use client'

import { useActionState } from 'react'
import { createTask } from '@/actions/tasks'
import { SubmitButton } from '@/components/ui/SubmitButton'

interface FacultyOption {
  id: string
  name: string
  designation: string | null
}

export function AssignTaskForm({ faculty, clusterId }: { faculty: FacultyOption[]; clusterId?: string }) {
  const [state, formAction] = useActionState(createTask, { success: false })

  if (state.success) {
    return (
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'rgba(22, 163, 74, 0.08)',
          border: '1px solid rgba(22, 163, 74, 0.25)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-green)', fontFamily: 'var(--font-mono)' }}>
          TASK ASSIGNED SUCCESSFULLY
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary"
          style={{ marginTop: 14, fontSize: 12, padding: '6px 14px' }}
        >
          ASSIGN ANOTHER TASK
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {clusterId && <input type="hidden" name="clusterId" value={clusterId} />}

      <div className="field">
        <label className="field-label" htmlFor="task-title">
          TASK TITLE <span className="req">*</span>
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          className="input"
          placeholder="e.g. Prepare NBA Criterion 5 documentation"
          required
          minLength={3}
        />
        {state.fieldErrors?.title && (
          <span className="field-hint" style={{ color: 'var(--color-red)' }}>{state.fieldErrors.title[0]}</span>
        )}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="task-desc">
          DESCRIPTION (OPTIONAL)
        </label>
        <textarea
          id="task-desc"
          name="description"
          rows={3}
          className="textarea"
          placeholder="Describe deliverables, required artifacts, or submission details…"
        />
      </div>

      <div className="field">
        <label className="field-label" htmlFor="task-assignee">
          ASSIGN TO FACULTY <span className="req">*</span>
        </label>
        <select
          id="task-assignee"
          name="assignedToId"
          required
          defaultValue=""
          className="select"
        >
          <option value="" disabled>Select faculty member…</option>
          {faculty.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}{f.designation ? ` — ${f.designation}` : ''}
            </option>
          ))}
        </select>
        {state.fieldErrors?.assignedToId && (
          <span className="field-hint" style={{ color: 'var(--color-red)' }}>{state.fieldErrors.assignedToId[0]}</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="field">
          <label className="field-label" htmlFor="task-priority">
            PRIORITY
          </label>
          <select
            id="task-priority"
            name="priority"
            defaultValue="MEDIUM"
            className="select"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="task-deadline">
            DEADLINE <span className="req">*</span>
          </label>
          <input
            id="task-deadline"
            name="deadline"
            type="date"
            required
            className="input"
            min={new Date().toISOString().split('T')[0]}
          />
          {state.fieldErrors?.deadline && (
            <span className="field-hint" style={{ color: 'var(--color-red)' }}>{state.fieldErrors.deadline[0]}</span>
          )}
        </div>
      </div>

      {state.error && (
        <div className="form-error">
          {state.error}
        </div>
      )}

      <SubmitButton
        label="ASSIGN TASK"
        pendingLabel="ASSIGNING…"
        className="btn-primary"
      />
    </form>
  )
}
