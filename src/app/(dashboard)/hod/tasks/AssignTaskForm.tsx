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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#17202A',
    marginBottom: 6,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    fontSize: 13,
    color: '#17202A',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E7EC',
    borderRadius: 6,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <label style={labelStyle} htmlFor="hod-task-title">
          Deliverable Title <span style={{ color: '#C0392B' }}>*</span>
        </label>
        <input
          id="hod-task-title"
          name="title"
          type="text"
          style={inputStyle}
          placeholder="e.g. Update NBA Criterion 5 records"
          required
          minLength={3}
        />
        {state.fieldErrors?.title && (
          <span style={{ fontSize: 11.5, color: '#C0392B', marginTop: 4, display: 'block' }}>
            {state.fieldErrors.title[0]}
          </span>
        )}
      </div>

      <div>
        <label style={labelStyle} htmlFor="hod-task-desc">
          Description
        </label>
        <textarea
          id="hod-task-desc"
          name="description"
          style={inputStyle}
          rows={3}
          placeholder="Detailed expectations and scope…"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="hod-task-assignee">
          Assign To Faculty <span style={{ color: '#C0392B' }}>*</span>
        </label>
        <select
          id="hod-task-assignee"
          name="assignedToId"
          style={inputStyle}
          required
          defaultValue=""
        >
          <option value="" disabled>Select faculty member across clusters…</option>
          {faculty.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}{f.designation ? ` (${f.designation})` : ''}
            </option>
          ))}
        </select>
        {state.fieldErrors?.assignedToId && (
          <span style={{ fontSize: 11.5, color: '#C0392B', marginTop: 4, display: 'block' }}>
            {state.fieldErrors.assignedToId[0]}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle} htmlFor="hod-task-priority">
            Priority
          </label>
          <select
            id="hod-task-priority"
            name="priority"
            style={inputStyle}
            defaultValue="MEDIUM"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div>
          <label style={labelStyle} htmlFor="hod-task-deadline">
            Deadline <span style={{ color: '#C0392B' }}>*</span>
          </label>
          <input
            id="hod-task-deadline"
            name="deadline"
            type="date"
            style={inputStyle}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {state.error && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: '#FDECEA',
            border: '1px solid #F5C6CB',
            borderRadius: 6,
            fontSize: 12.5,
            color: '#C0392B',
          }}
        >
          {state.error}
        </div>
      )}

      <SubmitButton label="Dispatch Task" pendingLabel="Dispatching…" />
    </form>
  )
}
