'use client'

import { useActionState } from 'react'
import { createTask } from '@/actions/tasks'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { CheckCircle2 } from 'lucide-react'

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
        style={{
          padding: '24px 20px',
          backgroundColor: 'rgba(25, 135, 84, 0.08)',
          border: '1px solid rgba(25, 135, 84, 0.25)',
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: '#198754' }}>
          <CheckCircle2 size={32} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#198754' }}>
          TASK ASSIGNED SUCCESSFULLY
        </div>
        <p style={{ fontSize: 13, color: '#667085', margin: '4px 0 16px 0' }}>
          The deliverable has been dispatched and logged in the cluster ledger.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '7px 16px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: 6,
            color: '#17202A',
            cursor: 'pointer',
          }}
        >
          Assign Another Task
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
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {clusterId && <input type="hidden" name="clusterId" value={clusterId} />}

      <div>
        <label style={labelStyle} htmlFor="task-title">
          Deliverable Title <span style={{ color: '#C0392B' }}>*</span>
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          style={inputStyle}
          placeholder="e.g. Prepare NBA Criterion 5 documentation"
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
        <label style={labelStyle} htmlFor="task-desc">
          Description (Optional)
        </label>
        <textarea
          id="task-desc"
          name="description"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Describe deliverables, required artifacts, or submission details…"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="task-assignee">
          Assign To Faculty <span style={{ color: '#C0392B' }}>*</span>
        </label>
        <select
          id="task-assignee"
          name="assignedToId"
          required
          defaultValue=""
          style={inputStyle}
        >
          <option value="" disabled>Select faculty member…</option>
          {faculty.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}{f.designation ? ` — ${f.designation}` : ''}
            </option>
          ))}
        </select>
        {state.fieldErrors?.assignedToId && (
          <span style={{ fontSize: 11.5, color: '#C0392B', marginTop: 4, display: 'block' }}>
            {state.fieldErrors.assignedToId[0]}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={labelStyle} htmlFor="task-priority">
            Priority
          </label>
          <select
            id="task-priority"
            name="priority"
            defaultValue="MEDIUM"
            style={inputStyle}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div>
          <label style={labelStyle} htmlFor="task-deadline">
            Deadline <span style={{ color: '#C0392B' }}>*</span>
          </label>
          <input
            id="task-deadline"
            name="deadline"
            type="date"
            required
            style={inputStyle}
            min={new Date().toISOString().split('T')[0]}
          />
          {state.fieldErrors?.deadline && (
            <span style={{ fontSize: 11.5, color: '#C0392B', marginTop: 4, display: 'block' }}>
              {state.fieldErrors.deadline[0]}
            </span>
          )}
        </div>
      </div>

      {state.error && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(192, 57, 43, 0.08)',
            border: '1px solid rgba(192, 57, 43, 0.25)',
            borderRadius: 6,
            color: '#C0392B',
            fontSize: 12.5,
          }}
        >
          {state.error}
        </div>
      )}

      <SubmitButton
        label="ASSIGN DELIVERABLE"
        pendingLabel="ASSIGNING DELIVERABLE…"
        style={{
          backgroundColor: '#173B67',
          color: '#FFFFFF',
          border: '1px solid #173B67',
          borderRadius: 6,
          padding: '10px 18px',
          fontWeight: 600,
          fontSize: 12.5,
          cursor: 'pointer',
          justifyContent: 'center',
          width: '100%',
        }}
      />
    </form>
  )
}
