import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLiveLeaderboard } from "@/services/recognition";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { Trophy, Star, RefreshCw, Award } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { RefreshLeaderboardButton } from "./RefreshLeaderboardButton";

export default async function HodLeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role } = session.user;
  if (!["HOD", "ADMIN"].includes(role)) redirect("/faculty");

  const leaderboard = await getLiveLeaderboard();

  // Cluster filter options
  const clusters = await db.cluster.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  const top3 = leaderboard.slice(0, 3);
  const rank1 = top3[0];
  const rank2 = top3[1];
  const rank3 = top3[2];

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header with BMSIT Dot Matrix */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Leaderboard" },
        ]}
        eyebrow="HOD // MERIT MATRIX & RANKINGS"
        dotMatrixText="LEADERBOARD"
        dotMatrixFontSize={34}
        title="Department Performance Standings"
        ghost="standings."
        subtitle="Live rankings across all clusters — computed from PointsLedger aggregates. Snapshot to persist a period's ranking."
        actions={<RefreshLeaderboardButton />}
      />

      {/* 2. Summary Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-num">
            {leaderboard.length > 0
              ? Math.round(leaderboard.reduce((s, e) => s + e.totalPoints, 0) / leaderboard.length)
              : 0}
          </div>
          <div className="stat-card-label">AVG POINTS PER FACULTY</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-num">{leaderboard.length}</div>
          <div className="stat-card-label">FACULTY RANKED</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-num" style={{ color: "#16A34A" }}>
            {leaderboard.length > 0
              ? Math.round(leaderboard.reduce((s, e) => s + e.onTimeRate, 0) / leaderboard.length)
              : 0}%
          </div>
          <div className="stat-card-label">AVG ON-TIME RATE</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-num">{clusters.length}</div>
          <div className="stat-card-label">ACTIVE CLUSTERS</div>
        </div>
      </div>

      {/* 3. Top 3 Podium Cards */}
      {leaderboard.length >= 3 && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <span className="section-eyebrow">// PODIUM STANDINGS</span>
            <h2 className="card-title" style={{ marginTop: 2 }}>🏆 Department Top Scholars</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              alignItems: "end",
            }}
          >
            {/* Rank 2 (Silver) */}
            <div
              className="card card-hover"
              style={{
                padding: "24px 18px",
                textAlign: "center",
                background: "#FFFFFF",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>🥈</div>
              <span className="badge" style={{ marginBottom: 10 }}>
                RANK #2 · SILVER
              </span>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F", marginTop: 4 }}>
                {rank2.name}
              </div>
              <div style={{ fontSize: 11.5, color: "#6E6E73", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                {rank2.clusterName}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)", marginTop: 12 }}>
                {rank2.totalPoints.toLocaleString()} <span style={{ fontSize: 12, color: "#6E6E73" }}>pts</span>
              </div>
              <div style={{ fontSize: 11, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                {rank2.onTimeRate}% on-time · {rank2.completedTasks} tasks
              </div>
            </div>

            {/* Rank 1 (Gold) */}
            <div
              className="card card-hover"
              style={{
                padding: "28px 20px",
                textAlign: "center",
                border: "2px solid #1D1D1F",
                background: "#FFFFFF",
                boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
                transform: "translateY(-6px)",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>👑</div>
              <span className="badge badge-dark" style={{ marginBottom: 10 }}>
                ★ TOP SCHOLAR #1
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1D1D1F", marginTop: 4 }}>
                {rank1.name}
              </div>
              <div style={{ fontSize: 12, color: "#6E6E73", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                {rank1.clusterName}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)", marginTop: 14 }}>
                {rank1.totalPoints.toLocaleString()} <span style={{ fontSize: 13, color: "#6E6E73" }}>pts</span>
              </div>
              <div style={{ fontSize: 11.5, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                {rank1.onTimeRate}% on-time · {rank1.completedTasks} tasks
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div
              className="card card-hover"
              style={{
                padding: "24px 18px",
                textAlign: "center",
                background: "#FFFFFF",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>🥉</div>
              <span className="badge" style={{ marginBottom: 10 }}>
                RANK #3 · BRONZE
              </span>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F", marginTop: 4 }}>
                {rank3.name}
              </div>
              <div style={{ fontSize: 11.5, color: "#6E6E73", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                {rank3.clusterName}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)", marginTop: 12 }}>
                {rank3.totalPoints.toLocaleString()} <span style={{ fontSize: 12, color: "#6E6E73" }}>pts</span>
              </div>
              <div style={{ fontSize: 11, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                {rank3.onTimeRate}% on-time · {rank3.completedTasks} tasks
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Full Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #E8E8ED",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#FAFAFA",
          }}
        >
          <div>
            <span className="section-eyebrow">// INSTITUTIONAL ROSTER</span>
            <h2 className="card-title" style={{ marginTop: 2 }}>
              All Faculty Merit Standings
            </h2>
          </div>
          <span className="badge badge-dark">
            {leaderboard.length} Faculty Members
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#86868B" }}>
            No ranking data available yet. Faculty earn points by completing tasks and receiving evaluations.
          </div>
        ) : (
          <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Rank</th>
                  <th>Faculty</th>
                  <th>Cluster</th>
                  <th>Total Points</th>
                  <th>Tasks Done</th>
                  <th>On-Time %</th>
                  <th>Avg Rating</th>
                  <th>Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.userId}>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background:
                            entry.rank === 1 ? "#1D1D1F" :
                            entry.rank === 2 ? "#E8E8ED" :
                            entry.rank === 3 ? "#F5F5F7" :
                            "transparent",
                          color:
                            entry.rank === 1 ? "#FFFFFF" :
                            entry.rank === 2 ? "#1D1D1F" :
                            entry.rank === 3 ? "#1D1D1F" : "#6E6E73",
                          border: entry.rank > 3 ? "1px solid #E8E8ED" : "none",
                        }}
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "#F5F5F7",
                            border: "1px solid #E8E8ED",
                            color: "#1D1D1F",
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "var(--font-mono)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getInitials(entry.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "#1D1D1F" }}>{entry.name}</div>
                          <div style={{ fontSize: 11.5, color: "#86868B", fontFamily: "var(--font-mono)" }}>
                            {entry.designation ?? entry.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge">
                        {entry.clusterName}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                        {entry.totalPoints.toLocaleString()} pts
                      </span>
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{entry.completedTasks}</td>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: entry.onTimeRate >= 80 ? "#16A34A" : "#D97706" }}>
                        {entry.onTimeRate}%
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
                        <Star size={13} fill="#1D1D1F" color="#1D1D1F" />
                        {entry.avgEvaluation > 0 ? entry.avgEvaluation : "—"}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ fontSize: 10, padding: "2px 7px" }}>
                        {entry.badgesCount} 🏅
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}