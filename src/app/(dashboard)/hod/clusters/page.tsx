import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderGit2, Users, CheckSquare, Calendar, ChevronRight, AlertTriangle } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default async function HodClustersPage() {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  const clusters = await db.cluster.findMany({
    include: {
      head: { select: { id: true, name: true, email: true, designation: true } },
      members: {
        where: { leftAt: null },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              assignedTasks: { where: { deletedAt: null }, select: { status: true } },
              leaveApplications: { where: { status: "APPROVED" }, select: { id: true } },
            },
          },
        },
      },
      tasks: {
        where: { deletedAt: null },
        select: { id: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const totalClusters = clusters.length;
  const totalFaculty = clusters.reduce((acc: number, c: any) => acc + c.members.length, 0);
  const totalTasks = clusters.reduce((acc: number, c: any) => acc + c.tasks.length, 0);
  const totalOverdue = clusters.reduce(
    (acc: number, c: any) => acc + c.tasks.filter((t: any) => t.status === "OVERDUE").length,
    0
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Department Clusters</h1>
        <p className="page-subtitle">
          High-level operational overview of all faculty clusters, appointed leadership, and execution velocity.
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-primary) / 0.12)", color: "hsl(var(--color-primary))" }}>
            <FolderGit2 size={22} />
          </div>
          <div className="stat-card-value">{totalClusters}</div>
          <div className="stat-card-label">Total Department Clusters</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-info) / 0.12)", color: "hsl(var(--color-info))" }}>
            <Users size={22} />
          </div>
          <div className="stat-card-value">{totalFaculty}</div>
          <div className="stat-card-label">Assigned Faculty Members</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-success) / 0.12)", color: "hsl(var(--color-success))" }}>
            <CheckSquare size={22} />
          </div>
          <div className="stat-card-value">{totalTasks}</div>
          <div className="stat-card-label">Active & Completed Tasks</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-danger) / 0.12)", color: "hsl(var(--color-danger))" }}>
            <AlertTriangle size={22} />
          </div>
          <div className="stat-card-value">{totalOverdue}</div>
          <div className="stat-card-label">Department-wide Overdue</div>
        </div>
      </div>

      {/* Clusters List */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 18 }}>
        {clusters.map((cluster: any) => {
          const completedTasks = cluster.tasks.filter((t: any) => t.status === "COMPLETED").length;
          const overdueTasks = cluster.tasks.filter((t: any) => t.status === "OVERDUE").length;
          const completionPct = cluster.tasks.length > 0
            ? Math.round((completedTasks / cluster.tasks.length) * 100)
            : 0;

          return (
            <div
              key={cluster.id}
              className="card"
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: "hsl(var(--color-primary) / 0.12)",
                      color: "hsl(var(--color-primary))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FolderGit2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{cluster.name}</h3>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>{cluster.members.length} Faculty Members</div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", lineHeight: 1.5, marginBottom: 16 }}>
                  {cluster.description ?? "No description available for this cluster."}
                </p>

                {/* Head Info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "hsl(var(--bg-subtle))",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: 16,
                  }}
                >
                  <div className="avatar avatar-sm">
                    {cluster.head ? getInitials(cluster.head.name) : "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", fontWeight: 600 }}>CLUSTER HEAD</div>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cluster.head ? cluster.head.name : "Not Appointed"}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>Task Completion</span>
                    <span style={{ color: "hsl(var(--text-muted))" }}>
                      {completedTasks}/{cluster.tasks.length} ({completionPct}%)
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                  {overdueTasks > 0 && (
                    <div style={{ fontSize: 11, color: "hsl(var(--color-danger))", marginTop: 4, fontWeight: 600 }}>
                      ⚠️ {overdueTasks} overdue tasks
                    </div>
                  )}
                </div>
              </div>

              {/* Footer action */}
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
                  {cluster.members.length} active faculty
                </span>

                <Link
                  href={`/hod/tasks?clusterId=${cluster.id}`}
                  className="btn-outline"
                  style={{ fontSize: 12, padding: "5px 12px", textDecoration: "none", gap: 4 }}
                >
                  <span>View Tasks</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
