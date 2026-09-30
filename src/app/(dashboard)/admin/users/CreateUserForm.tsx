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
          padding: '20px',
          background: 'hsl(142 71% 45% / 0.08)',
          border: '1px solid hsl(142 71% 45% / 0.2)',
          borderRadius: 12,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'hsl(142 60% 35%)' }}>
          User created successfully!
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-outline"
          style={{ marginTop: 14, fontSize: 13 }}
        >
          Create another
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="grid-2" style={{ gap: 12 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="cu-name">Full Name</label>
          <input
            id="cu-name"
            name="name"
            type="text"
            className="form-input"
            placeholder="Dr. Jane Smith"
            required
          />
          {state.fieldErrors?.name && (
            <span className="form-error">{state.fieldErrors.name[0]}</span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cu-email">Email</label>
          <input
            id="cu-email"
            name="email"
            type="email"
            className="form-input"
            placeholder="jane@university.edu"
            required
          />
          {state.fieldErrors?.email && (
            <span className="form-error">{state.fieldErrors.email[0]}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="cu-password">
          Temporary Password
        </label>
        <input
          id="cu-password"
          name="password"
          type="password"
          className="form-input"
          placeholder="Min. 8 characters"
          required
          minLength={8}
        />
        {state.fieldErrors?.password && (
          <span className="form-error">{state.fieldErrors.password[0]}</span>
        )}
      </div>

      <div className="grid-2" style={{ gap: 12 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="cu-role">Role</label>
          <select id="cu-role" name="role" className="form-input" defaultValue="FACULTY">
            <option value="FACULTY">Faculty</option>
            <option value="CLUSTER_HEAD">Cluster Head</option>
            <option value="HOD">HOD</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="cu-designation">Designation</label>
          <input
            id="cu-designation"
            name="designation"
            type="text"
            className="form-input"
            placeholder="e.g. Assistant Professor"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="cu-empId">Employee ID</label>
        <input
          id="cu-empId"
          name="employeeId"
          type="text"
          className="form-input"
          placeholder="e.g. EMP-2024-001 (optional)"
        />
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

      <SubmitButton label="Create User" pendingLabel="Creating…" />
    </form>
  )
}
