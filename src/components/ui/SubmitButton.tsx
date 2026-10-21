'use client'

import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/utils'

interface SubmitButtonProps {
  label: string
  pendingLabel?: string
  className?: string
  variant?: 'primary' | 'gradient' | 'outline' | 'danger'
  icon?: React.ReactNode
  style?: React.CSSProperties
}

export function SubmitButton({
  label,
  pendingLabel,
  className,
  variant = 'primary',
  icon,
  style = {},
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  const variantClass =
    variant === 'danger'
      ? 'btn-danger'
      : variant === 'outline'
      ? 'btn-outline'
      : 'btn-primary'

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(variantClass, className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        opacity: pending ? 0.7 : 1,
        cursor: pending ? 'not-allowed' : 'pointer',
        borderRadius: 0,
        ...style,
      }}
    >
      {pending ? (
        <>
          <svg
            style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
          {pendingLabel ?? label}
        </>
      ) : (
        <>
          {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
          {label}
        </>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  )
}

export default SubmitButton;