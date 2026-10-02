"use client";

import { useActionState } from "react";
import { updateScoringConfig, ScoringActionState } from "@/actions/scoring";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Save } from "lucide-react";

const initial: ScoringActionState = { success: false };

interface ConfigData {
  onTimeWeight: number;
  earlyWeight: number;
  completionRateWeight: number;
  streakWeight: number;
  qualityWeight: number;
  contributionWeight: number;
  initiativeWeight: number;
  overallRatingWeight: number;
}

function WeightSlider({
  name,
  label,
  description,
  defaultValue,
}: {
  name: string;
  label: string;
  description: string;
  defaultValue: number;
}) {
  const pct = Math.round(defaultValue * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label htmlFor={name} style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--foreground)" }}>
          {label}
        </label>
        <span
          id={`${name}-display`}
          style={{ fontWeight: 700, color: "var(--foreground)", fontFamily: "var(--font-mono)", fontSize: "0.9375rem" }}
        >
          {pct}%
        </span>
      </div>
      <p style={{ fontSize: "0.78125rem", color: "var(--grey-500)", marginTop: "-2px" }}>
        {description}
      </p>
      <input
        id={name}
        name={name}
        type="range"
        min={0}
        max={1}
        step={0.01}
        defaultValue={defaultValue}
        style={{ width: "100%", accentColor: "var(--accent)" }}
        onInput={(e) => {
          const display = document.getElementById(`${name}-display`);
          if (display) {
            display.textContent = `${Math.round(parseFloat((e.target as HTMLInputElement).value) * 100)}%`;
          }
        }}
      />
    </div>
  );
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

  const [state, formAction] = useActionState(updateScoringConfig, initial);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {state.success && (
        <div className="form-success">
          ✓ Scoring configuration saved successfully. Future points will use these weights.
        </div>
      )}
      {state.error && (
        <div className="form-error">
          {state.error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {/* Automatic Factors */}
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--grey-500)", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}>
            Automatic Performance Factors
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <WeightSlider
              name="onTimeWeight"
              label="On-Time Completion"
              description="Points multiplier when a task is completed before or on the deadline."
              defaultValue={defaults.onTimeWeight}
            />
            <WeightSlider
              name="earlyWeight"
              label="Early Completion Bonus"
              description="Additional bonus for tasks completed more than 24 hours early."
              defaultValue={defaults.earlyWeight}
            />
            <WeightSlider
              name="completionRateWeight"
              label="Completion Rate"
              description="Factor based on the percentage of assigned tasks completed."
              defaultValue={defaults.completionRateWeight}
            />
            <WeightSlider
              name="streakWeight"
              label="Consistency Streak"
              description="Reward for consecutive on-time task completions."
              defaultValue={defaults.streakWeight}
            />
          </div>
        </div>

        {/* Manual Evaluation Factors */}
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--grey-500)", marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}>
            Manual Evaluation Factors
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <WeightSlider
              name="qualityWeight"
              label="Task Quality"
              description="Weight for the Quality dimension (1–5) of peer evaluations."
              defaultValue={defaults.qualityWeight}
            />
            <WeightSlider
              name="contributionWeight"
              label="Contribution"
              description="Weight for the Contribution dimension in evaluations."
              defaultValue={defaults.contributionWeight}
            />
            <WeightSlider
              name="initiativeWeight"
              label="Initiative & Proactivity"
              description="Weight for the Initiative dimension in evaluations."
              defaultValue={defaults.initiativeWeight}
            />
            <WeightSlider
              name="overallRatingWeight"
              label="Overall Rating"
              description="Weight for the Overall Rating dimension in evaluations."
              defaultValue={defaults.overallRatingWeight}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem" }}>
        <SubmitButton
          label="Save Changes"
          pendingLabel="Saving..."
          icon={<Save size={16} />}
        />
      </div>
    </form>
  );
}