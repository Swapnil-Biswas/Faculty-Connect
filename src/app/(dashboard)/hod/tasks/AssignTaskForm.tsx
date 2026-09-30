'use client'

import { useActionState } from 'react'
import { createTask } from '@/actions/tasks'
import { SubmitButton } from '@/components/ui/SubmitButton'

interface FacultyOption {
  id: string
  name: string
  designation: string | null
}

interface ClusterOption {
  id: string
  name: string
}

export function AssignTaskForm({
  faculty,
  clusters,
}: {
  faculty: FacultyOption[]
  clusters: ClusterOption[]
}) {
  const [state, formAction] = useActionState(createTask, { success: false })

  if (state.success) {
    return (
      <div
        style={{
          padding: '20px',
          background: 'hsl(142 71% 45% / 0.08)',
          border: '1px solid hsl(142 71% 45% / 0.2)',
          borderRadius: 12,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(142 60% 35%)' }}>
          Task Assigned!
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-outline"
          style={{ marginTop: 14, fontSize: 13 }}
        >
          Assign another
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="form-group">
        <label className="form-label" htmlFor="hod-task-title">Title</label>
        <input
          id="hod-task-title"
          name="title"
          type="text"
          className="form-input"
          placeholder="e.g. Update accreditation records"
          required
          minLength={3}
        />
        {state.fieldErrors?.title && (
          <span className="form-error">{state.fieldErrors.title[0]}</span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="hod-task-desc">Description</label>
        <textarea
          id="hod-task-desc"
          name="description"
          className="form-input"
          rows={2}
          placeholder="Optional details…"
          style={{ resize: 'vertical' }}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="hod-task-assignee">Assign To</label>
        <select
          id="hod-task-assignee"
          name="assignedToId"
          className="form-input"
          required
          defaultValue=""
        >
          <option value="" disabled>Select faculty member…</option>
          {faculty.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}{f.designation ? ` — ${f.designation}` : ''}
            </option>
          ))}
        </select>
        {state.fieldErrors?.assignedToId && (
          <span className="form-error">{state.fieldErrors.assignedToId[0]}</span>
        )}
      </div>

      <div className="grid-2" style={{ gap: 12 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="hod-task-priority">Priority</label>
          <select
            id="hod-task-priority"
            name="priority"
            className="form-input"
            defaultValue="MEDIUM"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="hod-task-deadline">Deadline</label>
          <input
            id="hod-task-deadline"
            name="deadline"
            type="date"
            className="form-input"
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
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

      <SubmitButton label="Assign Task" pendingLabel="Assigning…" />
    </form>
  )
}
