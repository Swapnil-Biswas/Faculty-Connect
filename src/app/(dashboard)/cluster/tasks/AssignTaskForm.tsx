'use client'

import { useActionState } from 'react'
import { createTask } from '@/actions/tasks'
import { SubmitButton } from '@/components/ui/SubmitButton'

interface FacultyOption {
  id: string
  name: string
  designation: string | null
}

export function AssignTaskForm({ faculty }: { faculty: FacultyOption[] }) {
  const [state, formAction] = useActionState(createTask, { success: false })

  if (state.success) {
    return (
      <div
        style={{
          padding: '24px',
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          borderRadius: 8,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#22C55E', fontFamily: 'var(--font-mono)' }}>
          TASK ASSIGNED SUCCESSFULLY
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 14,
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            padding: '8px 16px',
            borderRadius: 6,
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#E2E8F0',
            cursor: 'pointer',
          }}
        >
          ASSIGN ANOTHER TASK
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="task-title">
          TASK TITLE
        </label>
        <input
          id="task-title"
          name="title"
          type="text"
          placeholder="e.g. Prepare NBA Criterion 5 documentation"
          required
          minLength={3}
          style={{
            background: '#07090E',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#F8FAFC',
            fontSize: 13,
            outline: 'none',
          }}
        />
        {state.fieldErrors?.title && (
          <span style={{ color: '#F43F5E', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{state.fieldErrors.title[0]}</span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="task-desc">
          DESCRIPTION (OPTIONAL)
        </label>
        <textarea
          id="task-desc"
          name="description"
          rows={3}
          placeholder="Describe deliverables, required artifacts, or submission details…"
          style={{
            background: '#07090E',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#F8FAFC',
            fontSize: 13,
            outline: 'none',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="task-assignee">
          ASSIGN TO FACULTY
        </label>
        <select
          id="task-assignee"
          name="assignedToId"
          required
          defaultValue=""
          style={{
            background: '#07090E',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#F8FAFC',
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            outline: 'none',
          }}
        >
          <option value="" disabled>Select faculty member…</option>
          {faculty.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}{f.designation ? ` — ${f.designation}` : ''}
            </option>
          ))}
        </select>
        {state.fieldErrors?.assignedToId && (
          <span style={{ color: '#F43F5E', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{state.fieldErrors.assignedToId[0]}</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="task-priority">
            PRIORITY
          </label>
          <select
            id="task-priority"
            name="priority"
            defaultValue="MEDIUM"
            style={{
              background: '#07090E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#F8FAFC',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="task-deadline">
            DEADLINE
          </label>
          <input
            id="task-deadline"
            name="deadline"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            style={{
              background: '#07090E',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 8,
              padding: '10px 14px',
              color: '#F8FAFC',
              fontSize: 13,
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
          />
          {state.fieldErrors?.deadline && (
            <span style={{ color: '#F43F5E', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{state.fieldErrors.deadline[0]}</span>
          )}
        </div>
      </div>

      {state.error && (
        <div
          style={{
            padding: '10px 14px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color: '#F43F5E',
          }}
        >
          {state.error}
        </div>
      )}

      <SubmitButton
        label="ASSIGN TASK"
        pendingLabel="ASSIGNING…"
        style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          color: '#0A0D14',
          border: 'none',
          borderRadius: 8,
          padding: '10px 18px',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 0 16px rgba(245, 158, 11, 0.35)',
          marginTop: 4,
        }}
      />
    </form>
  )
}
