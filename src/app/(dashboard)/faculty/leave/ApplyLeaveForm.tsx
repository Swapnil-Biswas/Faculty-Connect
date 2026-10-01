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
          padding: "20px 24px",
          backgroundColor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: 6,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, color: "#198754" }}>
          <CheckCircle2 size={32} />
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#198754",
            marginBottom: 4,
          }}
        >
          Leave Application Submitted
        </div>
        <div style={{ fontSize: 13, color: "#667085", lineHeight: 1.4 }}>
          Your leave request has been submitted and is currently pending review by your Cluster Head.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-outline"
          style={{ marginTop: 16, fontSize: 12, padding: "6px 14px" }}
        >
          Apply for Another Date
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
            style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#17202A", marginBottom: 6 }}
          >
            Start Date *
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            style={{
              width: "100%",
              height: 36,
              padding: "6px 10px",
              fontSize: 13,
              border: "1px solid #E4E7EC",
              borderRadius: 4,
              backgroundColor: "#FFFFFF",
              color: "#17202A",
            }}
          />
          {state.fieldErrors?.startDate && (
            <span style={{ fontSize: 11.5, color: "#C0392B", marginTop: 4, display: "block" }}>
              {state.fieldErrors.startDate[0]}
            </span>
          )}
        </div>

        <div>
          <label
            htmlFor="endDate"
            style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#17202A", marginBottom: 6 }}
          >
            End Date *
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            style={{
              width: "100%",
              height: 36,
              padding: "6px 10px",
              fontSize: 13,
              border: "1px solid #E4E7EC",
              borderRadius: 4,
              backgroundColor: "#FFFFFF",
              color: "#17202A",
            }}
          />
          {state.fieldErrors?.endDate && (
            <span style={{ fontSize: 11.5, color: "#C0392B", marginTop: 4, display: "block" }}>
              {state.fieldErrors.endDate[0]}
            </span>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="reason"
          style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#17202A", marginBottom: 6 }}
        >
          Justification / Reason *{" "}
          <span style={{ color: "#667085", fontWeight: 400 }}>(minimum 10 characters)</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          placeholder="State the academic, medical, or personal reason for absence..."
          required
          minLength={10}
          maxLength={1000}
          style={{
            width: "100%",
            padding: "8px 10px",
            fontSize: 13,
            border: "1px solid #E4E7EC",
            borderRadius: 4,
            backgroundColor: "#FFFFFF",
            color: "#17202A",
            resize: "vertical",
            minHeight: 76,
          }}
        />
        {state.fieldErrors?.reason && (
          <span style={{ fontSize: 11.5, color: "#C0392B", marginTop: 4, display: "block" }}>
            {state.fieldErrors.reason[0]}
          </span>
        )}
      </div>

      {state.error && (
        <div
          style={{
            padding: "10px 12px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECDCA",
            borderRadius: 4,
            fontSize: 12,
            color: "#C0392B",
          }}
        >
          {state.error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <SubmitButton label="Submit Application" pendingLabel="Submitting..." />
      </div>
    </form>
  );
}
