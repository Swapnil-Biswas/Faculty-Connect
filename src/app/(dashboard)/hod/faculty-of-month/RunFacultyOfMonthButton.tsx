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
          pendingLabel="Computing..."
          icon={<Star size={17} fill="currentColor" />}
        />
      </form>
      {state.message && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#16a34a" }}>
          {state.message}
        </p>
      )}
      {state.error && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "hsl(0 84% 60%)" }}>
          {state.error}
        </p>
      )}
    </div>
  );
}