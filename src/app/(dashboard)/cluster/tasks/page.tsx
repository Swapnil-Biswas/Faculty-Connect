import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { formatDate, getInitials } from '@/lib/utils'
import { AssignTaskForm } from './AssignTaskForm'
import { DeleteTaskButton } from './DeleteTaskButton'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { CheckSquare, AlertTriangle, Plus, Clock, User } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: "Cluster Head // Task Dispatch" }

export default async function ClusterTasksPage() {
  const session = await auth()
  if (!session || !['CLUSTER_HEAD', 'HOD', 'ADMIN'].includes(session.user.role)) {
    redirect('/login')
  }

  const clusterId = session.user.clusterId
  if (!clusterId) {
    return (
      <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
        <PageHeader
          breadcrumbs={[
            { label: "Cluster Console", href: "/cluster" },
            { label: "Task Dispatch" },
          ]}
          title="Cluster Task Dispatch"
          subtitle="Assign, track, and supervise academic and operational deliverables for your cluster."
          dotMatrixText="TASKS"
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
            Contact the department HOD or Administrator to link your profile to an active academic cluster node.
          </p>
        </div>
      </div>
    )
  }

  const [tasks, members] = await Promise.all([
    db.task.findMany({
      where: { clusterId, deletedAt: null },
      include: { assignedTo: true, assignedBy: true },
      orderBy: [{ status: 'asc' }, { deadline: 'asc' }],
    }),
    db.clusterMembership.findMany({
      where: { clusterId, leftAt: null },
      include: { user: { select: { id: true, name: true, designation: true } } },
    }),
  ])

  const facultyList = members.map((m) => m.user)

  const counts = {
    total: tasks.length,
    open: tasks.filter((t) => t.status === "OPEN").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    overdue: tasks.filter((t) => t.status === "OVERDUE").length,
  }

  const PRIORITY_BADGES: Record<string, { label: string; color: string; bg: string }> = {
    LOW: { label: "LOW", color: "#667085", bg: "rgba(102, 112, 133, 0.08)" },
    MEDIUM: { label: "MEDIUM", color: "#2F6FED", bg: "rgba(47, 111, 237, 0.08)" },
    HIGH: { label: "HIGH", color: "#B7791F", bg: "rgba(183, 121, 31, 0.08)" },
    CRITICAL: { label: "CRITICAL", color: "#C0392B", bg: "rgba(192, 57, 43, 0.08)" },
  }

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 48 }}>
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "CLUSTER_CONSOLE", href: "/cluster" },
          { label: "TASK_DISPATCH" },
        ]}
        eyebrow="// WORKLOAD DISPATCH · TASK PIPELINE"
        dotMatrixText="TASKS"
        title="Cluster Deliverables & Task Dispatch"
        subtitle="Assign academic deliverables, monitor submission status, and manage cluster workload deadlines."
        actions={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 6,
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              color: "#17202A",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: counts.overdue > 0 ? "#C0392B" : "#198754",
              }}
            />
            {tasks.length} DELIVERABLES REGISTERED
          </div>
        }
      />

      {/* 2. Status Summary Counts Strip */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "ALL DELIVERABLES", count: counts.total, color: "#17202A", bg: "#F7F8FA", border: "#E4E7EC" },
          { label: "OPEN", count: counts.open, color: "#2F6FED", bg: "rgba(47, 111, 237, 0.08)", border: "rgba(47, 111, 237, 0.25)" },
          { label: "IN PROGRESS", count: counts.inProgress, color: "#173B67", bg: "rgba(23, 59, 103, 0.08)", border: "rgba(23, 59, 103, 0.25)" },
          { label: "COMPLETED", count: counts.completed, color: "#198754", bg: "rgba(25, 135, 84, 0.08)", border: "rgba(25, 135, 84, 0.25)" },
          { label: "OVERDUE", count: counts.overdue, color: "#C0392B", bg: "rgba(192, 57, 43, 0.08)", border: "rgba(192, 57, 43, 0.25)" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              backgroundColor: "#FFFFFF",
              border: `1px solid ${s.border}`,
              borderRadius: 6,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
            }}
          >
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 4,
                backgroundColor: s.bg,
                color: s.color,
                fontWeight: 700,
                fontSize: 11.5,
              }}
            >
              {s.count}
            </span>
            <span style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* 3. 2-Column Split: Dispatch Form on Left, Deliverables Ledger on Right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 1fr) minmax(420px, 1.5fr)",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* LEFT COLUMN: ASSIGN DELIVERABLE FORM */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: 24,
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              borderBottom: "1px solid #F2F4F7",
              paddingBottom: 14,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                backgroundColor: "#173B67",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <Plus size={16} />
            </div>
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
                // DIRECT DISPATCH
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: "2px 0 0" }}>
                Assign New Deliverable
              </h2>
            </div>
          </div>
          <AssignTaskForm faculty={facultyList} clusterId={clusterId} />
        </div>

        {/* RIGHT COLUMN: ACTIVE DELIVERABLES LEDGER */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
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
                // WORKLOAD OVERVIEW
              </span>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: "2px 0 0" }}>
                Cluster Deliverables Pipeline
              </h2>
            </div>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "#667085",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                borderRadius: 4,
                padding: "3px 8px",
              }}
            >
              {tasks.length} Assigned
            </span>
          </div>

          {tasks.length === 0 ? (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                borderRadius: 8,
                padding: 24,
              }}
            >
              <EmptyState
                icon={CheckSquare}
                title="No Tasks Assigned in This Cluster"
                description="Use the assignment form on the left to dispatch academic deliverables to cluster faculty."
              />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tasks.map((task) => {
                const isOverdue = task.status === "OVERDUE"
                const priorityInfo = PRIORITY_BADGES[task.priority] ?? PRIORITY_BADGES.MEDIUM

                return (
                  <div
                    key={task.id}
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E4E7EC",
                      borderRadius: 8,
                      padding: "16px 18px",
                      boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#17202A", marginBottom: 4 }}>
                          {task.title}
                        </div>
                        {task.description && (
                          <p style={{ fontSize: 12.5, color: "#667085", margin: "0 0 8px 0", lineHeight: 1.45 }}>
                            {task.description}
                          </p>
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            flexWrap: "wrap",
                            alignItems: "center",
                            fontSize: 12,
                            color: "#667085",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600, color: "#17202A" }}>
                            <User size={13} color="#667085" />
                            <span>{task.assignedTo.name}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Clock size={13} color={isOverdue ? "#C0392B" : "#667085"} />
                            <span style={{ color: isOverdue ? "#C0392B" : "#667085", fontWeight: isOverdue ? 600 : 400 }}>
                              Due {formatDate(task.deadline)}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: priorityInfo.color,
                              backgroundColor: priorityInfo.bg,
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {priorityInfo.label}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <StatusBadge status={task.status} size="sm" />
                        <DeleteTaskButton taskId={task.id} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
