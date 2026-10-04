import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Trophy, Users, Award } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { BadgesClient } from "./BadgesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merit Badges — Admin | Faculty Connect",
};

export default async function AdminBadgesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  const rawBadges = await db.badge.findMany({
    include: {
      userBadges: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { awardedAt: "desc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const totalAwards = rawBadges.reduce((sum, b) => sum + b.userBadges.length, 0);
  const facultyWithBadgesCount = new Set(
    rawBadges.flatMap((b) => b.userBadges.map((ub) => ub.userId))
  ).size;

  const badges = rawBadges.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    iconUrl: b.iconUrl,
    rule: (b.rule ?? {}) as Record<string, unknown>,
    createdAt: b.createdAt.toISOString(),
    userBadges: b.userBadges.map((ub) => ({
      userId: ub.userId,
      awardedAt: ub.awardedAt.toISOString(),
      user: ub.user,
    })),
  }));

  return (
    <div
      style={{
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        backgroundColor: "#F7F8FA",
        minHeight: "100%",
      }}
    >
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Merit Badges" },
        ]}
        title="Merit Badges"
        subtitle="Registry of academic achievement criteria, gamified milestone rules, and faculty honorees."
        showDotMatrix={false}
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
              fontWeight: 600,
              color: "#17202A",
            }}
          >
            <Trophy size={14} color="#667085" />
            <span>{badges.length} Recognition Badges</span>
          </div>
        }
      />

      {/* 3 Summary Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <MetricBlock
          label="Total Badge Types"
          value={badges.length}
          context="Registered recognition milestones"
          trendType="neutral"
          icon={<Trophy size={18} />}
        />
        <MetricBlock
          label="Total Awards Conferred"
          value={totalAwards}
          context="Milestones achieved across faculty"
          trendType="positive"
          icon={<Award size={18} />}
        />
        <MetricBlock
          label="Faculty with Badges"
          value={facultyWithBadgesCount}
          context="Unique faculty honorees"
          trendType="neutral"
          icon={<Users size={18} />}
        />
      </div>

      {/* Badge Grid with Recipient Roster Modal */}
      <BadgesClient badges={badges} />
    </div>
  );
}