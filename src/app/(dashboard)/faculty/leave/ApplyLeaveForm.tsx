"use client";

import { useActionState } from "react";
import { applyLeave, type ActionState } from "@/actions/leave";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { CheckCircle2 } from "lucide-react";

const initialState: ActionState = { success: false };

export function ApplyLeaveForm() {
  const [state, formAction] = useActionState(applyLeave, initialState);

  if (state.success) {
    return (
      <div
        style={{
          padding: "24px",
          backgroundColor: "rgba(34, 197, 94, 0.08)",
          border: "1px solid rgba(34, 197, 94, 0.35)",
          borderRadius: 8,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, color: "#4ADE80" }}>
          <CheckCircle2 size={36} />
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: "#4ADE80",
            marginBottom: 6,
          }}
        >
          APPLICATION REGISTERED
        </div>
        <div style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>
          Your leave request has been submitted and is currently pending evaluation by your Cluster Head.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-outline"
          style={{ marginTop: 18, fontSize: 12, padding: "6px 16px", fontFamily: "var(--font-mono)" }}
        >
          APPLY FOR ANOTHER DATE
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label
            htmlFor="startDate"
            style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "#1D1D1F", marginBottom: 6 }}
          >
            01 // START DATE *
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            className="form-input"
          />
          {state.fieldErrors?.startDate && (
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#E11D48", marginTop: 4, display: "block" }}>
              {state.fieldErrors.startDate[0]}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="endDate"
            style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "#1D1D1F", marginBottom: 6 }}
          >
            02 // END DATE *
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            className="form-input"
          />
          {state.fieldErrors?.endDate && (
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#E11D48", marginTop: 4, display: "block" }}>
              {state.fieldErrors.endDate[0]}
            </span>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="reason"
          style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "#1D1D1F", marginBottom: 6 }}
        >
          03 // FORMAL JUSTIFICATION *
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={4}
          required
          placeholder="State institutional or personal reasons for temporary leave..."
          className="form-input"
          style={{ height: "auto", resize: "vertical" }}
        />
        {state.fieldErrors?.reason && (
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#E11D48", marginTop: 4, display: "block" }}>
            {state.fieldErrors.reason[0]}
          </span>
        )}
      </div>

      {state.error && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.35)",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            color: "#FB7185",
          }}
        >
          {state.error}
        </div>
      )}

      <SubmitButton
        label="SUBMIT APPLICATION"
        pendingLabel="TRANSMITTING..."
        className="btn-primary"
        style={{
          height: 40,
          width: "100%",
          justifyContent: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          letterSpacing: "0.04em",
        }}
      />
    </form>
  );
}
