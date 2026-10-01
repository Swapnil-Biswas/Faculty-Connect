"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createEvaluation, EvaluationActionState } from "@/actions/evaluations";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Star, X, PlusCircle } from "lucide-react";

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
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{label}</label>
          <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "hsl(var(--color-primary))" }}>
            {value} / 5
          </span>
        </div>
        <input type="hidden" name={name} value={value} />
        <div className="star-rating-interactive">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="star-btn"
              onClick={() => onChange(star)}
              title={`${star} Star${star > 1 ? "s" : ""}`}
            >
              <Star
                size={22}
                fill={star <= value ? "#eab308" : "transparent"}
                color={star <= value ? "#eab308" : "hsl(var(--text-muted))"}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 18px",
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          border: "none",
          borderRadius: 8,
          color: "#0A0D14",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: "0 0 16px rgba(245, 158, 11, 0.35)",
        }}
      >
        <PlusCircle size={15} /> EVALUATE FACULTY
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "#0E121B",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              width: "100%",
              maxWidth: "540px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px 28px",
              borderRadius: 12,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: 14,
              }}
            >
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
                  // FACULTY APPRAISAL FORM
                </span>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: "2px 0 0", color: "#F8FAFC" }}>
                  Submit Faculty Evaluation
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {state.error && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(244, 63, 94, 0.1)",
                    border: "1px solid rgba(244, 63, 94, 0.3)",
                    borderRadius: 6,
                    color: "#F43F5E",
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {state.error}
                </div>
              )}

              {/* Faculty Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#CBD5E1" }} htmlFor="facultyId">
                  SELECT FACULTY MEMBER
                </label>
                <select
                  id="facultyId"
                  name="facultyId"
                  required
                  style={{
                    background: "#07090E",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#F8FAFC",
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    outline: "none",
                  }}
                >
                  <option value="">-- Choose faculty member --</option>
                  {facultyMembers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.designation ? `(${f.designation})` : ""}
                    </option>
                  ))}
                </select>
                {state.fieldErrors?.facultyId && (
                  <p style={{ color: "#F43F5E", fontSize: 12, fontFamily: "var(--font-mono)", margin: "2px 0 0" }}>
                    {state.fieldErrors.facultyId[0]}
                  </p>
                )}
              </div>

              {/* Evaluation Period */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#CBD5E1" }} htmlFor="period">
                  EVALUATION PERIOD
                </label>
                <input
                  id="period"
                  name="period"
                  type="text"
                  required
                  placeholder="e.g. 2026-Q3, Semester 1 2026"
                  defaultValue="2026 - Current Term"
                  style={{
                    background: "#07090E",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#F8FAFC",
                    fontSize: 13,
                    fontFamily: "var(--font-mono)",
                    outline: "none",
                  }}
                />
                {state.fieldErrors?.period && (
                  <p style={{ color: "#F43F5E", fontSize: 12, fontFamily: "var(--font-mono)", margin: "2px 0 0" }}>
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
                  background: "#07090E",
                  padding: 16,
                  borderRadius: 8,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
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
                  label="Overall Rating"
                  value={overall}
                  onChange={setOverall}
                />
              </div>

              {/* Remarks */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#CBD5E1" }} htmlFor="remarks">
                  FEEDBACK & REMARKS (OPTIONAL)
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  rows={3}
                  placeholder="Specific praise, qualitative comments, or areas for development..."
                  style={{
                    background: "#07090E",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#F8FAFC",
                    fontSize: 13,
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#E2E8F0",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  CANCEL
                </button>
                <SubmitButton
                  label="SUBMIT EVALUATION"
                  pendingLabel="SUBMITTING..."
                  style={{
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    color: "#0A0D14",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 18px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 0 16px rgba(245, 158, 11, 0.35)",
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