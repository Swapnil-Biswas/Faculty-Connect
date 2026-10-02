import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users, CheckSquare, Star, Plus, UserCheck, AlertTriangle } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cluster Head // Faculty Roster" };

export default async function ClusterRosterPage() {
  const session = await auth();
  if (!session?.user || !["CLUSTER_HEAD", "HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  let clusterId = session.user.clusterId;

  if (!clusterId && ["HOD", "ADMIN"].includes(session.user.role)) {
    const firstCluster = await db.cluster.findFirst({ select: { id: true } });
    clusterId = firstCluster?.id ?? null;
  }

  if (!clusterId) {
    return (
      <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
        <PageHeader
          breadcrumbs={[
            { label: "CLUSTER_CONSOLE", href: "/cluster" },
            { label: "ROSTER" },
          ]}
          title="Cluster Faculty Roster"
          subtitle="Active faculty members, workload distribution & performance metrics."
          dotMatrixText="ROSTER"
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
            You are not currently assigned to manage a faculty cluster.
          </p>
        </div>
      </div>
    );
  }

  const cluster = await db.cluster.findUnique({
    where: { id: clusterId },
    include: {
      head: { select: { id: true, name: true, email: true, designation: true } },
      members: {
        where: { leftAt: null },
        include: {
          user: {
            include: {
              assignedTasks: {
                where: { deletedAt: null },
                select: { id: true, status: true },
              },
              leaveApplications: {
                where: { status: "APPROVED" },
                select: { id: true, startDate: true, endDate: true },
              },
              pointsLedger: {
                select: { amount: true },
              },
              badges: {
                include: { badge: true },
              },
              evaluationsReceived: {
                orderBy: { createdAt: "desc" },
                take: 1,
                select: { overallRating: true, period: true },
              },
            },
          },
        },
      },
    },
  });

  if (!cluster) {
    redirect("/cluster");
  }

  const members = cluster.members.map((m: any) => {
    const u = m.user;
    const totalTasks = u.assignedTasks.length;
    const completedTasks = u.assignedTasks.filter((t: any) => t.status === "COMPLETED").length;
    const pendingTasks = u.assignedTasks.filter((t: any) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
    const overdueTasks = u.assignedTasks.filter((t: any) => t.status === "OVERDUE").length;
    const totalPoints = u.pointsLedger.reduce((sum: number, p: any) => sum + p.amount, 0);
    const latestEval = u.evaluationsReceived[0] ?? null;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      designation: u.designation ?? "Faculty Member",
      role: u.role,
      joinedAt: m.joinedAt,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalPoints,
      badgesCount: u.badges.length,
      latestRating: latestEval?.overallRating ?? null,
      latestEvalPeriod: latestEval?.period ?? null,
    };
  });

  const totalInProgress = members.reduce((acc, m) => acc + m.pendingTasks, 0);
  const totalCompleted = members.reduce((acc, m) => acc + m.completedTasks, 0);
  const totalOverdue = members.reduce((acc, m) => acc + m.overdueTasks, 0);

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "CLUSTER_CONSOLE", href: "/cluster" },
          { label: "FACULTY_ROSTER" },
        ]}
        eyebrow={`// DIRECTORY · ${cluster.name.toUpperCase()}`}
        dotMatrixText="ROSTER"
        title={`${cluster.name} — Faculty Roster`}
        subtitle={cluster.description ?? "Operational roster of active cluster faculty, workload distribution, and performance standing."}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/cluster/tasks"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#17202A",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              <Plus size={14} /> ASSIGN TASK
            </Link>
            <Link
              href="/cluster/evaluations"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: "#173B67",
                border: "1px solid #173B67",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              <Star size={14} /> APPRAISE FACULTY
            </Link>
          </div>
        }
      />

      {/* 2. Cluster Workload Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Active Faculty"
          value={members.length}
          context="Enrolled cluster members"
          trendType="neutral"
          icon={<Users size={18} color="#173B67" />}
        />
        <MetricBlock
          label="Tasks in Progress"
          value={totalInProgress}
          context="Active workload items"
          trendType="neutral"
          icon={<CheckSquare size={18} color="#2F6FED" />}
        />
        <MetricBlock
          label="Tasks Completed"
          value={totalCompleted}
          context="Verified cluster deliverables"
          trendType="positive"
          icon={<UserCheck size={18} color="#198754" />}
        />
        <MetricBlock
          label="Overdue Deliverables"
          value={totalOverdue}
          context={totalOverdue > 0 ? "Requires management attention" : "All deliverables on schedule"}
          trendType={totalOverdue > 0 ? "danger" : "positive"}
          icon={<AlertTriangle size={18} color={totalOverdue > 0 ? "#C0392B" : "#198754"} />}
        />
      </div>

      {/* 3. Operational Faculty Directory Data Table */}
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
              // OPERATIONAL DIRECTORY
            </span>
            <h2 style={{ fontSize: 16, fontWeight: 600, margin: "2px 0 0", color: "#17202A" }}>
              Faculty Members & Workload Distribution
            </h2>
          </div>
          <span style={{ fontSize: 11.5, color: "#667085", fontWeight: 500 }}>
            {members.length} ENROLLED FACULTY
          </span>
        </div>

        {members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Faculty Enrolled"
            description="There are currently no members enrolled in this cluster node."
          />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F7F8FA" }}>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Faculty Member
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Workload (Resolved / Total)
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Merit Stars
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Latest Appraisal
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Enrolled Date
                  </th>
                  <th style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((faculty: any) => (
                  <tr
                    key={faculty.id}
                    style={{
                      borderBottom: "1px solid #F2F4F7",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 6,
                            backgroundColor: "#173B67",
                            color: "#FFFFFF",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(faculty.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: "#17202A" }}>
                            {faculty.name}
                          </div>
                          <div style={{ fontSize: 11.5, color: "#667085" }}>
                            {faculty.designation} · {faculty.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#17202A", fontFamily: "var(--font-mono)" }}>
                          {faculty.completedTasks} / {faculty.totalTasks}
                        </span>
                        {faculty.overdueTasks > 0 ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#C0392B",
                              backgroundColor: "rgba(192, 57, 43, 0.08)",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {faculty.overdueTasks} OVERDUE
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "#198754",
                              backgroundColor: "rgba(25, 135, 84, 0.08)",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            ON TRACK
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#17202A", fontFamily: "var(--font-mono)" }}>
                        {Math.round(faculty.totalPoints).toLocaleString()} <span style={{ fontSize: 11, color: "#667085" }}>PTS</span>
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {faculty.latestRating ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#B7791F",
                            }}
                          >
                            <Star size={11} fill="#B7791F" color="#B7791F" />
                            {faculty.latestRating} / 5.0
                          </span>
                          <span style={{ fontSize: 11, color: "#667085" }}>
                            ({faculty.latestEvalPeriod})
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: "#98A2B3" }}>No evaluation</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12.5, color: "#667085" }}>
                      {formatDate(faculty.joinedAt)}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <Link
                          href="/cluster/tasks"
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: "#17202A",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E4E7EC",
                            borderRadius: 4,
                            padding: "4px 8px",
                            textDecoration: "none",
                          }}
                        >
                          Task
                        </Link>
                        <Link
                          href="/cluster/evaluations"
                          style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            color: "#173B67",
                            backgroundColor: "rgba(23, 59, 103, 0.08)",
                            borderRadius: 4,
                            padding: "4px 8px",
                            textDecoration: "none",
                          }}
                        >
                          Appraise
                        </Link>
                      </div>
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
