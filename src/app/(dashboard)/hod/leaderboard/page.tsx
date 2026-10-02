import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLiveLeaderboard } from "@/services/recognition";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { EmptyState } from "@/components/ui/EmptyState";
import { Star, Award, Layers, CheckSquare, Clock } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { RefreshLeaderboardButton } from "./RefreshLeaderboardButton";

export default async function HodLeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role } = session.user;
  if (!["HOD", "ADMIN"].includes(role)) redirect("/faculty");

  const leaderboard = await getLiveLeaderboard();

  // Cluster count and reference list
  const clusters = await db.cluster.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });

  const avgPoints =
    leaderboard.length > 0
      ? Math.round(leaderboard.reduce((s, e) => s + e.totalPoints, 0) / leaderboard.length)
      : 0;

  const avgOnTime =
    leaderboard.length > 0
      ? Math.round(leaderboard.reduce((s, e) => s + e.onTimeRate, 0) / leaderboard.length)
      : 0;

  const totalTasksCompleted = leaderboard.reduce((s, e) => s + e.completedTasks, 0);

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Performance Ledger" },
        ]}
        eyebrow="// INSTITUTIONAL PERFORMANCE · RECOGNITION"
        title="Department Performance"
        subtitle="Comprehensive department-wide performance standings derived from verified PointsLedger aggregates, deliverable velocity, and evaluation ratings."
        showDotMatrix={false}
        actions={<RefreshLeaderboardButton />}
      />

      {/* 2. Department Executive Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <MetricBlock
          label="AVERAGE POINTS PER FACULTY"
          value={avgPoints.toLocaleString()}
          context={`Across ${leaderboard.length} ranked members`}
          icon={<Star size={18} color="#2F6FED" />}
        />

        <MetricBlock
          label="FACULTY RANKED"
          value={leaderboard.length}
          context="Active evaluation pool"
          icon={<Award size={18} color="#173B67" />}
        />

        <MetricBlock
          label="AVERAGE ON-TIME RATE"
          value={`${avgOnTime}%`}
          context={`${totalTasksCompleted} total deliverables completed`}
          trendType={avgOnTime >= 80 ? "positive" : "warning"}
          icon={<Clock size={18} color={avgOnTime >= 80 ? "#198754" : "#B7791F"} />}
        />

        <MetricBlock
          label="ACTIVE CLUSTERS"
          value={clusters.length}
          context="Departmental academic units"
          icon={<Layers size={18} color="#667085" />}
        />
      </div>

      {/* 3. Performance Standings Ledger */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #E4E7EC",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#17202A",
                margin: 0,
              }}
            >
              Faculty Performance Ledger
            </h2>
            <p
              style={{
                fontSize: 12.5,
                color: "#667085",
                margin: "4px 0 0 0",
              }}
            >
              Individual merit aggregates, deliverable execution metrics, and peer evaluation averages
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#173B67",
              backgroundColor: "#F0F4F8",
              border: "1px solid #D0D7DE",
              borderRadius: 4,
              padding: "4px 10px",
            }}
          >
            {leaderboard.length} Faculty Members
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ padding: "32px 16px" }}>
            <EmptyState
              icon={Award}
              title="No Ranking Records Available"
              description="Faculty performance records will populate as deliverables are completed and peer evaluations are submitted."
            />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#F7F8FA", borderBottom: "1px solid #E4E7EC" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", width: 64, textAlign: "center" }}>Rank</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085" }}>Faculty Member</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085" }}>Cluster</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085" }}>Total Points</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Tasks Done</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>On-Time Rate</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Avg Rating</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Merit Badges</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const isTopRank = entry.rank === 1;
                  const isRank2 = entry.rank === 2;
                  const isRank3 = entry.rank === 3;
                  const rowBorder = index !== leaderboard.length - 1 ? "1px solid #F2F4F7" : "none";

                  return (
                    <tr
                      key={entry.userId}
                      style={{
                        borderBottom: rowBorder,
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {/* Rank */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 26,
                            height: 24,
                            padding: "0 6px",
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: isTopRank || isRank2 || isRank3 ? 700 : 500,
                            backgroundColor: isTopRank
                              ? "#173B67"
                              : isRank2
                              ? "#E4E7EC"
                              : isRank3
                              ? "#F2F4F7"
                              : "transparent",
                            color: isTopRank ? "#FFFFFF" : isRank2 || isRank3 ? "#17202A" : "#667085",
                          }}
                        >
                          {entry.rank}
                        </span>
                      </td>

                      {/* Faculty Member */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 6,
                              backgroundColor: "#F2F4F7",
                              border: "1px solid #E4E7EC",
                              color: "#17202A",
                              fontSize: 12,
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(entry.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13.5, color: "#17202A" }}>
                              {entry.name}
                            </div>
                            <div style={{ fontSize: 12, color: "#667085", marginTop: 2 }}>
                              {entry.designation ?? entry.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cluster */}
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#173B67",
                            backgroundColor: "#F0F4F8",
                            border: "1px solid #D0D7DE",
                            borderRadius: 4,
                            padding: "3px 8px",
                            display: "inline-block",
                          }}
                        >
                          {entry.clusterName}
                        </span>
                      </td>

                      {/* Total Points */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#17202A" }}>
                          {entry.totalPoints.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 12, color: "#667085", marginLeft: 4 }}>pts</span>
                      </td>

                      {/* Tasks Done */}
                      <td style={{ padding: "14px 16px", textAlign: "center", fontWeight: 500, color: "#17202A" }}>
                        {entry.completedTasks}
                      </td>

                      {/* On-Time Rate */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: entry.onTimeRate >= 80 ? "#198754" : entry.onTimeRate >= 60 ? "#B7791F" : "#C0392B",
                          }}
                        >
                          {entry.onTimeRate}%
                        </span>
                      </td>

                      {/* Avg Rating */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        {entry.avgEvaluation > 0 ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontWeight: 600,
                              color: "#17202A",
                            }}
                          >
                            <Star size={13} fill="#B7791F" color="#B7791F" />
                            <span>{entry.avgEvaluation.toFixed(1)}</span>
                          </span>
                        ) : (
                          <span style={{ color: "#98A2B3" }}>—</span>
                        )}
                      </td>

                      {/* Merit Badges */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#173B67",
                            backgroundColor: "#F7F8FA",
                            border: "1px solid #E4E7EC",
                            borderRadius: 4,
                            padding: "2px 8px",
                          }}
                        >
                          <Award size={13} color="#2F6FED" />
                          <span>{entry.badgesCount}</span>
                        </span>
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