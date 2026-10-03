import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Users,
  CheckSquare,
  Calendar,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Layers,
  Award,
  ShieldAlert,
} from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Department Overview — HOD Console" };

export default async function HodDashboard() {
  const session = await auth();
  if (!session || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const [
    clusters,
    totalFaculty,
    allTasks,
    pendingLeavesList,
    pendingLeavesCount,
    fotm,
  ] = await Promise.all([
    db.cluster.findMany({
      where: { deletedAt: null },
      include: {
        head: { select: { id: true, name: true, email: true, designation: true } },
        members: { where: { leftAt: null } },
        tasks: { where: { deletedAt: null }, select: { id: true, status: true } },
      },
      orderBy: { name: "asc" },
    }),
    db.user.count({ where: { role: { in: ["FACULTY", "CLUSTER_HEAD"] }, deletedAt: null } }),
    db.task.findMany({
      where: { deletedAt: null },
      include: {
        assignedTo: { select: { id: true, name: true, designation: true } },
        cluster: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.leaveApplication.findMany({
      where: { status: "PENDING" },
      include: {
        applicant: { select: { id: true, name: true, designation: true } },
        cluster: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.leaveApplication.count({ where: { status: "PENDING" } }),
    db.facultyOfMonth.findFirst({
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { faculty: true },
    }),
  ]);

  const totalTasksCount = await db.task.count({ where: { deletedAt: null } });
  const completedTasksCount = await db.task.count({ where: { status: "COMPLETED", deletedAt: null } });
  const overdueTasksCount = await db.task.count({ where: { status: "OVERDUE", deletedAt: null } });

  const completionRate =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div
      style={{
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        backgroundColor: "#F7F8FA",
        minHeight: "100%",
      }}
    >
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Department Overview" },
        ]}
        title="Department Management Console"
        subtitle="Institutional operations, cross-cluster deliverables, faculty leave governance, and compliance."
        showDotMatrix={false}
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link
              href="/hod/leave"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#17202A",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E4E7EC",
                borderRadius: 6,
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Calendar size={14} color="#667085" />
              <span>REVIEW LEAVES</span>
              {pendingLeavesCount > 0 && (
                <span
                  style={{
                    backgroundColor: "rgba(183, 121, 31, 0.15)",
                    color: "#B7791F",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 10,
                  }}
                >
                  {pendingLeavesCount}
                </span>
              )}
            </Link>

            <Link
              href="/hod/tasks"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: "#173B67",
                border: "1px solid #173B67",
                borderRadius: 6,
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
            >
              <Plus size={14} />
              <span>DISPATCH TASK</span>
            </Link>
          </div>
        }
      />

      {/* 2. Institutional Attention Banners */}
      {(pendingLeavesCount > 0 || overdueTasksCount > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {overdueTasksCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                backgroundColor: "rgba(192, 57, 43, 0.05)",
                border: "1px solid rgba(192, 57, 43, 0.25)",
                borderRadius: 6,
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldAlert size={18} color="#C0392B" />
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#C0392B" }}>
                    OVERDUE ESCALATION:
                  </span>{" "}
                  <span style={{ fontSize: 13, color: "#17202A" }}>
                    There {overdueTasksCount === 1 ? "is 1 overdue deliverable" : `are ${overdueTasksCount} overdue deliverables`} across department clusters requiring intervention.
                  </span>
                </div>
              </div>
              <Link
                href="/hod/tasks?status=OVERDUE"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#C0392B",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                <span>OPEN OVERDUE MATRIX</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {pendingLeavesCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 18px",
                backgroundColor: "rgba(183, 121, 31, 0.05)",
                border: "1px solid rgba(183, 121, 31, 0.25)",
                borderRadius: 6,
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Clock size={18} color="#B7791F" />
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#B7791F" }}>
                    PENDING APPROVAL:
                  </span>{" "}
                  <span style={{ fontSize: 13, color: "#17202A" }}>
                    {pendingLeavesCount} faculty leave {pendingLeavesCount === 1 ? "application is" : "applications are"} awaiting executive review.
                  </span>
                </div>
              </div>
              <Link
                href="/hod/leave?status=PENDING"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#B7791F",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                }}
              >
                <span>REVIEW PIPELINE</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 3. Executive MetricBlock Row (Clean, Restrained, No Duplicates) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="ACTIVE FACULTY"
          value={totalFaculty}
          context={`${clusters.length} Academic Clusters`}
          trendType="neutral"
          icon={<Users size={16} />}
        />

        <MetricBlock
          label="DEPARTMENT DELIVERABLES"
          value={totalTasksCount}
          context={`${completedTasksCount} completed (${completionRate}%)`}
          trendType="positive"
          icon={<CheckSquare size={16} />}
        />

        <MetricBlock
          label="PENDING DECISIONS"
          value={pendingLeavesCount}
          context={pendingLeavesCount > 0 ? "Requires review" : "Queue clear"}
          trendType={pendingLeavesCount > 0 ? "warning" : "positive"}
          icon={<Clock size={16} />}
        />

        <MetricBlock
          label="ACADEMIC CLUSTERS"
          value={clusters.length}
          context="100% Units Operational"
          trendType="neutral"
          icon={<Layers size={16} />}
        />
      </div>

      {/* 4. Two-Column Executive Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Left Column: Academic Clusters Oversight + Pending Decisions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Active Academic Clusters Overview */}
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
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#17202A", margin: 0 }}>
                  Academic Clusters Topology
                </h2>
                <span style={{ fontSize: 12, color: "#667085" }}>
                  Operational leadership and deliverable progress by unit
                </span>
              </div>
              <Link
                href="/hod/clusters"
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
                <span>All Clusters</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F8FAFC" }}>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#667085",
                      }}
                    >
                      CLUSTER
                    </th>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#667085",
                      }}
                    >
                      HEAD
                    </th>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#667085",
                      }}
                    >
                      MEMBERS
                    </th>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#667085",
                      }}
                    >
                      PROGRESS
                    </th>
                    <th
                      style={{
                        padding: "10px 16px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#667085",
                        textAlign: "right",
                      }}
                    >
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clusters.map((c) => {
                    const completed = c.tasks.filter((t: any) => t.status === "COMPLETED").length;
                    const pct = c.tasks.length > 0 ? Math.round((completed / c.tasks.length) * 100) : 0;

                    return (
                      <tr
                        key={c.id}
                        style={{ borderBottom: "1px solid #F2F4F7", transition: "background-color 0.15s ease" }}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#17202A" }}>
                            {c.name}
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontSize: 12.5, color: "#17202A" }}>
                            {c.head?.name ?? (
                              <span style={{ color: "#98A2B3", fontStyle: "italic" }}>Unassigned</span>
                            )}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontSize: 12.5,
                              color: "#667085",
                            }}
                          >
                            {c.members.length} faculty
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", minWidth: 140 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                flex: 1,
                                height: 5,
                                backgroundColor: "#F2F4F7",
                                borderRadius: 3,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: "100%",
                                  backgroundColor: "#173B67",
                                  borderRadius: 3,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 11.5, color: "#667085", minWidth: 32 }}>
                              {pct}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <Link
                            href={`/hod/tasks?cluster=${c.id}`}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#173B67",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <span>Tasks</span>
                            <ArrowRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Decisions Section */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: 8,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#17202A", margin: 0 }}>
                  Pending Executive Decisions
                </h2>
                <span style={{ fontSize: 12, color: "#667085" }}>
                  Awaiting HOD approval or recommendation
                </span>
              </div>
              <Link
                href="/hod/leave?status=PENDING"
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
                <span>Full Queue</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {pendingLeavesList.length === 0 ? (
              <div style={{ padding: "24px 12px" }}>
                <EmptyState
                  title="Queue Clear"
                  description="No pending requests currently require HOD executive action."
                  icon={Clock}
                />
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pendingLeavesList.map((l) => (
                  <div
                    key={l.id}
                    style={{
                      padding: "12px 14px",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E4E7EC",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}>
                        {l.applicant.name}
                        {l.applicant.designation && (
                          <span style={{ fontSize: 11.5, color: "#667085", fontWeight: 400 }}>
                            {" "}· {l.applicant.designation}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#667085",
                          marginTop: 2,
                        }}
                      >
                        {l.cluster.name} · {formatDate(l.startDate)} → {formatDate(l.endDate)}
                      </div>
                    </div>

                    <Link
                      href="/hod/leave?status=PENDING"
                      style={{
                        padding: "5px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#173B67",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E4E7EC",
                        borderRadius: 4,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity & Recognition Spotlight */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Recent Department Activity Table */}
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
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#17202A", margin: 0 }}>
                  Recent Deliverables Activity
                </h2>
                <span style={{ fontSize: 12, color: "#667085" }}>
                  Dispatched and progressing tasks
                </span>
              </div>
              <Link
                href="/hod/tasks"
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
                <span>All Tasks</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {allTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: "12px 18px",
                    borderBottom: "1px solid #F2F4F7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
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
                      {t.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#667085", marginTop: 2 }}>
                      {t.assignedTo.name} · {t.cluster.name}
                    </div>
                  </div>

                  <StatusBadge status={t.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Recognition Spotlight */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: 8,
              padding: 20,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: "rgba(183, 121, 31, 0.1)",
                  color: "#B7791F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Award size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#17202A", margin: 0 }}>
                  Recognition Spotlight
                </h3>
                <span style={{ fontSize: 12, color: "#667085" }}>
                  Monthly faculty merit spotlight
                </span>
              </div>
            </div>

            {fotm ? (
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E4E7EC",
                  borderRadius: 6,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#173B67",
                    color: "#FFFFFF",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(fotm.faculty.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#B7791F", textTransform: "uppercase" }}>
                    {MONTH_NAMES[fotm.month - 1]} {fotm.year} HONOREE
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#17202A" }}>
                    {fotm.faculty.name}
                  </div>
                  {fotm.faculty.designation && (
                    <div style={{ fontSize: 12, color: "#667085" }}>
                      {fotm.faculty.designation}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#667085", lineHeight: 1.5 }}>
                Current month faculty recognition selection is on standby.
              </div>
            )}

            <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
              <Link
                href="/hod/faculty-of-month"
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
                <span>Faculty of Month Console</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}