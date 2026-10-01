"use client";

import { useActionState } from "react";
import { runFacultyOfMonth, LeaderboardActionState } from "@/actions/leaderboard";
import { Star } from "lucide-react";
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
    <div>
      <form action={formAction}>
        <SubmitButton
          label={label}
          pendingLabel="COMPUTING..."
          icon={<Star size={15} fill="#0A0D14" color="#0A0D14" />}
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
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        />
      </form>
      {state.message && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#22C55E", fontFamily: "var(--font-mono)" }}>
          ● {state.message}
        </p>
      )}
      {state.error && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#F43F5E", fontFamily: "var(--font-mono)" }}>
          ▲ {state.error}
        </p>
      )}
    </div>
  );
}