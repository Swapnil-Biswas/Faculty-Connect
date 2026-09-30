'use client'

import { useTransition } from 'react'
import { deleteTask } from '@/actions/tasks'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm('Soft-delete this task? It will be marked as deleted but preserved in audit logs.')) return
    startTransition(async () => {
      const res = await deleteTask(taskId)
      if (res.success) router.refresh()
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="btn-ghost"
      style={{ color: 'hsl(var(--color-danger))', opacity: isPending ? 0.5 : 1 }}
      title="Soft-delete task"
      aria-label="Delete task"
    >
      <Trash2 size={16} />
    </button>
  )
}
