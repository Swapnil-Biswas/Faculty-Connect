import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, CheckSquare, Calendar, Star, Award, Mail, Plus, ExternalLink } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default async function ClusterRosterPage() {
  const session = await auth();
  if (!session?.user || !["CLUSTER_HEAD", "HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  // Get cluster ID for current user
  let clusterId = session.user.clusterId;

  if (!clusterId && ["HOD", "ADMIN"].includes(session.user.role)) {
    const firstCluster = await db.cluster.findFirst({ select: { id: true } });
    clusterId = firstCluster?.id ?? null;
  }

  if (!clusterId) {
    return (
      <div className="page-content">
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>No Cluster Assigned</h2>
          <p style={{ color: "hsl(var(--text-secondary))", marginTop: 8 }}>
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

  return (
    <div className="page-content">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 className="page-title">{cluster.name} — Faculty Roster</h1>
          <p className="page-subtitle">
            {cluster.description ?? "Active faculty members, workload distribution, and performance metrics."}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/cluster/tasks" className="btn-gradient" style={{ fontSize: 13, textDecoration: "none" }}>
            <Plus size={16} />
            Assign Task
          </Link>
          <Link href="/cluster/evaluations" className="btn-outline" style={{ fontSize: 13, textDecoration: "none" }}>
            <Star size={16} />
            Conduct Evaluation
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-primary) / 0.12)", color: "hsl(var(--color-primary))" }}>
            <Users size={22} />
          </div>
          <div className="stat-card-value">{members.length}</div>
          <div className="stat-card-label">Active Faculty Members</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-info) / 0.12)", color: "hsl(var(--color-info))" }}>
            <CheckSquare size={22} />
          </div>
          <div className="stat-card-value">
            {members.reduce((acc: number, m: any) => acc + m.pendingTasks, 0)}
          </div>
          <div className="stat-card-label">Active Tasks In Progress</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-success) / 0.12)", color: "hsl(var(--color-success))" }}>
            <Award size={22} />
          </div>
          <div className="stat-card-value">
            {members.reduce((acc: number, m: any) => acc + m.completedTasks, 0)}
          </div>
          <div className="stat-card-label">Total Tasks Completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}>
            <Star size={22} />
          </div>
          <div className="stat-card-value">
            {Math.round(members.reduce((acc: number, m: any) => acc + m.totalPoints, 0))}
          </div>
          <div className="stat-card-label">Cumulative Cluster Stars</div>
        </div>
      </div>

      {/* Roster Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 18 }}>
        {members.map((faculty) => (
          <div
            key={faculty.id}
            className="card"
            style={{
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 16,
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            {/* Header info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div className="avatar avatar-md" style={{ width: 46, height: 46, fontSize: 16 }}>
                  {getInitials(faculty.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "hsl(var(--text-primary))",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {faculty.name}
                  </h3>
                  <div style={{ fontSize: 12.5, color: "hsl(var(--text-muted))" }}>
                    {faculty.designation}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "hsl(var(--text-secondary))",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 2,
                    }}
                  >
                    <Mail size={12} />
                    <span>{faculty.email}</span>
                  </div>
                </div>
              </div>

              {/* Performance indicators */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 10,
                  background: "hsl(var(--bg-subtle))",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", fontWeight: 600 }}>TASKS</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, color: "hsl(var(--text-primary))" }}>
                    {faculty.completedTasks}/{faculty.totalTasks}
                  </div>
                  {faculty.overdueTasks > 0 && (
                    <div style={{ fontSize: 10, color: "hsl(var(--color-danger))", fontWeight: 700 }}>
                      {faculty.overdueTasks} overdue
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", fontWeight: 600 }}>STARS</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, color: "#F59E0B" }}>
                    ★ {Math.round(faculty.totalPoints)}
                  </div>
                  <div style={{ fontSize: 10, color: "hsl(var(--text-muted))" }}>
                    {faculty.badgesCount} badges
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", fontWeight: 600 }}>RATING</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2, color: faculty.latestRating ? "hsl(var(--color-primary))" : "hsl(var(--text-muted))" }}>
                    {faculty.latestRating ? `${faculty.latestRating}/5` : "N/A"}
                  </div>
                  <div style={{ fontSize: 10, color: "hsl(var(--text-muted))" }}>
                    {faculty.latestEvalPeriod ?? "No eval"}
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
                paddingTop: 12,
                borderTop: "1px solid hsl(var(--border))",
              }}
            >
              <span style={{ fontSize: 11.5, color: "hsl(var(--text-muted))" }}>
                Member since {new Date(faculty.joinedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </span>

              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/cluster/tasks?facultyId=${faculty.id}`}
                  className="btn-outline"
                  style={{ fontSize: 12, padding: "5px 10px", textDecoration: "none" }}
                >
                  Tasks
                </Link>
                <Link
                  href={`/cluster/evaluations?facultyId=${faculty.id}`}
                  className="btn-outline"
                  style={{ fontSize: 12, padding: "5px 10px", textDecoration: "none" }}
                >
                  Evaluate
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
