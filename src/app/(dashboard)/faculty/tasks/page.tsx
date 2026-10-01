import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { UpdateTaskStatusForm } from "./UpdateTaskStatusForm";
import { CheckSquare, Clock, AlertTriangle, User } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Faculty Workspace — Tasks" };

const PRIORITY_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  LOW: { label: "Low", color: "#667085", bg: "#F2F4F7" },
  MEDIUM: { label: "Medium", color: "#2F6FED", bg: "#EFF6FF" },
  HIGH: { label: "High", color: "#B7791F", bg: "#FEFCE8" },
  CRITICAL: { label: "Critical", color: "#C0392B", bg: "#FEF2F2" },
};

export default async function FacultyTasksPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;

  const tasks = await db.task.findMany({
    where: { assignedToId: userId, deletedAt: null },
    include: { assignedBy: true },
    orderBy: [{ status: "asc" }, { deadline: "asc" }],
  });

  const counts = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === "OPEN").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    overdue: tasks.filter((t) => t.status === "OVERDUE").length,
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Faculty Workspace", href: "/faculty" },
          { label: "Tasks" },
        ]}
        title="Assigned Academic Tasks"
        subtitle="Operational ledger of teaching, departmental compliance, and committee responsibilities assigned to you."
      />

      {/* 2. Status Summary Counts Strip */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "All Tasks", count: counts.total, color: "#17202A", bg: "#FFFFFF" },
          { label: "Open", count: counts.open, color: "#2F6FED", bg: "#EFF6FF" },
          { label: "In Progress", count: counts.inProgress, color: "#2F6FED", bg: "#EFF6FF" },
          { label: "Completed", count: counts.completed, color: "#198754", bg: "#F0FDF4" },
          { label: "Overdue", count: counts.overdue, color: "#C0392B", bg: "#FEF2F2" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: "#17202A",
            }}
          >
            <span
              style={{
                padding: "1px 7px",
                borderRadius: 4,
                backgroundColor: s.bg,
                color: s.color,
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {s.count}
            </span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* 3. Task Table */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks assigned"
          description="You currently have no tasks allocated. When administrative or academic tasks are assigned, they will be listed here with deadlines."
        />
      ) : (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: 13.5,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#F7F8FA",
                    borderBottom: "1px solid #E4E7EC",
                    color: "#667085",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <th style={{ padding: "12px 18px", width: "35%" }}>Task & Details</th>
                  <th style={{ padding: "12px 16px" }}>Assigned By</th>
                  <th style={{ padding: "12px 16px" }}>Deadline</th>
                  <th style={{ padding: "12px 16px" }}>Priority</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 18px", textAlign: "right" }}>Update Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => {
                  const priority = PRIORITY_BADGES[task.priority] ?? PRIORITY_BADGES.MEDIUM;
                  const isOverdue = task.status === "OVERDUE";

                  return (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom: idx < tasks.length - 1 ? "1px solid #F2F4F7" : "none",
                        backgroundColor: isOverdue ? "#FFFBFB" : "#FFFFFF",
                      }}
                    >
                      {/* Title & Description */}
                      <td style={{ padding: "14px 18px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "#17202A", marginBottom: 3 }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div
                            style={{
                              fontSize: 12.5,
                              color: "#667085",
                              lineHeight: 1.4,
                              maxWidth: 420,
                            }}
                          >
                            {task.description}
                          </div>
                        )}
                      </td>

                      {/* Assigned By */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", color: "#17202A" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                          <User size={13} color="#667085" />
                          <span>{task.assignedBy?.name ?? "Department"}</span>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 13,
                            color: isOverdue ? "#C0392B" : "#17202A",
                            fontWeight: isOverdue ? 600 : 400,
                          }}
                        >
                          {isOverdue ? <AlertTriangle size={13} /> : <Clock size={13} color="#667085" />}
                          <span>{formatDate(task.deadline)}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            color: priority.color,
                            backgroundColor: priority.bg,
                          }}
                        >
                          {priority.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                        <StatusBadge status={task.status} size="md" />
                      </td>

                      {/* Action */}
                      <td style={{ padding: "14px 18px", verticalAlign: "top", textAlign: "right" }}>
                        <UpdateTaskStatusForm taskId={task.id} currentStatus={task.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
