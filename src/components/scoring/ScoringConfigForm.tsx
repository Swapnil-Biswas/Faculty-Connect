"use client";

import { useState, useActionState } from "react";
import { updateScoringConfig, ScoringActionState } from "@/actions/scoring";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";

const initial: ScoringActionState = { success: false };

export interface ConfigData {
  onTimeWeight: number;
  earlyWeight: number;
  completionRateWeight: number;
  streakWeight: number;
  qualityWeight: number;
  contributionWeight: number;
  initiativeWeight: number;
  overallRatingWeight: number;
}

export function ScoringConfigForm({
  activeConfig,
}: {
  activeConfig: ConfigData | null;
}) {
  const defaults: ConfigData = {
    onTimeWeight: activeConfig?.onTimeWeight ?? 0.2,
    earlyWeight: activeConfig?.earlyWeight ?? 0.1,
    completionRateWeight: activeConfig?.completionRateWeight ?? 0.15,
    streakWeight: activeConfig?.streakWeight ?? 0.05,
    qualityWeight: activeConfig?.qualityWeight ?? 0.2,
    contributionWeight: activeConfig?.contributionWeight ?? 0.1,
    initiativeWeight: activeConfig?.initiativeWeight ?? 0.1,
    overallRatingWeight: activeConfig?.overallRatingWeight ?? 0.1,
  };

  const [weights, setWeights] = useState<ConfigData>(defaults);
  const [state, formAction] = useActionState(updateScoringConfig, initial);

  const totalPct = Math.round(
    (weights.onTimeWeight +
      weights.earlyWeight +
      weights.completionRateWeight +
      weights.streakWeight +
      weights.qualityWeight +
      weights.contributionWeight +
      weights.initiativeWeight +
      weights.overallRatingWeight) *
      100
  );

  const isBalanced = totalPct === 100;

  function handleSliderChange(key: keyof ConfigData, value: number) {
    setWeights((prev) => ({ ...prev, [key]: value }));
  }

  function renderSlider(
    name: keyof ConfigData,
    label: string,
    description: string
  ) {
    const val = weights[name];
    const pct = Math.round(val * 100);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "12px 14px",
          backgroundColor: "#F7F8FA",
          border: "1px solid #E4E7EC",
          borderRadius: 6,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label htmlFor={name} style={{ fontWeight: 600, fontSize: 13, color: "#17202A" }}>
            {label}
          </label>
          <span
            style={{
              fontWeight: 700,
              color: "#173B67",
              fontSize: 13.5,
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: 4,
              padding: "2px 8px",
            }}
          >
            {pct}%
          </span>
        </div>
        <p style={{ fontSize: 12, color: "#667085", margin: 0, lineHeight: 1.4 }}>
          {description}
        </p>
        <input
          id={name}
          name={name}
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={val}
          onChange={(e) => handleSliderChange(name, parseFloat(e.target.value))}
          style={{
            width: "100%",
            accentColor: "#2F6FED",
            marginTop: 4,
            cursor: "pointer",
          }}
        />
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {state.success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 6,
            fontSize: 13,
            color: "#166534",
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} color="#166534" style={{ flexShrink: 0 }} />
          <span>Scoring configuration saved successfully. Future deliverables and evaluations will use these weights.</span>
        </div>
      )}

      {state.error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            backgroundColor: "#FDECEA",
            border: "1px solid #F5C6CB",
            borderRadius: 6,
            fontSize: 13,
            color: "#C0392B",
            fontWeight: 500,
          }}
        >
          <AlertCircle size={16} color="#C0392B" style={{ flexShrink: 0 }} />
          <span>{state.error}</span>
        </div>
      )}

      {/* Two Factor Sections */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: 20,
        }}
      >
        {/* Automatic Performance Factors */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#173B67",
              marginBottom: 12,
              paddingBottom: 6,
              borderBottom: "1px solid #E4E7EC",
            }}
          >
            Automatic Performance Factors
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {renderSlider(
              "onTimeWeight",
              "On-Time Completion",
              "Points multiplier applied when a task deliverable is completed on or prior to deadline."
            )}
            {renderSlider(
              "earlyWeight",
              "Early Completion Bonus",
              "Incremental multiplier for deliverables completed more than 24 hours in advance."
            )}
            {renderSlider(
              "completionRateWeight",
              "Completion Rate",
              "Factor proportional to the total percentage of assigned tasks completed."
            )}
            {renderSlider(
              "streakWeight",
              "Consistency Streak",
              "Bonus factor rewarding consecutive on-time deliverable completions."
            )}
          </div>
        </div>

        {/* Manual Evaluation Factors */}
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#173B67",
              marginBottom: 12,
              paddingBottom: 6,
              borderBottom: "1px solid #E4E7EC",
            }}
          >
            Manual Evaluation Factors
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {renderSlider(
              "qualityWeight",
              "Task Quality",
              "Weight for the Execution Quality dimension (1–5 scale) of peer evaluations."
            )}
            {renderSlider(
              "contributionWeight",
              "Departmental Contribution",
              "Weight for leadership, coordination, and departmental support in evaluations."
            )}
            {renderSlider(
              "initiativeWeight",
              "Initiative & Proactivity",
              "Weight for independent problem-solving and innovation in evaluations."
            )}
            {renderSlider(
              "overallRatingWeight",
              "Overall Rating",
              "Weight for the comprehensive performance evaluation dimension."
            )}
          </div>
        </div>
      </div>

      {/* Balance Indicator & Submit Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 16,
          borderTop: "1px solid #E4E7EC",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#667085", fontWeight: 500 }}>
            Total Weight Balance:
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isBalanced ? "#198754" : "#B7791F",
              backgroundColor: isBalanced ? "#F0FDF4" : "#FEF3C7",
              border: `1px solid ${isBalanced ? "#BBF7D0" : "#FDE68A"}`,
              borderRadius: 4,
              padding: "3px 8px",
            }}
          >
            {totalPct}% {isBalanced ? "· Balanced (100%)" : "· Deviates from 100%"}
          </span>
        </div>

        <SubmitButton
          label="Save Scoring Configuration"
          pendingLabel="Saving Configuration…"
          icon={<Save size={15} color="#FFFFFF" />}
          style={{
            backgroundColor: "#173B67",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 6,
            padding: "9px 20px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "inherit",
            transition: "background-color 0.15s ease",
          }}
        />
      </div>
    </form>
  );
}
