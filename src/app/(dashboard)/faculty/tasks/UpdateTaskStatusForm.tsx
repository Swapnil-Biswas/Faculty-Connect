'use client'

import { useActionState } from 'react'
import { updateTaskStatus } from '@/actions/tasks'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { TaskStatus } from '@prisma/client'

interface UpdateTaskStatusFormProps {
  taskId: string
  currentStatus: TaskStatus
}

const NEXT_STATUSES: Partial<Record<TaskStatus, TaskStatus[]>> = {
  OPEN: [TaskStatus.IN_PROGRESS],
  IN_PROGRESS: [TaskStatus.COMPLETED],
  OVERDUE: [TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED],
}

export function UpdateTaskStatusForm({ taskId, currentStatus }: UpdateTaskStatusFormProps) {
  const [state, formAction] = useActionState(updateTaskStatus, { success: false })

  const nextStatuses = NEXT_STATUSES[currentStatus] ?? []
  if (nextStatuses.length === 0) return null

  return (
    <form action={formAction}>
      <input type="hidden" name="taskId" value={taskId} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <select
          name="status"
          className="form-input"
          style={{ fontSize: 13, padding: '8px 12px', minWidth: 150 }}
          defaultValue=""
          required
        >
          <option value="" disabled>Update status…</option>
          {nextStatuses.map((s) => (
            <option key={s} value={s}>
              Mark as {s.replace('_', ' ')}
            </option>
          ))}
        </select>

        {state.error && (
          <span style={{ fontSize: 12, color: 'hsl(var(--color-danger))' }}>
            {state.error}
          </span>
        )}

        <SubmitButton label="Update" pendingLabel="Updating…" />
      </div>
    </form>
  )
}
