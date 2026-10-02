import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Users, CheckSquare, Calendar, Star, Award, Mail, Plus } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default async function ClusterRosterPage() {
  const session = await auth();
  if (!session?.user || !["CLUSTER_HEAD", "HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  // Get cluster ID for current user
  let clusterId = session.user.clusterId;

  if (!clusterId && ["HOD", "ADMIN"].includes(session.user.role)) {
    const firstCluster = await db.cluster.findFirst({ select: { id: true } });
    clusterId = firstCluster?.id ?? null;
  }

  if (!clusterId) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 48 }}>
        <h2 className="card-title">No Cluster Assigned</h2>
        <p className="card-muted" style={{ marginTop: 8 }}>
          You are not currently assigned to manage a faculty cluster.
        </p>
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

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header with BMSIT Dot Matrix */}
      <PageHeader
        breadcrumbs={[
          { label: "Cluster Console", href: "/cluster" },
          { label: "Faculty Roster" },
        ]}
        eyebrow={`CLUSTER // ${cluster.name.toUpperCase()}`}
        dotMatrixText="ROSTER"
        dotMatrixFontSize={36}
        title={`${cluster.name} — Faculty Roster`}
        ghost="directory."
        subtitle={cluster.description ?? "Active faculty members, workload distribution & performance metrics"}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/cluster/tasks"
              className="btn-primary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={14} /> ASSIGN TASK
            </Link>
            <Link
              href="/cluster/evaluations"
              className="btn-secondary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Star size={14} /> CONDUCT EVALUATION
            </Link>
          </div>
        }
      />

      {/* 2. Summary stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-num">{members.length}</div>
          <div className="stat-card-label">ACTIVE FACULTY</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-num">
            {members.reduce((acc: number, m: any) => acc + m.pendingTasks, 0)}
          </div>
          <div className="stat-card-label">TASKS IN PROGRESS</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-num" style={{ color: "#16A34A" }}>
            {members.reduce((acc: number, m: any) => acc + m.completedTasks, 0)}
          </div>
          <div className="stat-card-label">TASKS COMPLETED</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-num">
            ★ {Math.round(members.reduce((acc: number, m: any) => acc + m.totalPoints, 0))}
          </div>
          <div className="stat-card-label">CLUSTER STARS</div>
        </div>
      </div>

      {/* 3. Roster Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>
        {members.map((faculty) => (
          <div
            key={faculty.id}
            className="card card-hover"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 18,
            }}
          >
            {/* Header info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#1D1D1F",
                    color: "#FFFFFF",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(faculty.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    className="card-title"
                    style={{
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {faculty.name}
                  </h3>
                  <div style={{ fontSize: 12, color: "#6E6E73", marginTop: 2 }}>
                    {faculty.designation}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#86868B",
                      fontFamily: "var(--font-mono)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 2,
                    }}
                  >
                    <Mail size={11} />
                    <span>{faculty.email}</span>
                  </div>
                </div>
              </div>

              {/* Performance indicators */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                  background: "#FAFAFA",
                  padding: "12px 10px",
                  borderRadius: 10,
                  border: "1px solid #E8E8ED",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: "#86868B", fontWeight: 700, fontFamily: "var(--font-mono)" }}>TASKS</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                    {faculty.completedTasks}/{faculty.totalTasks}
                  </div>
                  {faculty.overdueTasks > 0 ? (
                    <div style={{ fontSize: 9.5, color: "#E11D48", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      ▲ {faculty.overdueTasks} OVERDUE
                    </div>
                  ) : (
                    <div style={{ fontSize: 9.5, color: "#16A34A", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      ● ON TRACK
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 10, color: "#86868B", fontWeight: 700, fontFamily: "var(--font-mono)" }}>STARS</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                    ★ {Math.round(faculty.totalPoints)}
                  </div>
                  <div style={{ fontSize: 9.5, color: "#6E6E73", fontFamily: "var(--font-mono)" }}>
                    {faculty.badgesCount} BADGES
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: "#86868B", fontWeight: 700, fontFamily: "var(--font-mono)" }}>RATING</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                    {faculty.latestRating ? `${faculty.latestRating}/5` : "N/A"}
                  </div>
                  <div style={{ fontSize: 9.5, color: "#6E6E73", fontFamily: "var(--font-mono)" }}>
                    {faculty.latestEvalPeriod ?? "NO EVAL"}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 14,
                borderTop: "1px solid #E8E8ED",
              }}
            >
              <span style={{ fontSize: 11, color: "#86868B", fontFamily: "var(--font-mono)" }}>
                ENROLLED {new Date(faculty.joinedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }).toUpperCase()}
              </span>

              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/cluster/tasks?facultyId=${faculty.id}`}
                  className="btn-secondary btn-sm"
                  style={{ padding: "4px 10px", fontSize: 11 }}
                >
                  TASKS
                </Link>
                <Link
                  href={`/cluster/evaluations?facultyId=${faculty.id}`}
                  className="btn-primary btn-sm"
                  style={{ padding: "4px 10px", fontSize: 11 }}
                >
                  EVALUATE
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
