'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/actions/admin'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface ClusterOption {
  id: string
  name: string
}

export function CreateUserForm({ clusters }: { clusters: ClusterOption[] }) {
  const [resetKey, setResetKey] = useState(0)
  const router = useRouter()

  return (
    <CreateUserFormInner
      key={resetKey}
      clusters={clusters}
      onReset={() => {
        setResetKey((k) => k + 1)
        router.refresh()
      }}
    />
  )
}

function CreateUserFormInner({
  clusters: _clusters,
  onReset,
}: {
  clusters: ClusterOption[]
  onReset: () => void
}) {
  const [state, formAction] = useActionState(createUser, { success: false })

  if (state.success) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: 8,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <CheckCircle2 size={28} color="#16A34A" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>
            User Account Created Successfully
          </div>
          <div style={{ fontSize: 12.5, color: '#667085', marginTop: 4 }}>
            The account is now active and ready for authentication and cluster assignment.
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          style={{
            marginTop: 8,
            fontSize: 12.5,
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: 6,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4E7EC',
            color: '#17202A',
            cursor: 'pointer',
          }}
        >
          Create Another User
        </button>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E4E7EC',
    borderRadius: 8,
    padding: '9px 12px',
    color: '#17202A',
    fontSize: 13,
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12.5,
    fontWeight: 600,
    color: '#17202A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle} htmlFor="cu-name">
            Full Name <span style={{ color: '#C0392B', fontWeight: 400 }}>*</span>
          </label>
          <input
            id="cu-name"
            name="name"
            type="text"
            placeholder="e.g. Dr. Jane Smith"
            required
            style={inputStyle}
          />
          {state.fieldErrors?.name && (
            <span style={{ color: '#C0392B', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={12} /> {state.fieldErrors.name[0]}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle} htmlFor="cu-email">
            Institutional Email <span style={{ color: '#C0392B', fontWeight: 400 }}>*</span>
          </label>
          <input
            id="cu-email"
            name="email"
            type="email"
            placeholder="e.g. janesmith@bmsit.in"
            required
            style={inputStyle}
          />
          {state.fieldErrors?.email && (
            <span style={{ color: '#C0392B', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={12} /> {state.fieldErrors.email[0]}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={labelStyle} htmlFor="cu-password">
          Temporary Password <span style={{ color: '#C0392B', fontWeight: 400 }}>*</span>
        </label>
        <input
          id="cu-password"
          name="password"
          type="password"
          placeholder="Minimum 8 characters"
          required
          minLength={8}
          style={inputStyle}
        />
        {state.fieldErrors?.password && (
          <span style={{ color: '#C0392B', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <AlertCircle size={12} /> {state.fieldErrors.password[0]}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle} htmlFor="cu-role">
            Institutional Role <span style={{ color: '#C0392B', fontWeight: 400 }}>*</span>
          </label>
          <select
            id="cu-role"
            name="role"
            defaultValue="FACULTY"
            style={{
              ...inputStyle,
              cursor: 'pointer',
            }}
          >
            <option value="FACULTY">Faculty</option>
            <option value="CLUSTER_HEAD">Cluster Head</option>
            <option value="HOD">Head of Department</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={labelStyle} htmlFor="cu-designation">
            Official Designation
          </label>
          <input
            id="cu-designation"
            name="designation"
            type="text"
            placeholder="e.g. Assistant Professor"
            style={inputStyle}
          />
        </div>
      </div>

      {state.error && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(192, 57, 43, 0.08)',
            border: '1px solid rgba(192, 57, 43, 0.25)',
            borderRadius: 8,
            fontSize: 12.5,
            color: '#C0392B',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{state.error}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 4 }}>
        <SubmitButton
          label="Create User Account"
          pendingLabel="Creating Account…"
          style={{
            backgroundColor: '#173B67',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
          }}
        />
      </div>
    </form>
  )
}
