import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { FolderGit2, Users, CheckSquare, ChevronRight, AlertTriangle } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default async function HodClustersPage() {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
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
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Page Header with BMSIT Dot Matrix */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Clusters" },
        ]}
        eyebrow="HOD // ACADEMIC TOPOLOGY"
        dotMatrixText="CLUSTERS"
        dotMatrixFontSize={36}
        title="Department Clusters Matrix"
        ghost="topology."
        subtitle="High-level operational overview of all faculty clusters, appointed leadership, and execution velocity."
      />

      {/* 2. Stats Summary */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-num">{totalClusters}</div>
          <div className="stat-card-label">TOTAL CLUSTERS</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num">{totalFaculty}</div>
          <div className="stat-card-label">ASSIGNED FACULTY</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num">{totalTasks}</div>
          <div className="stat-card-label">TOTAL ALLOCATED TASKS</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-num" style={{ color: totalOverdue > 0 ? "#E11D48" : "#1D1D1F" }}>
            {totalOverdue}
          </div>
          <div className="stat-card-label">DEPARTMENT OVERDUE</div>
        </div>
      </div>

      {/* 3. Clusters Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
        {clusters.map((cluster: any) => {
          const completedTasks = cluster.tasks.filter((t: any) => t.status === "COMPLETED").length;
          const overdueTasks = cluster.tasks.filter((t: any) => t.status === "OVERDUE").length;
          const completionPct = cluster.tasks.length > 0
            ? Math.round((completedTasks / cluster.tasks.length) * 100)
            : 0;

          return (
            <div
              key={cluster.id}
              className="card card-hover"
              style={{
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
                      background: "#1D1D1F",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontFamily: "var(--font-mono)",
                      fontSize: 16,
                    }}
                  >
                    {cluster.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="card-title" style={{ margin: 0 }}>{cluster.name}</h3>
                    <div style={{ fontSize: 12, color: "#6E6E73", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      {cluster.members.length} Faculty Members
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "#424245", lineHeight: 1.5, marginBottom: 16 }}>
                  {cluster.description ?? "No description available for this cluster."}
                </p>

                {/* Head Info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "#FAFAFA",
                    borderRadius: 10,
                    border: "1px solid #E8E8ED",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: "#1D1D1F",
                      color: "#FFFFFF",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {cluster.head ? getInitials(cluster.head.name) : "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: "#86868B", fontWeight: 600, letterSpacing: "0.08em" }}>
                      CLUSTER HEAD
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1D1D1F", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {cluster.head ? cluster.head.name : "Not Appointed"}
                    </div>
                  </div>
                </div>

                {/* Task Progress Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "#1D1D1F" }}>Task Velocity</span>
                    <span style={{ color: "#6E6E73", fontFamily: "var(--font-mono)" }}>
                      {completedTasks}/{cluster.tasks.length} ({completionPct}%)
                    </span>
                  </div>
                  <div style={{ height: 6, background: "#E8E8ED", borderRadius: 10, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${completionPct}%`,
                        height: "100%",
                        background: "#1D1D1F",
                        borderRadius: 10,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  {overdueTasks > 0 && (
                    <div style={{ fontSize: 11, color: "#E11D48", marginTop: 6, fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                      ⚠️ {overdueTasks} overdue tasks
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  borderTop: "1px solid #E8E8ED",
                }}
              >
                <span style={{ fontSize: 11.5, color: "#86868B", fontFamily: "var(--font-mono)" }}>
                  {cluster.members.length} active nodes
                </span>

                <Link
                  href={`/hod/tasks?clusterId=${cluster.id}`}
                  className="btn-secondary btn-sm"
                  style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <span>View Tasks</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
