import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLiveLeaderboard } from "@/services/recognition";
import { Star, Award, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cluster Head // Merit Leaderboard" };

export default async function ClusterLeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, clusterId } = session.user;
  if (!["CLUSTER_HEAD", "HOD", "ADMIN"].includes(role)) {
    redirect("/faculty");
  }

  if (!clusterId) {
    return (
      <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
        <PageHeader
          breadcrumbs={[
            { label: "CLUSTER_CONSOLE", href: "/cluster" },
            { label: "LEADERBOARD" },
          ]}
          title="Cluster Performance Ledger"
          subtitle="Internal cluster rankings based on verified task delivery, timeliness, and evaluations."
          dotMatrixText="LEADERBOARD"
        />
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: "rgba(183, 121, 31, 0.1)",
              border: "1px solid rgba(183, 121, 31, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "#B7791F",
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#17202A", margin: "0 0 8px 0" }}>
            No Cluster Assigned
          </h2>
          <p style={{ fontSize: 14, color: "#667085", maxWidth: 460, margin: "0 auto" }}>
            You must be linked to an academic cluster to review member performance standings.
          </p>
        </div>
      </div>
    );
  }

  const leaderboard = await getLiveLeaderboard({ clusterId });

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "CLUSTER_CONSOLE", href: "/cluster" },
          { label: "LEADERBOARD" },
        ]}
        dotMatrixText="LEADERBOARD"
        eyebrow="// MERIT APPRAISAL · CLUSTER PERFORMANCE"
        title="Cluster Faculty Performance Ledger"
        subtitle="Transparent departmental rankings based on verified task delivery, timeliness, scholarly output, and appraisals."
        actions={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 6,
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              color: "#17202A",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#198754",
              }}
            />
            {leaderboard.length} FACULTY EVALUATED
          </div>
        }
      />

      {/* 2. Top 3 Institutional Performance Summary Cards */}
      {leaderboard.length >= 3 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {leaderboard.slice(0, 3).map((entry, idx) => {
            const isFirst = idx === 0;

            return (
              <div
                key={entry.userId}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: isFirst ? "1.5px solid #173B67" : "1px solid #E4E7EC",
                  borderRadius: 8,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      color: isFirst ? "#173B67" : "#2F6FED",
                      backgroundColor: isFirst ? "rgba(23, 59, 103, 0.08)" : "rgba(47, 111, 237, 0.08)",
                      border: `1px solid ${isFirst ? "rgba(23, 59, 103, 0.2)" : "rgba(47, 111, 237, 0.2)"}`,
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    RANK #{idx + 1}
                  </span>
                  <span style={{ fontSize: 11.5, color: "#667085", fontFamily: "var(--font-mono)" }}>
                    {Math.round(entry.onTimeRate * 100)}% ON-TIME
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      backgroundColor: isFirst ? "#173B67" : "#F2F4F7",
                      color: isFirst ? "#FFFFFF" : "#17202A",
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(entry.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: "#17202A" }}>
                      {entry.name}
                    </div>
                    <div style={{ fontSize: 12, color: "#667085" }}>
                      {entry.designation ?? entry.email}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    borderTop: "1px solid #F2F4F7",
                    paddingTop: 10,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 24, fontWeight: 700, color: "#17202A", fontFamily: "var(--font-mono)" }}>
                      {entry.totalPoints.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: "#667085", marginLeft: 4, fontFamily: "var(--font-mono)" }}>
                      PTS
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, fontSize: 11.5, color: "#667085" }}>
                    <span>{entry.completedTasks} Tasks</span>
                    <span>·</span>
                    <span>★ {entry.avgEvaluation.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Full Leaderboard Ledger Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E4E7EC",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#FAFAFA",
          }}
        >
          <div>
            <span
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                letterSpacing: "0.1em",
                color: "#667085",
                textTransform: "uppercase",
              }}
            >
              // CLUSTER RANKINGS LEDGER
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: "2px 0 0", color: "#17202A" }}>
              Faculty Standing & Recognition Registry
            </h2>
          </div>
          <span style={{ fontSize: 11.5, color: "#667085", fontWeight: 500 }}>
            {leaderboard.length} FACULTY RANKED
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No Ranking Data Available"
            description="Merit points will appear here once tasks are completed and research is approved."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F7F8FA" }}>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em", width: 60 }}>
                    Rank
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Faculty Member
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Total Points
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Tasks Completed
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    On-Time Rate
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Avg Rating
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Badges Held
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr
                    key={entry.userId}
                    style={{
                      borderBottom: "1px solid #F2F4F7",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 11.5,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 26,
                          height: 26,
                          borderRadius: 4,
                          backgroundColor: idx < 3 ? "#173B67" : "#F2F4F7",
                          color: idx < 3 ? "#FFFFFF" : "#17202A",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            backgroundColor: "#173B67",
                            color: "#FFFFFF",
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            fontWeight: 700,
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
                          <div style={{ fontSize: 11.5, color: "#667085" }}>
                            {entry.designation ?? entry.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontWeight: 700, fontSize: 13.5, fontFamily: "var(--font-mono)", color: "#17202A" }}>
                        {entry.totalPoints.toLocaleString()} <span style={{ fontSize: 11, color: "#667085" }}>PTS</span>
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#17202A" }}>
                      {entry.completedTasks}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: entry.onTimeRate >= 0.8 ? "#198754" : "#B7791F",
                          backgroundColor: entry.onTimeRate >= 0.8 ? "rgba(25, 135, 84, 0.08)" : "rgba(183, 121, 31, 0.08)",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {Math.round(entry.onTimeRate * 100)}%
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#B7791F",
                        }}
                      >
                        <Star size={11} fill="#B7791F" color="#B7791F" />
                        {entry.avgEvaluation.toFixed(1)} / 5.0
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#17202A" }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "#17202A",
                          backgroundColor: "#F2F4F7",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {entry.badgesCount} {entry.badgesCount === 1 ? "badge" : "badges"}
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