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

export const metadata: Metadata = { title: "Faculty Console // Recognition Ledger" };

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
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "FACULTY_CONSOLE", href: "/faculty" },
          { label: "STARS_LEDGER" },
        ]}
        title="Recognition & Merit Performance Ledger"
        subtitle="Cryptographically verified, append-only performance ledger and achievements earned across departmental activities."
        eyebrow="// MERIT RECOGNITION · STARS LEDGER"
        dotMatrixText="STARS"
      />

      {/* 2. Top Summary Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Cumulative Star Points"
          value={totalPoints.toLocaleString()}
          context="Verified append-only balance"
          trendType="positive"
          icon={<Star size={18} color="#FFD700" />}
        />
        <MetricBlock
          label="Department Standing"
          value={currentRank !== "—" ? `#${currentRank}` : "—"}
          context={`Out of ${totalFaculty} active nodes`}
          trendType="neutral"
          icon={<Trophy size={18} color="#FFD700" />}
        />
        <MetricBlock
          label="Badges Unlocked"
          value={`${userBadges.length} / ${allBadges.length}`}
          context="Accredited recognitions"
          trendType="neutral"
          icon={<Award size={18} color="#38BDF8" />}
        />
        <MetricBlock
          label="On-Time Delivery Rate"
          value={`${rankEntry?.onTimeRate ?? 0}%`}
          context={`${rankEntry?.completedTasks ?? 0} tasks verified`}
          trendType={
            (rankEntry?.onTimeRate ?? 0) >= 80 ? "positive" : "warning"
          }
          icon={<CheckCircle2 size={18} color="#4ADE80" />}
        />
      </div>

      {/* 3. Source Distribution Bar */}
      <div
        className="tech-card"
        style={{
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span className="hero-eyebrow" style={{ margin: 0 }}>
            // POINTS DISTRIBUTION BY CATEGORY
          </span>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#64748B" }}>
            TOTAL: {totalPoints} PTS
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <div style={{ padding: "14px 16px", backgroundColor: "#FAFAFA", borderRadius: 8, border: "1px solid rgba(14, 165, 233, 0.25)" }}>
            <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0284C7", textTransform: "uppercase" }}>
              ◆ TASK DELIVERY
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)", color: "#1D1D1F", marginTop: 4 }}>
              {taskPoints} <span style={{ fontSize: 12, fontWeight: 500, color: "#6E6E73" }}>pts</span>
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#6E6E73", marginTop: 4 }}>
              {totalPoints > 0 ? Math.round((taskPoints / totalPoints) * 100) : 0}% of cumulative total
            </div>
          </div>

          <div style={{ padding: "14px 16px", backgroundColor: "#FAFAFA", borderRadius: 8, border: "1px solid rgba(217, 119, 6, 0.25)" }}>
            <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#B45309", textTransform: "uppercase" }}>
              ★ CLUSTER EVALUATIONS
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)", color: "#1D1D1F", marginTop: 4 }}>
              {evalPoints} <span style={{ fontSize: 12, fontWeight: 500, color: "#6E6E73" }}>pts</span>
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#6E6E73", marginTop: 4 }}>
              {totalPoints > 0 ? Math.round((evalPoints / totalPoints) * 100) : 0}% of cumulative total
            </div>
          </div>

          <div style={{ padding: "14px 16px", backgroundColor: "#FAFAFA", borderRadius: 8, border: "1px solid rgba(99, 102, 241, 0.25)" }}>
            <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase" }}>
              ◈ SCHOLARLY & RESEARCH
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-mono)", color: "#1D1D1F", marginTop: 4 }}>
              {otherPoints} <span style={{ fontSize: 12, fontWeight: 500, color: "#6E6E73" }}>pts</span>
            </div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#6E6E73", marginTop: 4 }}>
              {totalPoints > 0 ? Math.round((otherPoints / totalPoints) * 100) : 0}% of cumulative total
            </div>
          </div>
        </div>
      </div>

      {/* 4. Append-Only Points Ledger Table */}
      <div className="tech-card" style={{ padding: 0, overflow: "hidden", marginBottom: 32, backgroundColor: "#FFFFFF", border: "1px solid #E8E8ED" }}>
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #E8E8ED",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#F5F5F7",
          }}
        >
          <div>
            <span className="hero-eyebrow" style={{ margin: 0, color: "#86868B" }}>
              // AUDIT LOG
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F", margin: "2px 0 0 0" }}>
              Points Transaction Ledger
            </h2>
          </div>
          <span className="glyph-chip glyph-chip-cyan" style={{ fontSize: 11 }}>
            {ledger.length} TRANSACTIONS RECORDED
          </span>
        </div>

        {ledger.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState
              icon={Star}
              title="NO POINTS RECORDED"
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
                    backgroundColor: "#F5F5F7",
                    borderBottom: "1px solid #E8E8ED",
                    color: "#6E6E73",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  <th style={{ padding: "12px 20px" }}>Date & Timestamp</th>
                  <th style={{ padding: "12px 18px" }}>Event Source</th>
                  <th style={{ padding: "12px 18px" }}>Reason & Reference</th>
                  <th style={{ padding: "12px 24px", textAlign: "right" }}>Delta</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry, idx) => (
                  <tr
                    key={entry.id}
                    className="cyber-row-hover"
                    style={{
                      borderBottom: idx < ledger.length - 1 ? "1px solid #E8E8ED" : "none",
                    }}
                  >
                    <td style={{ padding: "14px 20px", color: "#6E6E73", fontFamily: "var(--font-mono)", fontSize: 12, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={12} color="#86868B" />
                        <span>{formatDate(entry.createdAt)}</span>
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                      <span className="glyph-chip" style={{ fontSize: 10.5 }}>
                        {entry.source.replace("_", " ")}
                      </span>
                    </td>

                    <td style={{ padding: "14px 18px", color: "#1D1D1F" }}>
                      <div>{entry.reason || "Performance credit"}</div>
                      <div style={{ fontSize: 10.5, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                        TX: {entry.id}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "14px 24px",
                        textAlign: "right",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        color: entry.amount >= 0 ? "#16A34A" : "#E11D48",
                        fontSize: 13.5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.amount >= 0 ? `+${entry.amount}` : entry.amount} PTS
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Institutional Badges Catalog */}
      <div className="tech-card" style={{ padding: 24, backgroundColor: "#FFFFFF", border: "1px solid #E8E8ED" }}>
        <div style={{ marginBottom: 18 }}>
          <span className="hero-eyebrow" style={{ margin: 0, color: "#86868B" }}>
            // INSTITUTIONAL RECOGNITIONS
          </span>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1D1D1F", margin: "2px 0 0 0" }}>
            Faculty Merit Badges
          </h2>
          <p style={{ fontSize: 12.5, color: "#6E6E73", margin: "4px 0 0 0" }}>
            Departmental badges unlocked through sustained punctuality, research output, and peer mentoring.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
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
                  gap: 14,
                  padding: "16px",
                  borderRadius: 12,
                  border: isEarned
                    ? "1.5px solid #1D1D1F"
                    : "1px solid #E8E8ED",
                  backgroundColor: isEarned
                    ? "#FFFFFF"
                    : "#FAFAFA",
                  opacity: isEarned ? 1 : 0.75,
                  boxShadow: isEarned ? "0 2px 8px rgba(0, 0, 0, 0.06)" : "none",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isEarned ? "#F5F5F7" : "#E8E8ED",
                    border: "1px solid #E8E8ED",
                    color: isEarned ? "#1D1D1F" : "#86868B",
                    flexShrink: 0,
                  }}
                >
                  <Award size={20} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: isEarned ? "#1D1D1F" : "#6E6E73",
                      lineHeight: 1.25,
                    }}
                  >
                    {badge.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#6E6E73", marginTop: 4, lineHeight: 1.45 }}>
                    {badge.description}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 11, fontFamily: "var(--font-mono)" }}>
                    {isEarned ? (
                      <span style={{ color: "#16A34A", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                        <CheckCircle2 size={12} /> Unlocked on {formatDate(awardedAt!)}
                      </span>
                    ) : (
                      <span style={{ color: "#86868B" }}>
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