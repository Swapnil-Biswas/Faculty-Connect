"use client";

import { useActionState } from "react";
import { refreshLeaderboard, LeaderboardActionState } from "@/actions/leaderboard";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const initial: LeaderboardActionState = { success: false };

export function RefreshLeaderboardButton() {
  const [state, formAction] = useActionState(
    refreshLeaderboard.bind(null, "current_month"),
    initial
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <form action={formAction}>
        <button
          type="submit"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: "#17202A",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 6,
            cursor: "pointer",
            transition: "all 0.15s ease",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F7F8FA";
            e.currentTarget.style.borderColor = "#D0D5DD";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
            e.currentTarget.style.borderColor = "#E4E7EC";
          }}
        >
          <RefreshCw size={14} color="#667085" />
          <span>Snapshot Standings</span>
        </button>
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