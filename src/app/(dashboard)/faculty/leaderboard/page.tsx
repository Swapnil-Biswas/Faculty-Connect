import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLiveLeaderboard } from "@/services/recognition";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Trophy, CheckCircle2, User } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faculty Workspace — Leaderboard" };

export default async function FacultyLeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const currentUserId = session.user.id;
  const leaderboard = await getLiveLeaderboard();

  const currentUserRank = leaderboard.find((e) => e.userId === currentUserId);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Faculty Workspace", href: "/faculty" },
          { label: "Department Leaderboard" },
        ]}
        title="Department Performance Standing"
        subtitle="Objective rankings derived from task on-time delivery rates, evaluations, and accredited academic outputs."
      />

      {/* 2. Logged-in Faculty Personal Standing Callout */}
      {currentUserRank && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            backgroundColor: "#EFF6FF",
            border: "1px solid #BFDBFE",
            borderRadius: 6,
            marginBottom: 20,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 4,
                backgroundColor: "#173B67",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              #{currentUserRank.rank}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#17202A" }}>
                Your Institutional Standing: Rank #{currentUserRank.rank} of {leaderboard.length} Faculty Members
              </div>
              <div style={{ fontSize: 12.5, color: "#667085", marginTop: 2 }}>
                Cluster: {currentUserRank.clusterName} · {currentUserRank.completedTasks} tasks completed · {currentUserRank.onTimeRate}% on-time delivery rate
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#173B67" }}>
              {currentUserRank.totalPoints.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500 }}>pts</span>
            </div>
            <div style={{ fontSize: 11.5, color: "#667085" }}>
              Cumulative star points
            </div>
          </div>
        </div>
      )}

      {/* 3. Comprehensive Institutional Ranking Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E4E7EC",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#17202A", margin: 0 }}>
              Faculty Performance Roster
            </h2>
            <p style={{ fontSize: 12, color: "#667085", margin: "2px 0 0 0" }}>
              Ranked in descending order by cumulative Star points balance
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#667085" }}>
            {leaderboard.length} active faculty
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState
              icon={Trophy}
              title="No rankings available"
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
                    backgroundColor: "#F7F8FA",
                    borderBottom: "1px solid #E4E7EC",
                    color: "#667085",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <th style={{ padding: "12px 18px", width: 70 }}>Rank</th>
                  <th style={{ padding: "12px 18px" }}>Faculty Member</th>
                  <th style={{ padding: "12px 16px" }}>Cluster</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>Completed Tasks</th>
                  <th style={{ padding: "12px 16px", textAlign: "right" }}>On-Time Rate</th>
                  <th style={{ padding: "12px 20px", textAlign: "right" }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => {
                  const isCurrentUser = entry.userId === currentUserId;

                  return (
                    <tr
                      key={entry.userId}
                      style={{
                        borderBottom: idx < leaderboard.length - 1 ? "1px solid #F2F4F7" : "none",
                        backgroundColor: isCurrentUser ? "#EFF6FF" : "#FFFFFF",
                        borderLeft: isCurrentUser ? "3px solid #2F6FED" : "3px solid transparent",
                      }}
                    >
                      {/* Rank */}
                      <td style={{ padding: "14px 18px", fontWeight: 700, color: isCurrentUser ? "#173B67" : "#17202A" }}>
                        #{entry.rank}
                      </td>

                      {/* Faculty Name & Initials */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              backgroundColor: isCurrentUser ? "#173B67" : "#F2F4F7",
                              color: isCurrentUser ? "#FFFFFF" : "#17202A",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(entry.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#17202A" }}>
                              {entry.name}
                              {isCurrentUser && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    padding: "1px 6px",
                                    borderRadius: 4,
                                    backgroundColor: "#BFDBFE",
                                    color: "#173B67",
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: "#667085" }}>
                              {entry.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cluster */}
                      <td style={{ padding: "14px 16px", color: "#667085" }}>
                        {entry.clusterName}
                      </td>

                      {/* Completed Tasks */}
                      <td style={{ padding: "14px 16px", textAlign: "right", color: "#17202A" }}>
                        {entry.completedTasks}
                      </td>

                      {/* On-Time Rate */}
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: entry.onTimeRate >= 85 ? "#198754" : entry.onTimeRate >= 70 ? "#B7791F" : "#C0392B",
                          }}
                        >
                          {entry.onTimeRate}%
                        </span>
                      </td>

                      {/* Total Points */}
                      <td
                        style={{
                          padding: "14px 20px",
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#173B67",
                        }}
                      >
                        {entry.totalPoints.toLocaleString()} pts
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