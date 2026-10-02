import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Layers,
  Users,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Calendar,
  UserCheck,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cluster Oversight — HOD Console" };

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
              designation: true,
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
    <div style={{ maxWidth: 1280, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "HOD_CONSOLE", href: "/hod" },
          { label: "CLUSTERS_OVERSIGHT" },
        ]}
        eyebrow="// ACADEMIC TOPOLOGY · GOVERNANCE"
        title="Department Cluster Nodes"
        subtitle="High-level operational overview of all faculty clusters, appointed leadership, and execution velocity."
        showDotMatrix={false}
        actions={
          session.user.role === "ADMIN" ? (
            <Link
              href="/admin/clusters"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#173B67",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              <span>MANAGE CLUSTER UNITS</span>
              <ExternalLink size={13} />
            </Link>
          ) : undefined
        }
      />

      {/* 2. Key Metrics Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", fontFamily: "var(--font-mono)" }}>
            ACTIVE CLUSTERS
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#17202A", fontFamily: "var(--font-mono)" }}>
            {totalClusters}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", fontFamily: "var(--font-mono)" }}>
            DEPARTMENT FACULTY
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#17202A", fontFamily: "var(--font-mono)" }}>
            {totalFaculty}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", fontFamily: "var(--font-mono)" }}>
            TOTAL ALLOCATED TASKS
          </span>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#2F6FED", fontFamily: "var(--font-mono)" }}>
            {totalTasks}
          </span>
        </div>

        <div
          style={{
            backgroundColor: totalOverdue > 0 ? "rgba(192, 57, 43, 0.04)" : "#FFFFFF",
            border: `1px solid ${totalOverdue > 0 ? "rgba(192, 57, 43, 0.25)" : "#E4E7EC"}`,
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: totalOverdue > 0 ? "#C0392B" : "#667085",
              fontFamily: "var(--font-mono)",
            }}
          >
            DEPARTMENT OVERDUE
          </span>
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: totalOverdue > 0 ? "#C0392B" : "#17202A",
              fontFamily: "var(--font-mono)",
            }}
          >
            {totalOverdue}
          </span>
        </div>
      </div>

      {/* 3. Cluster Units Matrix Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>
        {clusters.length === 0 ? (
          <div style={{ gridColumn: "1 / -1" }}>
            <EmptyState
              title="No Clusters Configured"
              description="No academic clusters have been established in the department. Contact the administrator to initialize cluster units."
              icon={Layers}
            />
          </div>
        ) : (
          clusters.map((cluster: any) => {
            const completedTasks = cluster.tasks.filter((t: any) => t.status === "COMPLETED").length;
            const overdueTasks = cluster.tasks.filter((t: any) => t.status === "OVERDUE").length;
            const inProgressTasks = cluster.tasks.filter(
              (t: any) => t.status === "IN_PROGRESS" || t.status === "OPEN"
            ).length;
            const completionPct =
              cluster.tasks.length > 0 ? Math.round((completedTasks / cluster.tasks.length) * 100) : 0;

            return (
              <div
                key={cluster.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E4E7EC",
                  borderRadius: 8,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 18,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
                }}
              >
                <div>
                  {/* Cluster Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          backgroundColor: "#173B67",
                          color: "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 15,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {cluster.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#17202A", margin: 0 }}>
                          {cluster.name}
                        </h3>
                        <span style={{ fontSize: 12, color: "#667085", fontFamily: "var(--font-mono)" }}>
                          {cluster.members.length} {cluster.members.length === 1 ? "faculty member" : "faculty members"}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: "rgba(23, 59, 103, 0.06)",
                        color: "#173B67",
                      }}
                    >
                      {cluster.tasks.length} tasks
                    </span>
                  </div>

                  {cluster.description && (
                    <p style={{ fontSize: 13, color: "#475467", lineHeight: 1.5, margin: "0 0 14px 0" }}>
                      {cluster.description}
                    </p>
                  )}

                  {/* Cluster Head Info Box */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      backgroundColor: "#F8FAFC",
                      borderRadius: 6,
                      border: "1px solid #F2F4F7",
                      marginBottom: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: cluster.head ? "#173B67" : "#CBD5E1",
                        color: "#FFFFFF",
                        fontSize: 10,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {cluster.head ? getInitials(cluster.head.name) : "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#667085",
                          letterSpacing: "0.08em",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        CLUSTER HEAD
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#17202A",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {cluster.head ? cluster.head.name : "Not Appointed"}
                      </div>
                    </div>
                  </div>

                  {/* Deliverables Progress */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, color: "#17202A" }}>Deliverables Velocity</span>
                      <span style={{ color: "#667085", fontFamily: "var(--font-mono)" }}>
                        {completedTasks}/{cluster.tasks.length} ({completionPct}%)
                      </span>
                    </div>

                    <div style={{ height: 6, backgroundColor: "#F2F4F7", borderRadius: 4, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${completionPct}%`,
                          height: "100%",
                          backgroundColor: "#173B67",
                          borderRadius: 4,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 11.5,
                        color: "#667085",
                        marginTop: 8,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      <span>In Flight: {inProgressTasks}</span>
                      {overdueTasks > 0 ? (
                        <span style={{ color: "#C0392B", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                          <AlertTriangle size={12} /> {overdueTasks} overdue
                        </span>
                      ) : (
                        <span style={{ color: "#198754" }}>0 overdue</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Links */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 14,
                    borderTop: "1px solid #F2F4F7",
                  }}
                >
                  <Link
                    href={`/hod/leave?cluster=${cluster.id}`}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#667085",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Calendar size={13} />
                    <span>Cluster Leaves</span>
                  </Link>

                  <Link
                    href={`/hod/tasks?cluster=${cluster.id}`}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#173B67",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>View Deliverables</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
