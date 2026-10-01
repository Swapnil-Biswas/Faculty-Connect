import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Trophy, Users, Award } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

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
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Trophy className="text-warning" size={28} />
          Badge Management
        </h1>
        <p className="page-subtitle">
          View all system badges, their award rules, and which faculty members have unlocked each achievement.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(45 93% 47% / 0.15)", color: "#eab308" }}>
            <Trophy size={24} />
          </div>
          <div className="stat-card-value">{badges.length}</div>
          <div className="stat-card-label">Total Badge Types</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-primary) / 0.15)", color: "hsl(var(--color-primary))" }}>
            <Award size={24} />
          </div>
          <div className="stat-card-value">{totalAwards}</div>
          <div className="stat-card-label">Total Badges Awarded</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(142 71% 45% / 0.15)", color: "hsl(142 71% 45%)" }}>
            <Users size={24} />
          </div>
          <div className="stat-card-value">
            {new Set(badges.flatMap((b) => b.userBadges.map((ub) => ub.userId))).size}
          </div>
          <div className="stat-card-label">Faculty with Badges</div>
        </div>
      </div>

      {/* Badge Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {badges.map((badge) => {
          const icon = BADGE_ICONS[badge.name] ?? "🏅";
          const rule = badge.rule as Record<string, string | number>;
          return (
            <div
              key={badge.id}
              className="card"
              style={{
                padding: "1.5rem",
                borderTop: `3px solid ${badge.userBadges.length > 0 ? "hsl(var(--color-primary))" : "hsl(var(--border))"}`,
              }}
            >
              {/* Badge Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.875rem" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background:
                      badge.userBadges.length > 0
                        ? "linear-gradient(135deg, hsl(var(--color-primary) / 0.15), hsl(var(--color-secondary) / 0.15))"
                        : "hsl(var(--bg-muted))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.625rem",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.0625rem" }}>{badge.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))", marginTop: "2px" }}>
                    {badge.description}
                  </div>
                </div>
              </div>

              {/* Rule chip */}
              <div style={{ marginBottom: "1rem" }}>
                <span
                  className="status-badge"
                  style={{ fontSize: "11px", background: "hsl(var(--bg-muted))", color: "hsl(var(--text-secondary))" }}
                >
                  Rule: {rule.type ?? "—"} · Threshold: {rule.threshold ?? "—"}
                </span>
              </div>

              {/* Award count */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.875rem", color: "hsl(var(--text-muted))" }}>
                  {badge.userBadges.length} award{badge.userBadges.length !== 1 ? "s" : ""} given
                </span>
              </div>

              {/* Recent earners */}
              {badge.userBadges.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {badge.userBadges.slice(0, 3).map((ub) => (
                    <div
                      key={ub.userId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        padding: "0.5rem 0.625rem",
                        background: "hsl(var(--bg-muted))",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <div className="avatar avatar-xs">{getInitials(ub.user.name)}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ub.user.name}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "hsl(var(--text-muted))", flexShrink: 0 }}>
                        {formatDate(ub.awardedAt)}
                      </span>
                    </div>
                  ))}
                  {badge.userBadges.length > 3 && (
                    <div style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))", textAlign: "center", paddingTop: "0.25rem" }}>
                      + {badge.userBadges.length - 3} more faculty
                    </div>
                  )}
                </div>
              )}

              {badge.userBadges.length === 0 && (
                <div style={{ textAlign: "center", padding: "1rem 0", color: "hsl(var(--text-muted))", fontSize: "0.8125rem" }}>
                  Not yet awarded to any faculty
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}