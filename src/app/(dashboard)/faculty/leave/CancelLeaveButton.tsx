'use client'

import { useTransition } from 'react'
import { cancelLeave } from '@/actions/leave'
import { useRouter } from 'next/navigation'

export function CancelLeaveButton({ leaveId }: { leaveId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleCancel() {
    if (!confirm('Are you sure you want to cancel this leave request?')) return
    startTransition(async () => {
      const res = await cancelLeave(leaveId)
      if (res.success) router.refresh()
    })
  }

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="btn-outline"
      style={{
        padding: '6px 14px',
        fontSize: 12,
        color: 'hsl(var(--color-danger))',
        borderColor: 'hsl(var(--color-danger) / 0.3)',
        flexShrink: 0,
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? 'Cancelling…' : 'Cancel'}
    </button>
  )
}
