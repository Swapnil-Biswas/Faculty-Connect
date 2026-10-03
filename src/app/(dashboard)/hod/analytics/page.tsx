import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Users,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Department Analytics — HOD Console",
};

export default async function HodAnalyticsPage() {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  // Get department wide data
  const [clusters, allTasks, allLeaves, allPoints] = await Promise.all([
    db.cluster.findMany({
      include: {
        members: { where: { leftAt: null } },
        tasks: { where: { deletedAt: null } },
      },
    }),
    db.task.findMany({ where: { deletedAt: null } }),
    db.leaveApplication.findMany(),
    db.pointsLedger.findMany({ select: { amount: true, source: true } }),
  ]);

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t: any) => t.status === "COMPLETED").length;
  const overdueTasks = allTasks.filter((t: any) => t.status === "OVERDUE").length;
  const inProgressTasks = allTasks.filter((t: any) => t.status === "IN_PROGRESS" || t.status === "OPEN").length;

  const onTimeCompleted = allTasks.filter(
    (t: any) => t.status === "COMPLETED" && t.completedAt && t.completedAt <= t.deadline
  ).length;

  const onTimeRate = completedTasks > 0 ? Math.round((onTimeCompleted / completedTasks) * 100) : 100;
  const deptCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalApprovedLeaves = allLeaves.filter((l: any) => l.status === "APPROVED").length;
  const totalPendingLeaves = allLeaves.filter((l: any) => l.status === "PENDING").length;

  const totalStarsDistributed = allPoints.reduce((sum: number, p: any) => sum + p.amount, 0);

  // Cross-cluster comparison stats
  const clusterStats = clusters.map((c: any) => {
    const tasks = c.tasks;
    const completed = tasks.filter((t: any) => t.status === "COMPLETED").length;
    const overdue = tasks.filter((t: any) => t.status === "OVERDUE").length;
    const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    return {
      id: c.id,
      name: c.name,
      facultyCount: c.members.length,
      taskCount: tasks.length,
      completed,
      overdue,
      completionRate: rate,
    };
  });

  const totalFacultyCount = clusters.reduce((acc: number, c: any) => acc + c.members.length, 0);

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
          { label: "Department Analytics" },
        ]}
        title="Department Analytics"
        subtitle="Cross-cluster deliverable velocity, operational equilibrium, workload distribution, and compliance readiness."
        showDotMatrix={false}
      />

      {/* 2. Department Operational Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {/* Total Deliverables */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#667085" }}>
              TOTAL DELIVERABLES
            </span>
            <CheckSquare size={16} color="#667085" />
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#17202A", lineHeight: 1.2 }}>
              {totalTasks}
            </div>
            <div style={{ fontSize: 12, color: "#667085", marginTop: 4 }}>
              {completedTasks} resolved · {inProgressTasks} in progress
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#667085" }}>
              COMPLETION RATE
            </span>
            <TrendingUp size={16} color={deptCompletionRate >= 70 ? "#198754" : "#2F6FED"} />
          </div>
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: deptCompletionRate >= 70 ? "#198754" : "#17202A",
                lineHeight: 1.2,
              }}
            >
              {deptCompletionRate}%
            </div>
            <div style={{ fontSize: 12, color: "#667085", marginTop: 4 }}>
              {completedTasks} of {totalTasks} tasks resolved
            </div>
          </div>
        </div>

        {/* On-Time Velocity */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#667085" }}>
              ON-TIME RATE
            </span>
            <Clock size={16} color={onTimeRate >= 80 ? "#198754" : "#B7791F"} />
          </div>
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: onTimeRate >= 80 ? "#198754" : "#B7791F",
                lineHeight: 1.2,
              }}
            >
              {onTimeRate}%
            </div>
            <div style={{ fontSize: 12, color: "#667085", marginTop: 4 }}>
              {onTimeCompleted} deliverables met scheduled deadline
            </div>
          </div>
        </div>

        {/* Overdue Deliverables */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: overdueTasks > 0 ? "#C0392B" : "#667085" }}>
              OVERDUE DELIVERABLES
            </span>
            <AlertTriangle size={16} color={overdueTasks > 0 ? "#C0392B" : "#667085"} />
          </div>
          <div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: overdueTasks > 0 ? "#C0392B" : "#17202A",
                lineHeight: 1.2,
              }}
            >
              {overdueTasks}
            </div>
            <div style={{ fontSize: 12, color: overdueTasks > 0 ? "#C0392B" : "#667085", marginTop: 4 }}>
              {overdueTasks > 0 ? "Requires administrative escalation" : "No overdue escalations recorded"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cross-Cluster Performance Table */}
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
            padding: "16px 20px",
            borderBottom: "1px solid #E4E7EC",
            backgroundColor: "#FFFFFF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: 0 }}>
              Cross-Cluster Operational Velocity
            </h2>
            <p style={{ fontSize: 13, color: "#667085", margin: "2px 0 0 0" }}>
              Comparative deliverable volume, completion counts, and execution progress across academic clusters.
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "4px 10px",
              backgroundColor: "#F2F4F7",
              color: "#17202A",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
            }}
          >
            {clusters.length} Academic Clusters
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F7F8FA" }}>
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
                  FACULTY
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                  }}
                >
                  DELIVERABLES
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                  }}
                >
                  COMPLETED
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                  }}
                >
                  OVERDUE
                </th>
                <th
                  style={{
                    padding: "10px 16px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                    minWidth: 180,
                  }}
                >
                  COMPLETION VELOCITY
                </th>
              </tr>
            </thead>
            <tbody>
              {clusterStats.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#667085", padding: "40px 16px", fontSize: 13 }}>
                    No academic clusters configured in department.
                  </td>
                </tr>
              ) : (
                clusterStats.map((c: any) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: "1px solid #F2F4F7",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: "#17202A", fontSize: 13.5 }}>
                      {c.name}
                    </td>
                    <td style={{ padding: "14px 16px", color: "#667085", fontSize: 13 }}>
                      {c.facultyCount} faculty
                    </td>
                    <td style={{ padding: "14px 16px", color: "#17202A", fontSize: 13 }}>
                      {c.taskCount} tasks
                    </td>
                    <td style={{ padding: "14px 16px", color: "#198754", fontWeight: 600, fontSize: 13 }}>
                      {c.completed}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13 }}>
                      {c.overdue > 0 ? (
                        <span style={{ color: "#C0392B", fontWeight: 600 }}>{c.overdue}</span>
                      ) : (
                        <span style={{ color: "#667085" }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            flex: 1,
                            height: 6,
                            backgroundColor: "#E4E7EC",
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${c.completionRate}%`,
                              height: "100%",
                              backgroundColor: c.completionRate >= 70 ? "#173B67" : "#2F6FED",
                              borderRadius: 4,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: "#17202A",
                            minWidth: 36,
                            textAlign: "right",
                          }}
                        >
                          {c.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Workload State & Compliance Verification */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 20,
        }}
      >
        {/* Workload / Operational Equilibrium */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: "0 0 4px 0" }}>
              Workload & Operational Equilibrium
            </h2>
            <p style={{ fontSize: 13, color: "#667085", margin: "0 0 18px 0" }}>
              Current department operational indicators, resolution health, and leave status.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E4E7EC",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 13, color: "#667085" }}>Active Tasks In Progress</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#17202A" }}>
                  {inProgressTasks} tasks
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E4E7EC",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 13, color: "#667085" }}>On-Time Resolution Health</span>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: onTimeRate >= 80 ? "#198754" : "#B7791F",
                  }}
                >
                  {onTimeRate}% ({onTimeCompleted} of {completedTasks || 1})
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E4E7EC",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 13, color: "#667085" }}>Overdue Escalation Ratio</span>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: overdueTasks > 0 ? "#C0392B" : "#17202A",
                  }}
                >
                  {totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0}% ({overdueTasks} tasks)
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E4E7EC",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 13, color: "#667085" }}>Faculty Leave Review Status</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: totalPendingLeaves > 0 ? "#B7791F" : "#198754" }}>
                  {totalPendingLeaves > 0 ? `${totalPendingLeaves} pending review` : `${totalApprovedLeaves} approved / current`}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid #E4E7EC",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#667085",
            }}
          >
            <span>Total Recognition Awarded</span>
            <span style={{ fontWeight: 600, color: "#17202A" }}>
              {Math.round(totalStarsDistributed)} Stars Distributed
            </span>
          </div>
        </div>

        {/* Accreditation & Compliance Readiness */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: "20px 22px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ShieldCheck size={18} color="#173B67" />
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: 0 }}>
                Accreditation & Compliance Verification
              </h2>
            </div>
            <p style={{ fontSize: 13, color: "#667085", margin: "0 0 18px 0" }}>
              Departmental compliance records are aggregated in real time for NBA Tier-I / Tier-II and NAAC institutional self-study reports.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E4E7EC",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 13, color: "#667085" }}>Criterion 5 Faculty Cadre Matrix</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 4,
                    backgroundColor: "rgba(25, 135, 84, 0.1)",
                    color: "#198754",
                    border: "1px solid rgba(25, 135, 84, 0.2)",
                  }}
                >
                  Verified Active
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E4E7EC",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 13, color: "#667085" }}>Active Faculty In Roster</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#17202A" }}>
                  {totalFacultyCount} Faculty Members
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E4E7EC",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 13, color: "#667085" }}>Audited Institutional Tasks</span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "#17202A" }}>
                  {totalTasks} Deliverables Tracked
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E4E7EC",
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 13, color: "#667085" }}>SSR Dossier & Form 5A Status</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 4,
                    backgroundColor: "rgba(47, 111, 237, 0.1)",
                    color: "#2F6FED",
                    border: "1px solid rgba(47, 111, 237, 0.2)",
                  }}
                >
                  Ready for Export
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <Link
              href="/hod/accreditation"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "9px 16px",
                fontSize: 13,
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: "#173B67",
                borderRadius: 6,
                textDecoration: "none",
                transition: "background-color 0.15s ease",
              }}
            >
              <span>Open Criterion 5 SSR Dossier</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
