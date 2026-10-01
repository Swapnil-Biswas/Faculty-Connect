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
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* BMSIT High-Tech Header */}
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", borderRadius: 4, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", color: "#F59E0B", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
            <span>●</span> CLUSTER DIRECTORY // {cluster.name.toUpperCase()}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F8FAFC", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
            {cluster.name} — Faculty Roster
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, fontFamily: "var(--font-mono)" }}>
            // {cluster.description ?? "Active faculty members, workload distribution & performance metrics"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/cluster/tasks"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 18px",
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              border: "none",
              borderRadius: 8,
              color: "#0A0D14",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 0 16px rgba(245, 158, 11, 0.35)",
            }}
          >
            <Plus size={15} /> ASSIGN TASK
          </Link>
          <Link
            href="/cluster/evaluations"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 16px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 8,
              color: "#E2E8F0",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Star size={15} style={{ color: "#F59E0B" }} /> CONDUCT EVALUATION
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
        <div style={{ background: "#0E121B", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>ACTIVE FACULTY</span>
            <Users size={16} style={{ color: "#38BDF8" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#F8FAFC", fontFamily: "var(--font-mono)" }}>{members.length}</div>
        </div>

        <div style={{ background: "#0E121B", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>TASKS IN PROGRESS</span>
            <CheckSquare size={16} style={{ color: "#F59E0B" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
            {members.reduce((acc: number, m: any) => acc + m.pendingTasks, 0)}
          </div>
        </div>

        <div style={{ background: "#0E121B", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>TASKS COMPLETED</span>
            <Award size={16} style={{ color: "#22C55E" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#22C55E", fontFamily: "var(--font-mono)" }}>
            {members.reduce((acc: number, m: any) => acc + m.completedTasks, 0)}
          </div>
        </div>

        <div style={{ background: "#0E121B", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: 10, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>CLUSTER STARS</span>
            <Star size={16} style={{ color: "#F59E0B" }} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
            ★ {Math.round(members.reduce((acc: number, m: any) => acc + m.totalPoints, 0))}
          </div>
        </div>
      </div>

      {/* Roster Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>
        {members.map((faculty) => (
          <div
            key={faculty.id}
            className="cyber-card-hover"
            style={{
              background: "#0E121B",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 12,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 18,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              transition: "border-color 0.2s ease, transform 0.2s ease",
            }}
          >
            {/* Header info */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#F59E0B",
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
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#F8FAFC",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {faculty.name}
                  </h3>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>
                    {faculty.designation}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748B",
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
                  background: "#07090E",
                  padding: "12px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  textAlign: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, fontFamily: "var(--font-mono)" }}>TASKS</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: "#F8FAFC", fontFamily: "var(--font-mono)" }}>
                    {faculty.completedTasks}/{faculty.totalTasks}
                  </div>
                  {faculty.overdueTasks > 0 ? (
                    <div style={{ fontSize: 9.5, color: "#F43F5E", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      ▲ {faculty.overdueTasks} OVERDUE
                    </div>
                  ) : (
                    <div style={{ fontSize: 9.5, color: "#22C55E", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      ● ON TRACK
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, fontFamily: "var(--font-mono)" }}>STARS</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
                    ★ {Math.round(faculty.totalPoints)}
                  </div>
                  <div style={{ fontSize: 9.5, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>
                    {faculty.badgesCount} BADGES
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700, fontFamily: "var(--font-mono)" }}>RATING</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: faculty.latestRating ? "#38BDF8" : "#64748B", fontFamily: "var(--font-mono)" }}>
                    {faculty.latestRating ? `${faculty.latestRating}/5` : "N/A"}
                  </div>
                  <div style={{ fontSize: 9.5, color: "#64748B", fontFamily: "var(--font-mono)" }}>
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
                borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <span style={{ fontSize: 11, color: "#64748B", fontFamily: "var(--font-mono)" }}>
                ENROLLED {new Date(faculty.joinedAt).toLocaleDateString(undefined, { month: "short", year: "numeric" }).toUpperCase()}
              </span>

              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/cluster/tasks?facultyId=${faculty.id}`}
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    padding: "5px 10px",
                    borderRadius: 6,
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#E2E8F0",
                    textDecoration: "none",
                  }}
                >
                  TASKS
                </Link>
                <Link
                  href={`/cluster/evaluations?facultyId=${faculty.id}`}
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    padding: "5px 10px",
                    borderRadius: 6,
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    color: "#F59E0B",
                    textDecoration: "none",
                  }}
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
