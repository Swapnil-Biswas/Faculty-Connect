import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate, getInitials } from "@/lib/utils";
import { AssignTaskForm } from "./AssignTaskForm";
import { HodTaskFilters } from "./HodTaskFilters";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckSquare, Plus, Clock, AlertTriangle, Layers, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Department Tasks — HOD Console" };

export default async function HodTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ cluster?: string; status?: string; priority?: string }>;
}) {
  const session = await auth();
  if (!session || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const params = await searchParams;
  const clusterFilter = params.cluster;
  const statusFilter = params.status;
  const priorityFilter = params.priority;

  const [clusters, tasks, allFaculty] = await Promise.all([
    db.cluster.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.task.findMany({
      where: {
        deletedAt: null,
        ...(clusterFilter ? { clusterId: clusterFilter } : {}),
        ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter as never } : {}),
        ...(priorityFilter && priorityFilter !== "ALL" ? { priority: priorityFilter as never } : {}),
      },
      include: {
        assignedTo: { select: { id: true, name: true, designation: true } },
        assignedBy: { select: { id: true, name: true } },
        cluster: { select: { id: true, name: true } },
      },
      orderBy: [{ status: "asc" }, { deadline: "asc" }],
    }),
    db.user.findMany({
      where: { role: { in: ["FACULTY", "CLUSTER_HEAD"] }, deletedAt: null },
      select: { id: true, name: true, designation: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Overall department task counts (independent of filter)
  const allDeptTasks = await db.task.findMany({
    where: { deletedAt: null },
    select: { status: true },
  });

  const statsMap = {
    TOTAL: allDeptTasks.length,
    OPEN: allDeptTasks.filter((t) => t.status === "OPEN").length,
    IN_PROGRESS: allDeptTasks.filter((t) => t.status === "IN_PROGRESS").length,
    COMPLETED: allDeptTasks.filter((t) => t.status === "COMPLETED").length,
    OVERDUE: allDeptTasks.filter((t) => t.status === "OVERDUE").length,
  };

  const PRIORITY_BADGE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
    LOW: { bg: "rgba(100, 116, 139, 0.08)", color: "#64748B", border: "#CBD5E1" },
    MEDIUM: { bg: "rgba(47, 111, 237, 0.08)", color: "#2F6FED", border: "#BFDBFE" },
    HIGH: { bg: "rgba(183, 121, 31, 0.08)", color: "#B7791F", border: "#FDE68A" },
    CRITICAL: { bg: "rgba(192, 57, 43, 0.08)", color: "#C0392B", border: "#FECACA" },
  };

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "HOD_CONSOLE", href: "/hod" },
          { label: "TASKS_MATRIX" },
        ]}
        eyebrow="// ACADEMIC OPERATIONS · ALL CLUSTERS"
        title="Department Tasks Matrix"
        subtitle="View, allocate, and monitor deliverables across all departmental clusters."
        showDotMatrix={false}
      />

      {/* 2. Operational Status Metrics Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", fontFamily: "var(--font-mono)" }}>
            TOTAL DELIVERABLES
          </span>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#17202A", fontFamily: "var(--font-mono)" }}>
            {statsMap.TOTAL}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", fontFamily: "var(--font-mono)" }}>
            IN PROGRESS
          </span>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#2F6FED", fontFamily: "var(--font-mono)" }}>
            {statsMap.IN_PROGRESS}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", fontFamily: "var(--font-mono)" }}>
            OPEN FOR CLAIM
          </span>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#17202A", fontFamily: "var(--font-mono)" }}>
            {statsMap.OPEN}
          </span>
        </div>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", fontFamily: "var(--font-mono)" }}>
            COMPLETED
          </span>
          <span style={{ fontSize: 24, fontWeight: 700, color: "#198754", fontFamily: "var(--font-mono)" }}>
            {statsMap.COMPLETED}
          </span>
        </div>

        <div
          style={{
            backgroundColor: statsMap.OVERDUE > 0 ? "rgba(192, 57, 43, 0.04)" : "#FFFFFF",
            border: `1px solid ${statsMap.OVERDUE > 0 ? "rgba(192, 57, 43, 0.25)" : "#E4E7EC"}`,
            borderRadius: 8,
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: statsMap.OVERDUE > 0 ? "#C0392B" : "#667085",
              fontFamily: "var(--font-mono)",
            }}
          >
            OVERDUE ESCALATIONS
          </span>
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: statsMap.OVERDUE > 0 ? "#C0392B" : "#17202A",
              fontFamily: "var(--font-mono)",
            }}
          >
            {statsMap.OVERDUE}
          </span>
        </div>
      </div>

      {/* 3. Main Grid: Task Dispatch Form (Left) & Filterable Task Matrix (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 380px) 1fr", gap: 24, alignItems: "start" }}>
        {/* Task Dispatch Section */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                backgroundColor: "#173B67",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#17202A", margin: 0 }}>
                Dispatch Department Task
              </h2>
              <span style={{ fontSize: 12, color: "#667085" }}>
                Assign directly to any departmental faculty member
              </span>
            </div>
          </div>

          <AssignTaskForm faculty={allFaculty} clusters={clusters} />
        </div>

        {/* Task Ledger Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Filter Bar */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: 8,
              padding: "12px 16px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
          >
            <HodTaskFilters
              clusters={clusters}
              currentCluster={clusterFilter}
              currentStatus={statusFilter}
              currentPriority={priorityFilter}
            />
          </div>

          {/* Tasks Table */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid #E4E7EC",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F8FAFC",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}>
                Deliverables Ledger ({tasks.length})
              </span>
              <span style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#667085" }}>
                {clusterFilter
                  ? `Cluster: ${clusters.find((c) => c.id === clusterFilter)?.name ?? "Selected"}`
                  : "All Departmental Clusters"}
              </span>
            </div>

            {tasks.length === 0 ? (
              <div style={{ padding: "48px 24px" }}>
                <EmptyState
                  title="No Tasks Found"
                  description="No deliverables match the selected filter criteria. Adjust the filters above or dispatch a new task using the form."
                  icon={CheckSquare}
                />
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F8FAFC" }}>
                      <th
                        style={{
                          padding: "10px 16px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#667085",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        TASK DELIVERABLE
                      </th>
                      <th
                        style={{
                          padding: "10px 16px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#667085",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        CLUSTER
                      </th>
                      <th
                        style={{
                          padding: "10px 16px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#667085",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        ASSIGNED TO
                      </th>
                      <th
                        style={{
                          padding: "10px 16px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#667085",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        PRIORITY
                      </th>
                      <th
                        style={{
                          padding: "10px 16px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#667085",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        STATUS
                      </th>
                      <th
                        style={{
                          padding: "10px 16px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#667085",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        DEADLINE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const priorityStyle =
                        PRIORITY_BADGE_STYLE[task.priority] ?? PRIORITY_BADGE_STYLE.MEDIUM;
                      const isPastDeadline =
                        task.status !== "COMPLETED" && new Date(task.deadline) < new Date();

                      return (
                        <tr
                          key={task.id}
                          style={{
                            borderBottom: "1px solid #F2F4F7",
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          <td style={{ padding: "12px 16px", maxWidth: 280 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#17202A" }}>
                              {task.title}
                            </div>
                            {task.description && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#667085",
                                  marginTop: 2,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {task.description}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 11.5,
                                fontWeight: 500,
                                color: "#173B67",
                                backgroundColor: "rgba(23, 59, 103, 0.06)",
                                padding: "2px 8px",
                                borderRadius: 4,
                              }}
                            >
                              <Layers size={11} />
                              {task.cluster.name}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div
                                style={{
                                  width: 26,
                                  height: 26,
                                  borderRadius: "50%",
                                  backgroundColor: "#F2F4F7",
                                  border: "1px solid #E4E7EC",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: "#17202A",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(task.assignedTo.name)}
                              </div>
                              <div>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#17202A" }}>
                                  {task.assignedTo.name}
                                </div>
                                {task.assignedTo.designation && (
                                  <div style={{ fontSize: 11, color: "#667085" }}>
                                    {task.assignedTo.designation}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                fontSize: 10.5,
                                fontWeight: 600,
                                fontFamily: "var(--font-mono)",
                                padding: "2px 7px",
                                borderRadius: 4,
                                backgroundColor: priorityStyle.bg,
                                color: priorityStyle.color,
                                border: `1px solid ${priorityStyle.border}`,
                              }}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <StatusBadge status={task.status} size="sm" />
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                fontSize: 12,
                                fontFamily: "var(--font-mono)",
                                color: isPastDeadline ? "#C0392B" : "#17202A",
                                fontWeight: isPastDeadline ? 600 : 400,
                              }}
                            >
                              <Calendar size={13} color={isPastDeadline ? "#C0392B" : "#667085"} />
                              <span>{formatDate(task.deadline)}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
