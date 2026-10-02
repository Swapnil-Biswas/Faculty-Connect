"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createEvaluation, EvaluationActionState } from "@/actions/evaluations";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Star, X, Plus } from "lucide-react";

interface FacultyMember {
  id: string;
  name: string;
  designation: string | null;
}

const initialState: EvaluationActionState = { success: false };

export function CreateEvaluationModal({
  facultyMembers,
}: {
  facultyMembers: FacultyMember[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [quality, setQuality] = useState(4);
  const [contribution, setContribution] = useState(4);
  const [initiative, setInitiative] = useState(4);
  const [overall, setOverall] = useState(4);

  const [state, formAction] = useActionState(async (prevState: EvaluationActionState, formData: FormData) => {
    const res = await createEvaluation(prevState, formData);
    if (res.success) {
      setIsOpen(false);
    }
    return res;
  }, initialState);

  function StarRatingPicker({
    name,
    value,
    onChange,
    label,
  }: {
    name: string;
    value: number;
    onChange: (v: number) => void;
    label: string;
  }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#17202A" }}>{label}</label>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#173B67" }}>
            {value} / 5
          </span>
        </div>
        <input type="hidden" name={name} value={value} />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              title={`${star} Star${star > 1 ? "s" : ""}`}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 2,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <Star
                size={20}
                fill={star <= value ? "#B7791F" : "transparent"}
                color={star <= value ? "#B7791F" : "#D2D2D7"}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#17202A",
    marginBottom: 6,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    fontSize: 13,
    color: "#17202A",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E7EC",
    borderRadius: 6,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          backgroundColor: "#173B67",
          border: "1px solid #173B67",
          borderRadius: 6,
          color: "#FFFFFF",
          fontSize: 12.5,
          fontWeight: 600,
          cursor: "pointer",
          transition: "opacity 0.15s ease",
        }}
      >
        <Plus size={15} /> EVALUATE FACULTY
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              width: "100%",
              maxWidth: 540,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px 28px",
              borderRadius: 8,
              boxShadow: "0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 8px 10px -6px rgba(16, 24, 40, 0.05)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 20,
                borderBottom: "1px solid #F2F4F7",
                paddingBottom: 14,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    color: "#667085",
                    textTransform: "uppercase",
                  }}
                >
                  // ACADEMIC APPRAISAL FORM
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: "2px 0 0", color: "#17202A" }}>
                  Record Faculty Appraisal
                </h2>
                <p style={{ fontSize: 12.5, color: "#667085", margin: "4px 0 0 0" }}>
                  Appraisals award verified merit points towards departmental recognition.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#667085",
                  cursor: "pointer",
                  padding: 4,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {state.error && (
                <div
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "rgba(192, 57, 43, 0.08)",
                    border: "1px solid rgba(192, 57, 43, 0.25)",
                    borderRadius: 6,
                    color: "#C0392B",
                    fontSize: 12.5,
                  }}
                >
                  {state.error}
                </div>
              )}

              {/* Faculty Selector */}
              <div>
                <label style={labelStyle} htmlFor="facultyId">
                  Select Faculty Member <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <select
                  id="facultyId"
                  name="facultyId"
                  required
                  style={inputStyle}
                  defaultValue=""
                >
                  <option value="" disabled>-- Select faculty candidate --</option>
                  {facultyMembers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.designation ? `(${f.designation})` : ""}
                    </option>
                  ))}
                </select>
                {state.fieldErrors?.facultyId && (
                  <p style={{ color: "#C0392B", fontSize: 11.5, margin: "4px 0 0" }}>
                    {state.fieldErrors.facultyId[0]}
                  </p>
                )}
              </div>

              {/* Evaluation Period */}
              <div>
                <label style={labelStyle} htmlFor="period">
                  Evaluation Period <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  id="period"
                  name="period"
                  type="text"
                  required
                  placeholder="e.g. 2026-Q3, Semester 1 2026"
                  defaultValue="2026 - Current Term"
                  style={inputStyle}
                />
                {state.fieldErrors?.period && (
                  <p style={{ color: "#C0392B", fontSize: 11.5, margin: "4px 0 0" }}>
                    {state.fieldErrors.period[0]}
                  </p>
                )}
              </div>

              {/* Ratings Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  backgroundColor: "#F7F8FA",
                  padding: 16,
                  borderRadius: 6,
                  border: "1px solid #E4E7EC",
                }}
              >
                <StarRatingPicker
                  name="quality"
                  label="Task Quality"
                  value={quality}
                  onChange={setQuality}
                />
                <StarRatingPicker
                  name="contribution"
                  label="Contribution"
                  value={contribution}
                  onChange={setContribution}
                />
                <StarRatingPicker
                  name="initiative"
                  label="Initiative & Proactivity"
                  value={initiative}
                  onChange={setInitiative}
                />
                <StarRatingPicker
                  name="overallRating"
                  label="Overall Appraisal"
                  value={overall}
                  onChange={setOverall}
                />
              </div>

              {/* Remarks */}
              <div>
                <label style={labelStyle} htmlFor="remarks">
                  Feedback & Qualitative Remarks (Optional)
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  rows={3}
                  placeholder="Specific praise, qualitative comments, or areas for development…"
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E4E7EC",
                    color: "#17202A",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  CANCEL
                </button>
                <SubmitButton
                  label="SUBMIT APPRAISAL"
                  pendingLabel="SUBMITTING…"
                  style={{
                    backgroundColor: "#173B67",
                    color: "#FFFFFF",
                    border: "1px solid #173B67",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}