'use client'

import { useActionState } from 'react'
import { createUser } from '@/actions/admin'
import { SubmitButton } from '@/components/ui/SubmitButton'

interface ClusterOption {
  id: string
  name: string
}

export function CreateUserForm({ clusters }: { clusters: ClusterOption[] }) {
  const [state, formAction] = useActionState(createUser, { success: false })

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
          USER PROVISIONED SUCCESSFULLY
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
          CREATE ANOTHER USER
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="cu-name">
            FULL NAME
          </label>
          <input
            id="cu-name"
            name="name"
            type="text"
            placeholder="Dr. Jane Smith"
            required
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
          {state.fieldErrors?.name && (
            <span style={{ color: '#F43F5E', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{state.fieldErrors.name[0]}</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="cu-email">
            EMAIL ADDRESS
          </label>
          <input
            id="cu-email"
            name="email"
            type="email"
            placeholder="jane@bmsit.in"
            required
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
          {state.fieldErrors?.email && (
            <span style={{ color: '#F43F5E', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{state.fieldErrors.email[0]}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="cu-password">
          TEMPORARY PASSWORD
        </label>
        <input
          id="cu-password"
          name="password"
          type="password"
          placeholder="Min. 8 characters"
          required
          minLength={8}
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
        {state.fieldErrors?.password && (
          <span style={{ color: '#F43F5E', fontSize: 11, fontFamily: 'var(--font-mono)' }}>{state.fieldErrors.password[0]}</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="cu-role">
            ROLE
          </label>
          <select
            id="cu-role"
            name="role"
            defaultValue="FACULTY"
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
            <option value="FACULTY">Faculty</option>
            <option value="CLUSTER_HEAD">Cluster Head</option>
            <option value="HOD">HOD</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="cu-designation">
            OFFICIAL DESIGNATION
          </label>
          <input
            id="cu-designation"
            name="designation"
            type="text"
            placeholder="e.g. Assistant Professor"
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
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#CBD5E1' }} htmlFor="cu-empId">
          EMPLOYEE ID (OPTIONAL)
        </label>
        <input
          id="cu-empId"
          name="employeeId"
          type="text"
          placeholder="e.g. BMSIT-CSE-2026-042"
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
        label="CREATE USER"
        pendingLabel="CREATING…"
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
