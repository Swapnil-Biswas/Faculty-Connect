import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Trophy, Users, Award } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function AdminBadgesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  const badges = await db.badge.findMany({
    include: {
      userBadges: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { awardedAt: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const totalAwards = badges.reduce((sum, b) => sum + b.userBadges.length, 0);

  const BADGE_ICONS: Record<string, string> = {
    "Early Bird": "⚡",
    "Task Master": "👑",
    "Consistent Performer": "🔥",
    "Perfect Score": "🌟",
    "Century Club": "💯",
    "Research Star": "🔬",
  };

  return (
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Badges" },
        ]}
        dotMatrixText="BADGES"
        eyebrow="RECOGNITION RULES · GAMIFICATION MATRIX"
        title="Merit Badge Configuration & Ledger"
        subtitle="View all system badges, achievement rules, and faculty members who have unlocked each milestone."
      />

      {/* Summary Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Badge Types</span>
            <Trophy size={16} color="#d97706" />
          </div>
          <div className="stat-card-num" style={{ color: "#d97706" }}>{badges.length}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Total Awards Conferred</span>
            <Award size={16} color="var(--grey-800)" />
          </div>
          <div className="stat-card-num">{totalAwards}</div>
        </div>

        <div className="stat-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span className="stat-card-label">Faculty with Badges</span>
            <Users size={16} color="#16a34a" />
          </div>
          <div className="stat-card-num" style={{ color: "#16a34a" }}>
            {new Set(badges.flatMap((b) => b.userBadges.map((ub) => ub.userId))).size}
          </div>
        </div>
      </div>

      {/* Badge Cards Grid */}
      <div className="grid grid-3" style={{ gap: 20 }}>
        {badges.map((badge) => {
          const icon = BADGE_ICONS[badge.name] ?? "🏅";
          const rule = badge.rule as Record<string, string | number>;
          return (
            <div
              key={badge.id}
              className="card card-hover"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* Badge Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: "var(--grey-100)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--grey-900)" }}>{badge.name}</div>
                  <div style={{ fontSize: 12, color: "var(--grey-500)", marginTop: 2 }}>
                    {badge.description}
                  </div>
                </div>
              </div>

              {/* Rule chip */}
              <div>
                <span className="badge">
                  Rule: {rule.type ?? "—"} · Threshold: {rule.threshold ?? "—"}
                </span>
              </div>

              {/* Award count */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--grey-500)", fontFamily: "var(--font-mono)" }}>
                  {badge.userBadges.length} award{badge.userBadges.length !== 1 ? "s" : ""} conferred
                </span>
              </div>

              {/* Recent earners */}
              {badge.userBadges.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                  {badge.userBadges.slice(0, 3).map((ub) => (
                    <div
                      key={ub.userId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        background: "var(--grey-50)",
                        borderRadius: 8,
                        border: "1px solid var(--grey-100)",
                      }}
                    >
                      <div
                        className="avatar avatar-sm"
                        style={{
                          width: 26,
                          height: 26,
                          fontSize: 10,
                          background: "var(--grey-200)",
                          color: "var(--grey-800)",
                        }}
                      >
                        {getInitials(ub.user.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 12, color: "var(--grey-900)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ub.user.name}
                        </div>
                      </div>
                      <span style={{ fontSize: 10.5, color: "var(--grey-400)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                        {formatDate(ub.awardedAt)}
                      </span>
                    </div>
                  ))}
                  {badge.userBadges.length > 3 && (
                    <div style={{ fontSize: 11, color: "var(--grey-500)", textAlign: "center", paddingTop: 4 }}>
                      + {badge.userBadges.length - 3} more faculty
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "16px 0", color: "var(--grey-400)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                  // Not yet unlocked by any faculty
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}