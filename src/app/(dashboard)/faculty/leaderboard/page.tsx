import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLiveLeaderboard } from "@/services/recognition";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Trophy, Award, Star } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faculty Console // Leaderboard" };

export default async function FacultyLeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const currentUserId = session.user.id;
  const leaderboard = await getLiveLeaderboard();

  const currentUserRank = leaderboard.find((e) => e.userId === currentUserId);
  const topThree = leaderboard.slice(0, 3);

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header with BMSIT Dot Matrix */}
      <PageHeader
        breadcrumbs={[
          { label: "FACULTY", href: "/faculty" },
          { label: "LEADERBOARD" },
        ]}
        eyebrow="FACULTY // MERIT & RECOGNITION"
        dotMatrixText="LEADERBOARD"
        dotMatrixFontSize={34}
        title="Department Performance & Merit Standing"
        ghost="rankings."
        subtitle="Objective rankings computed from on-time task delivery, cluster peer evaluations, and verified scholarly output."
      />

      {/* 2. Logged-in Faculty Personal Standing Callout */}
      {currentUserRank && (
        <div
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            background: "#FAFAFA",
            border: "1.5px solid #1D1D1F",
            gap: 16,
            flexWrap: "wrap",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: "#1D1D1F",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              #{currentUserRank.rank}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1D1D1F" }}>
                  Your Institutional Standing
                </span>
                <span className="badge badge-dark">
                  RANK #{currentUserRank.rank} OF {leaderboard.length}
                </span>
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#6E6E73", marginTop: 4 }}>
                NODE: {currentUserRank.clusterName.toUpperCase()} · {currentUserRank.completedTasks} TASKS VERIFIED · {currentUserRank.onTimeRate}% ON-TIME DELIVERY
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                color: "#1D1D1F",
                letterSpacing: "-0.02em",
              }}
            >
              {currentUserRank.totalPoints.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 600, color: "#6E6E73" }}>PTS</span>
            </div>
            <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "#86868B", letterSpacing: "0.08em" }}>
              CUMULATIVE STAR BALANCE
            </div>
          </div>
        </div>
      )}

      {/* 3. Top 3 Podium Cards */}
      {topThree.length >= 3 && (
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
              border: "1px solid #E8E8ED",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>🥈</div>
            <span className="badge" style={{ marginBottom: 10 }}>
              RANK #2 · SILVER
            </span>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F", marginTop: 6 }}>
              {topThree[1].name}
            </div>
            <div style={{ fontSize: 11.5, color: "#6E6E73", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {topThree[1].clusterName}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)", marginTop: 12 }}>
              {topThree[1].totalPoints.toLocaleString()} <span style={{ fontSize: 12, color: "#6E6E73" }}>PTS</span>
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
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1D1D1F", marginTop: 6 }}>
              {topThree[0].name}
            </div>
            <div style={{ fontSize: 12, color: "#6E6E73", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {topThree[0].clusterName}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)", marginTop: 14 }}>
              {topThree[0].totalPoints.toLocaleString()} <span style={{ fontSize: 13, color: "#6E6E73" }}>PTS</span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div
            className="card card-hover"
            style={{
              padding: "24px 18px",
              textAlign: "center",
              background: "#FFFFFF",
              border: "1px solid #E8E8ED",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>🥉</div>
            <span className="badge" style={{ marginBottom: 10 }}>
              RANK #3 · BRONZE
            </span>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F", marginTop: 6 }}>
              {topThree[2].name}
            </div>
            <div style={{ fontSize: 11.5, color: "#6E6E73", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {topThree[2].clusterName}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)", marginTop: 12 }}>
              {topThree[2].totalPoints.toLocaleString()} <span style={{ fontSize: 12, color: "#6E6E73" }}>PTS</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Comprehensive Institutional Ranking Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #E8E8ED",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#FAFAFA",
          }}
        >
          <div>
            <span className="section-eyebrow">// PERFORMANCE ROSTER</span>
            <h2 className="card-title" style={{ marginTop: 2 }}>
              Faculty Merit Standings
            </h2>
          </div>
          <span className="badge badge-dark">
            {leaderboard.length} ACTIVE SCHOLARS
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ padding: 48 }}>
            <EmptyState
              title="NO RANKINGS COMPUTED"
              description="Leaderboard rankings will be automatically computed once faculty tasks are evaluated and verified."
            />
          </div>
        ) : (
          <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Rank</th>
                  <th>Faculty Member</th>
                  <th>Cluster Node</th>
                  <th style={{ textAlign: "right" }}>Tasks Verified</th>
                  <th style={{ textAlign: "right" }}>On-Time Rate</th>
                  <th style={{ textAlign: "right" }}>Points Total</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.userId === currentUserId;

                  return (
                    <tr
                      key={entry.userId}
                      style={{
                        backgroundColor: isCurrentUser ? "#F5F5F7" : "transparent",
                        borderLeft: isCurrentUser ? "3px solid #1D1D1F" : "3px solid transparent",
                      }}
                    >
                      {/* Rank */}
                      <td>
                        <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: isCurrentUser ? "#1D1D1F" : "#6E6E73" }}>
                          #{entry.rank}
                        </span>
                      </td>

                      {/* Faculty Name & Initials */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              backgroundColor: isCurrentUser ? "#1D1D1F" : "#F5F5F7",
                              border: "1px solid #E8E8ED",
                              color: isCurrentUser ? "#FFFFFF" : "#1D1D1F",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                              fontFamily: "var(--font-mono)",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(entry.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#1D1D1F", display: "flex", alignItems: "center", gap: 6 }}>
                              {entry.name}
                              {isCurrentUser && (
                                <span className="badge badge-dark" style={{ fontSize: 9, padding: "2px 6px" }}>
                                  YOU
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#86868B" }}>
                              {entry.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cluster */}
                      <td style={{ color: "#6E6E73", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        {entry.clusterName}
                      </td>

                      {/* Completed Tasks */}
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: "#1D1D1F" }}>
                        {entry.completedTasks}
                      </td>

                      {/* On-Time Rate */}
                      <td style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: "var(--font-mono)",
                            color: entry.onTimeRate >= 85 ? "#16A34A" : entry.onTimeRate >= 70 ? "#D97706" : "#E11D48",
                          }}
                        >
                          {entry.onTimeRate}%
                        </span>
                      </td>

                      {/* Total Points */}
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: 14,
                          fontFamily: "var(--font-mono)",
                          color: "#1D1D1F",
                        }}
                      >
                        {entry.totalPoints.toLocaleString()} <span style={{ fontSize: 11, color: "#86868B" }}>PTS</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}