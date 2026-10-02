"use client";

import { useActionState } from "react";
import { runFacultyOfMonth, LeaderboardActionState } from "@/actions/leaderboard";
import { Award, CheckCircle, AlertCircle } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";

const initial: LeaderboardActionState = { success: false };

export function RunFacultyOfMonthButton({
  month,
  year,
  label,
}: {
  month: number;
  year: number;
  label: string;
}) {
  const [state, formAction] = useActionState(
    (_prev: LeaderboardActionState, _fd: FormData) => runFacultyOfMonth(month, year),
    initial
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <form action={formAction}>
        <SubmitButton
          label={label}
          pendingLabel="Computing Honoree…"
          icon={<Award size={15} color="#FFFFFF" />}
          style={{
            backgroundColor: "#173B67",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
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
      </form>
      {state.message && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#198754" }}>
          <CheckCircle size={13} />
          <span>{state.message}</span>
        </div>
      )}
      {state.error && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#C0392B" }}>
          <AlertCircle size={13} />
          <span>{state.error}</span>
        </div>
      )}
    </div>
  );
}