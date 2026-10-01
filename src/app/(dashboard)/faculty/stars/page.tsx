import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getLiveLeaderboard } from "@/services/recognition";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { EmptyState } from "@/components/ui/EmptyState";
import { Star, Trophy, Award, CheckCircle2, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faculty Workspace — Recognition Ledger" };

export default async function FacultyStarsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  // 1. Fetch points ledger
  const ledger = await db.pointsLedger.findMany({
    where: { facultyId: userId },
    orderBy: { createdAt: "desc" },
  });

  const totalPoints = ledger.reduce((sum, p) => sum + p.amount, 0);

  // 2. Compute live rank
  const leaderboard = await getLiveLeaderboard();
  const rankEntry = leaderboard.find((e) => e.userId === userId);
  const currentRank = rankEntry ? rankEntry.rank : "—";
  const totalFaculty = leaderboard.length;

  // 3. Fetch Badges
  const allBadges = await db.badge.findMany({
    orderBy: { createdAt: "asc" },
  });
  const userBadges = await db.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { awardedAt: "desc" },
  });

  const earnedBadgeMap = new Map(userBadges.map((ub) => [ub.badgeId, ub.awardedAt]));

  // 4. Source breakdown
  const taskPoints = ledger
    .filter((p) => p.source === "TASK_COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);
  const evalPoints = ledger
    .filter((p) => p.source === "EVALUATION")
    .reduce((sum, p) => sum + p.amount, 0);
  const otherPoints = totalPoints - taskPoints - evalPoints;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Faculty Workspace", href: "/faculty" },
          { label: "Recognition & Stars" },
        ]}
        title="Recognition & Performance Ledger"
        subtitle="Transparent, append-only performance ledger and achievements earned across departmental activities."
      />

      {/* 2. Top Summary Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Cumulative Star Points"
          value={totalPoints.toLocaleString()}
          context="Verified append-only balance"
          trendType="positive"
          icon={<Star size={18} />}
        />
        <MetricBlock
          label="Department Standing"
          value={currentRank !== "—" ? `#${currentRank}` : "—"}
          context={`Out of ${totalFaculty} active faculty`}
          trendType="neutral"
          icon={<Trophy size={18} />}
        />
        <MetricBlock
          label="Badges Unlocked"
          value={`${userBadges.length} / ${allBadges.length}`}
          context="Accredited recognitions"
          trendType="neutral"
          icon={<Award size={18} />}
        />
        <MetricBlock
          label="On-Time Delivery Rate"
          value={`${rankEntry?.onTimeRate ?? 0}%`}
          context={`${rankEntry?.completedTasks ?? 0} tasks completed`}
          trendType={
            (rankEntry?.onTimeRate ?? 0) >= 80 ? "positive" : "warning"
          }
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      {/* 3. Source Distribution Bar */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 6,
          padding: "16px 20px",
          marginBottom: 24,
          boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#17202A", marginBottom: 10 }}>
          Points Distribution by Category
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <div style={{ padding: "10px 14px", backgroundColor: "#F7F8FA", borderRadius: 4, border: "1px solid #E4E7EC" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase" }}>
              Task Delivery
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#17202A", marginTop: 2 }}>
              {taskPoints} pts
            </div>
            <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>
              {totalPoints > 0 ? Math.round((taskPoints / totalPoints) * 100) : 0}% of cumulative total
            </div>
          </div>

          <div style={{ padding: "10px 14px", backgroundColor: "#F7F8FA", borderRadius: 4, border: "1px solid #E4E7EC" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase" }}>
              Cluster Head Evaluations
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#17202A", marginTop: 2 }}>
              {evalPoints} pts
            </div>
            <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>
              {totalPoints > 0 ? Math.round((evalPoints / totalPoints) * 100) : 0}% of cumulative total
            </div>
          </div>

          <div style={{ padding: "10px 14px", backgroundColor: "#F7F8FA", borderRadius: 4, border: "1px solid #E4E7EC" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase" }}>
              Research & Institutional Work
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#17202A", marginTop: 2 }}>
              {otherPoints} pts
            </div>
            <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>
              {totalPoints > 0 ? Math.round((otherPoints / totalPoints) * 100) : 0}% of cumulative total
            </div>
          </div>
        </div>
      </div>

      {/* 4. Append-Only Points Ledger Table */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 6,
          overflow: "hidden",
          marginBottom: 32,
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
              Chronological Points Transaction Log
            </h2>
            <p style={{ fontSize: 12, color: "#667085", margin: "2px 0 0 0" }}>
              Append-only audit ledger of points awarded for completed tasks and reviews
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#667085" }}>
            {ledger.length} transactions
          </span>
        </div>

        {ledger.length === 0 ? (
          <div style={{ padding: 32 }}>
            <EmptyState
              icon={Star}
              title="No points transactions"
              description="Your points transaction ledger is empty. Complete assigned tasks and submit deliverable reviews to earn star recognition."
            />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#F7F8FA",
                    borderBottom: "1px solid #E4E7EC",
                    color: "#667085",
                    fontSize: 11.5,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <th style={{ padding: "10px 18px" }}>Date & Timestamp</th>
                  <th style={{ padding: "10px 16px" }}>Event Source</th>
                  <th style={{ padding: "10px 16px" }}>Reason & Details</th>
                  <th style={{ padding: "10px 18px", textAlign: "right" }}>Points Earned</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: idx < ledger.length - 1 ? "1px solid #F2F4F7" : "none",
                    }}
                  >
                    <td style={{ padding: "12px 18px", color: "#667085", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Clock size={12} />
                        <span>{formatDate(entry.createdAt)}</span>
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: "#EFF6FF",
                          color: "#173B67",
                          border: "1px solid #BFDBFE",
                        }}
                      >
                        {entry.source.replace("_", " ")}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", color: "#17202A" }}>
                      <div>{entry.reason || "Performance credit"}</div>
                      <div style={{ fontSize: 11, color: "#667085", fontFamily: "ui-monospace, monospace", marginTop: 2 }}>
                        Ref: {entry.id}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "12px 18px",
                        textAlign: "right",
                        fontWeight: 600,
                        color: entry.amount >= 0 ? "#198754" : "#C0392B",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.amount >= 0 ? `+${entry.amount}` : entry.amount} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Institutional Badges Catalog */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 6,
          padding: 20,
          boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#17202A", margin: 0 }}>
            Institutional Recognition Badges
          </h2>
          <p style={{ fontSize: 12, color: "#667085", margin: "2px 0 0 0" }}>
            Departmental badges unlocked through sustained punctuality, research output, and mentoring
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeMap.has(badge.id);
            const awardedAt = earnedBadgeMap.get(badge.id);

            return (
              <div
                key={badge.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: 6,
                  border: isEarned ? "1px solid #BBF7D0" : "1px solid #E4E7EC",
                  backgroundColor: isEarned ? "#F0FDF4" : "#F7F8FA",
                  opacity: isEarned ? 1 : 0.7,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isEarned ? "#198754" : "#E4E7EC",
                    color: isEarned ? "#FFFFFF" : "#667085",
                    flexShrink: 0,
                  }}
                >
                  <Award size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isEarned ? "#17202A" : "#667085",
                      lineHeight: 1.25,
                    }}
                  >
                    {badge.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#667085", marginTop: 4, lineHeight: 1.4 }}>
                    {badge.description}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, fontWeight: 500 }}>
                    {isEarned ? (
                      <span style={{ color: "#198754" }}>
                        Unlocked on {formatDate(awardedAt!)}
                      </span>
                    ) : (
                      <span style={{ color: "#667085" }}>
                        Criteria: Institutional Award
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}