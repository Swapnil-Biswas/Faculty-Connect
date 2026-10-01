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
        className="btn-gradient"
        style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
      >
        <PlusCircle size={17} />
        Evaluate Faculty
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1rem",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.75rem",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.25rem",
              }}
            >
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Star size={20} fill="#eab308" color="#eab308" />
                Submit Faculty Evaluation
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-ghost"
                style={{ padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {state.error && (
                <div
                  className="form-error"
                  style={{
                    padding: "0.75rem",
                    background: "hsl(0 84% 60% / 0.1)",
                    borderRadius: "var(--radius-md)",
                    color: "hsl(0 84% 60%)",
                    fontSize: "0.875rem",
                  }}
                >
                  {state.error}
                </div>
              )}

              {/* Faculty Selector */}
              <div>
                <label className="form-label" htmlFor="facultyId">
                  Select Faculty Member
                </label>
                <select id="facultyId" name="facultyId" required className="form-input">
                  <option value="">-- Choose faculty member --</option>
                  {facultyMembers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.designation ? `(${f.designation})` : ""}
                    </option>
                  ))}
                </select>
                {state.fieldErrors?.facultyId && (
                  <p className="form-error">{state.fieldErrors.facultyId[0]}</p>
                )}
              </div>

              {/* Evaluation Period */}
              <div>
                <label className="form-label" htmlFor="period">
                  Evaluation Period
                </label>
                <input
                  id="period"
                  name="period"
                  type="text"
                  required
                  placeholder="e.g. 2026-Q3, Semester 1 2026"
                  defaultValue="2026 - Current Term"
                  className="form-input"
                />
                {state.fieldErrors?.period && (
                  <p className="form-error">{state.fieldErrors.period[0]}</p>
                )}
              </div>

              {/* Ratings Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  background: "hsl(var(--bg-muted))",
                  padding: "1rem",
                  borderRadius: "var(--radius-lg)",
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
              <div>
                <label className="form-label" htmlFor="remarks">
                  Feedback & Remarks (Optional)
                </label>
                <textarea
                  id="remarks"
                  name="remarks"
                  rows={3}
                  placeholder="Specific praise, qualitative comments, or areas for development..."
                  className="form-input"
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <SubmitButton label="Submit Evaluation & Award Points" pendingLabel="Submitting..." />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}