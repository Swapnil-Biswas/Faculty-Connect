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

export const metadata: Metadata = { title: "Faculty Console // Tasks" };

const PRIORITY_BADGES: Record<string, { label: string; color: string; bg: string; glyph: string }> = {
  LOW: { label: "LOW", color: "#94A3B8", bg: "rgba(100, 116, 139, 0.12)", glyph: "◆" },
  MEDIUM: { label: "MEDIUM", color: "#38BDF8", bg: "rgba(14, 165, 233, 0.12)", glyph: "●" },
  HIGH: { label: "HIGH", color: "#FCD34D", bg: "rgba(245, 158, 11, 0.12)", glyph: "▲" },
  CRITICAL: { label: "CRITICAL", color: "#FB7185", bg: "rgba(244, 63, 94, 0.12)", glyph: "▲" },
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
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "FACULTY_CONSOLE", href: "/faculty" },
          { label: "TASKS_MATRIX" },
        ]}
        title="Assigned Academic Tasks & Deliverables"
        subtitle="Operational ledger of teaching, departmental compliance, and committee responsibilities assigned to your node."
      />

      {/* 2. Cyber Status Summary Counts Strip */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "ALL TASKS", count: counts.total, color: "#F8FAFC", bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.15)" },
          { label: "OPEN", count: counts.open, color: "#38BDF8", bg: "rgba(14, 165, 233, 0.1)", border: "rgba(14, 165, 233, 0.3)" },
          { label: "IN PROGRESS", count: counts.inProgress, color: "#818CF8", bg: "rgba(129, 140, 248, 0.1)", border: "rgba(129, 140, 248, 0.3)" },
          { label: "COMPLETED", count: counts.completed, color: "#4ADE80", bg: "rgba(34, 197, 94, 0.1)", border: "rgba(34, 197, 94, 0.3)" },
          { label: "OVERDUE", count: counts.overdue, color: "#FB7185", bg: "rgba(244, 63, 94, 0.1)", border: "rgba(244, 63, 94, 0.35)" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              backgroundColor: "#0E121B",
              border: `1px solid ${s.border}`,
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              color: "#94A3B8",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
            }}
          >
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                backgroundColor: s.bg,
                color: s.color,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              {s.count}
            </span>
            <span style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* 3. Cyber Task Table */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="NO TASKS ASSIGNED"
          description="You currently have no tasks allocated. When administrative or academic tasks are assigned, they will be listed here with deadlines."
        />
      ) : (
        <div className="tech-card" style={{ padding: 0, overflow: "hidden" }}>
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
                    backgroundColor: "rgba(7, 9, 14, 0.7)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#64748B",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  <th style={{ padding: "14px 22px", width: "38%" }}>Deliverable & Scope</th>
                  <th style={{ padding: "14px 18px" }}>Assigned By</th>
                  <th style={{ padding: "14px 18px" }}>Deadline</th>
                  <th style={{ padding: "14px 18px" }}>Priority</th>
                  <th style={{ padding: "14px 18px" }}>Status</th>
                  <th style={{ padding: "14px 22px", textAlign: "right" }}>Update Action</th>
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
                        borderBottom: idx < tasks.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                        backgroundColor: isOverdue ? "rgba(244, 63, 94, 0.04)" : "transparent",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isOverdue ? "rgba(244, 63, 94, 0.08)" : "rgba(255, 255, 255, 0.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isOverdue ? "rgba(244, 63, 94, 0.04)" : "transparent";
                      }}
                    >
                      {/* Title & Description */}
                      <td style={{ padding: "16px 22px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "#F8FAFC", marginBottom: 4 }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div
                            style={{
                              fontSize: 12.5,
                              color: "#94A3B8",
                              lineHeight: 1.45,
                              maxWidth: 440,
                            }}
                          >
                            {task.description}
                          </div>
                        )}
                      </td>

                      {/* Assigned By */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontFamily: "var(--font-mono)", color: "#E2E8F0" }}>
                          <User size={13} color="#64748B" />
                          <span>{task.assignedBy?.name ?? "DEPARTMENT"}</span>
                        </div>
                      </td>

                      {/* Deadline */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12.5,
                            fontFamily: "var(--font-mono)",
                            color: isOverdue ? "#FB7185" : "#94A3B8",
                            fontWeight: isOverdue ? 700 : 500,
                          }}
                        >
                          {isOverdue ? <AlertTriangle size={13} /> : <Clock size={13} color="#64748B" />}
                          <span>{formatDate(task.deadline)}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            color: priority.color,
                            backgroundColor: priority.bg,
                            border: `1px solid ${priority.color}33`,
                          }}
                        >
                          <span>{priority.glyph}</span>
                          <span>{priority.label}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                        <StatusBadge status={task.status} size="md" />
                      </td>

                      {/* Action */}
                      <td style={{ padding: "16px 22px", verticalAlign: "top", textAlign: "right" }}>
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
