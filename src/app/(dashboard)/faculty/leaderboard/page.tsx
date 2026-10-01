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
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "FACULTY_CONSOLE", href: "/faculty" },
          { label: "LEADERBOARD" },
        ]}
        title="Department Performance & Merit Standing"
        subtitle="Objective rankings computed from on-time task delivery, cluster peer evaluations, and verified scholarly output."
      />

      {/* 2. Logged-in Faculty Personal Standing Callout */}
      {currentUserRank && (
        <div
          className="tech-card"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            backgroundColor: "#0E121B",
            border: "1px solid rgba(255, 215, 0, 0.35)",
            borderRadius: 12,
            marginBottom: 24,
            gap: 16,
            flexWrap: "wrap",
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                backgroundColor: "#07090E",
                border: "1.5px solid #FFD700",
                color: "#FFD700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                boxShadow: "0 0 12px rgba(255, 215, 0, 0.25)",
              }}
            >
              #{currentUserRank.rank}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>
                  Your Institutional Standing
                </span>
                <span className="glyph-chip glyph-chip-gold" style={{ fontSize: 10 }}>
                  RANK #{currentUserRank.rank} OF {leaderboard.length}
                </span>
              </div>
              <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "#94A3B8", marginTop: 4 }}>
                NODE: {currentUserRank.clusterName.toUpperCase()} · {currentUserRank.completedTasks} TASKS VERIFIED · {currentUserRank.onTimeRate}% ON-TIME DELIVERY
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                color: "#FFD700",
                letterSpacing: "-0.02em",
              }}
            >
              {currentUserRank.totalPoints.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 600 }}>PTS</span>
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#64748B" }}>
              CUMULATIVE STAR BALANCE
            </div>
          </div>
        </div>
      )}

      {/* 3. Top 3 Cyber Podium */}
      {topThree.length >= 3 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 28,
            alignItems: "end",
          }}
        >
          {/* Rank 2 */}
          <div
            className="tech-card"
            style={{
              padding: "20px 16px",
              textAlign: "center",
              border: "1px solid rgba(226, 232, 240, 0.3)",
              background: "linear-gradient(180deg, rgba(226, 232, 240, 0.05) 0%, #0E121B 100%)",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>🥈</div>
            <span className="glyph-chip" style={{ fontSize: 10, marginBottom: 8 }}>
              RANK #2
            </span>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", marginTop: 6 }}>
              {topThree[1].name}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", fontFamily: "var(--font-mono)" }}>
              {topThree[1].clusterName}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#E2E8F0", fontFamily: "var(--font-mono)", marginTop: 10 }}>
              {topThree[1].totalPoints.toLocaleString()} PTS
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div
            className="tech-card"
            style={{
              padding: "26px 18px",
              textAlign: "center",
              border: "1.5px solid #FFD700",
              background: "linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, #0E121B 100%)",
              boxShadow: "0 0 24px rgba(255, 215, 0, 0.15)",
              transform: "translateY(-8px)",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 6 }}>👑</div>
            <span className="glyph-chip glyph-chip-gold" style={{ fontSize: 11, marginBottom: 8 }}>
              ★ TOP SCHOLAR #1
            </span>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#F8FAFC", marginTop: 6 }}>
              {topThree[0].name}
            </div>
            <div style={{ fontSize: 11.5, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>
              {topThree[0].clusterName}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#FFD700", fontFamily: "var(--font-mono)", marginTop: 12 }}>
              {topThree[0].totalPoints.toLocaleString()} PTS
            </div>
          </div>

          {/* Rank 3 */}
          <div
            className="tech-card"
            style={{
              padding: "20px 16px",
              textAlign: "center",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              background: "linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, #0E121B 100%)",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6 }}>🥉</div>
            <span className="glyph-chip" style={{ fontSize: 10, marginBottom: 8, color: "#F59E0B" }}>
              RANK #3
            </span>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", marginTop: 6 }}>
              {topThree[2].name}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", fontFamily: "var(--font-mono)" }}>
              {topThree[2].clusterName}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#F59E0B", fontFamily: "var(--font-mono)", marginTop: 10 }}>
              {topThree[2].totalPoints.toLocaleString()} PTS
            </div>
          </div>
        </div>
      )}

      {/* 4. Comprehensive Institutional Ranking Table */}
      <div className="tech-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(7, 9, 14, 0.6)",
          }}
        >
          <div>
            <span className="hero-eyebrow" style={{ margin: 0 }}>
              // PERFORMANCE ROSTER
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
              Faculty Merit Standings
            </h2>
          </div>
          <span className="glyph-chip glyph-chip-cyan" style={{ fontSize: 11 }}>
            {leaderboard.length} ACTIVE NODES
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState
              icon={Trophy}
              title="NO RANKINGS COMPUTED"
              description="Leaderboard rankings will be automatically computed once faculty tasks are evaluated and verified."
            />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: 13.5,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#64748B",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  <th style={{ padding: "14px 20px", width: 80 }}>Rank</th>
                  <th style={{ padding: "14px 20px" }}>Faculty Member</th>
                  <th style={{ padding: "14px 18px" }}>Cluster Node</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>Tasks Verified</th>
                  <th style={{ padding: "14px 18px", textAlign: "right" }}>On-Time Rate</th>
                  <th style={{ padding: "14px 24px", textAlign: "right" }}>Points Total</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => {
                  const isCurrentUser = entry.userId === currentUserId;

                  return (
                    <tr
                      key={entry.userId}
                      style={{
                        borderBottom: idx < leaderboard.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                        backgroundColor: isCurrentUser ? "rgba(255, 215, 0, 0.05)" : "transparent",
                        borderLeft: isCurrentUser ? "3px solid #FFD700" : "3px solid transparent",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {/* Rank */}
                      <td style={{ padding: "14px 20px", fontWeight: 700, fontFamily: "var(--font-mono)", color: isCurrentUser ? "#FFD700" : "#F8FAFC" }}>
                        #{entry.rank}
                      </td>

                      {/* Faculty Name & Initials */}
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              backgroundColor: "#07090E",
                              border: isCurrentUser ? "1.5px solid #FFD700" : "1px solid rgba(255, 255, 255, 0.1)",
                              color: isCurrentUser ? "#FFD700" : "#94A3B8",
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
                            <div style={{ fontWeight: 600, color: "#F8FAFC", display: "flex", alignItems: "center", gap: 6 }}>
                              {entry.name}
                              {isCurrentUser && (
                                <span className="glyph-chip glyph-chip-gold" style={{ fontSize: 9.5, padding: "1px 5px" }}>
                                  YOU
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#64748B" }}>
                              {entry.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cluster */}
                      <td style={{ padding: "14px 18px", color: "#94A3B8", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                        {entry.clusterName}
                      </td>

                      {/* Completed Tasks */}
                      <td style={{ padding: "14px 18px", textAlign: "right", fontFamily: "var(--font-mono)", color: "#F8FAFC" }}>
                        {entry.completedTasks}
                      </td>

                      {/* On-Time Rate */}
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: "var(--font-mono)",
                            color: entry.onTimeRate >= 85 ? "#4ADE80" : entry.onTimeRate >= 70 ? "#FCD34D" : "#FB7185",
                          }}
                        >
                          {entry.onTimeRate}%
                        </span>
                      </td>

                      {/* Total Points */}
                      <td
                        style={{
                          padding: "14px 24px",
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: 14,
                          fontFamily: "var(--font-mono)",
                          color: "#FFD700",
                        }}
                      >
                        {entry.totalPoints.toLocaleString()} PTS
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