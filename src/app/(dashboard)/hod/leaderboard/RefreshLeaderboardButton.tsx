"use client";

import { useActionState } from "react";
import { refreshLeaderboard, LeaderboardActionState } from "@/actions/leaderboard";
import { RefreshCw } from "lucide-react";

const initial: LeaderboardActionState = { success: false };

export function RefreshLeaderboardButton() {
  const [state, formAction] = useActionState(
    refreshLeaderboard.bind(null, "current_month"),
    initial
  );

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          className="btn-outline"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
        >
          <RefreshCw size={16} />
          Snapshot Leaderboard
        </button>
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