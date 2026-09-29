import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import { Users, CheckSquare, Calendar, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cluster Dashboard" };

export default async function ClusterDashboard() {
  const session = await auth();
  if (!session || !["CLUSTER_HEAD", "HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const clusterId = session.user.clusterId;
  if (!clusterId) {
    return (
      <div className="empty-state">
        <AlertTriangle size={40} />
        <div className="empty-state-title">No cluster assigned</div>
        <div className="empty-state-desc">Contact Admin to assign you to a cluster.</div>
      </div>
    );
  }

  const [cluster, pendingLeaves, clusterTasks, members] = await Promise.all([
    db.cluster.findUnique({
      where: { id: clusterId },
      include: { members: { include: { user: true } } },
    }),
    db.leaveApplication.findMany({
      where: { clusterId, status: "PENDING" },
      include: { applicant: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.task.findMany({
      where: { clusterId, deletedAt: null },
      include: { assignedTo: true },
      orderBy: { deadline: "asc" },
      take: 6,
    }),
    db.clusterMembership.findMany({
      where: { clusterId, leftAt: null },
      include: { user: true },
    }),
  ]);

  const totalMembers = members.length;
  const openTasks = clusterTasks.filter((t) => ["OPEN", "IN_PROGRESS"].includes(t.status)).length;
  const overdueTasks = clusterTasks.filter((t) => t.status === "OVERDUE").length;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">
          <span className="text-gradient">{cluster?.name ?? "Cluster"}</span> Dashboard
        </h2>
        <p className="page-subtitle">
          Manage your cluster's tasks, leaves, and team performance.
        </p>
      </div>

      {/* Stats */}
      <div className="grid-4 fade-in" style={{ marginBottom: 28 }}>
        <StatCard label="Faculty Members" value={totalMembers} icon={<Users size={20} />}
          iconBg="hsl(192 91% 50% / 0.12)" />
        <StatCard label="Active Tasks" value={openTasks} icon={<CheckSquare size={20} />}
          iconBg="hsl(258 90% 66% / 0.12)" />
        <StatCard label="Overdue Tasks" value={overdueTasks} icon={<AlertTriangle size={20} />}
          iconBg="hsl(0 84% 60% / 0.12)" />
        <StatCard label="Pending Leaves" value={pendingLeaves.length} icon={<Calendar size={20} />}
          iconBg="hsl(38 92% 50% / 0.12)" />
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        {/* Pending Leave Requests */}
        <div className="card fade-in fade-in-delay-1">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Pending Leave Requests</h3>
            <a href="/cluster/leave" className="btn-gradient" style={{ padding: "6px 14px", fontSize: 12 }}>
              Review all
            </a>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px" }}>
              <Calendar size={36} className="empty-state-icon" />
              <div className="empty-state-title">No pending requests</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingLeaves.map((leave) => (
                <div key={leave.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 14px", background: "hsl(var(--bg-subtle))", borderRadius: 10,
                }}>
                  <div className="avatar avatar-sm">
                    {getInitials(leave.applicant.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "hsl(var(--text-primary))" }}>
                      {leave.applicant.name}
                    </div>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>
                      {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <a
                      href={`/cluster/leave/${leave.id}?action=approve`}
                      className="btn-gradient"
                      style={{ padding: "5px 12px", fontSize: 11 }}
                    >
                      Approve
                    </a>
                    <a
                      href={`/cluster/leave/${leave.id}?action=reject`}
                      className="btn-outline"
                      style={{ padding: "5px 12px", fontSize: 11 }}
                    >
                      Reject
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task overview */}
        <div className="card fade-in fade-in-delay-2">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>Task Overview</h3>
            <a href="/cluster/tasks" className="btn-outline" style={{ padding: "6px 14px", fontSize: 12 }}>
              View all
            </a>
          </div>

          {clusterTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px" }}>
              <CheckSquare size={36} className="empty-state-icon" />
              <div className="empty-state-title">No tasks yet</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {clusterTasks.map((task) => (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", background: "hsl(var(--bg-subtle))", borderRadius: 8,
                }}>
                  <div className="avatar avatar-sm" style={{ width: 28, height: 28, fontSize: 10 }}>
                    {getInitials(task.assignedTo.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {task.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: "hsl(var(--text-muted))", display: "flex", gap: 6, marginTop: 1 }}>
                      <Clock size={11} /> {formatDate(task.deadline)} · {task.assignedTo.name.split(" ")[0]}
                    </div>
                  </div>
                  <span className={`status-badge status-${task.status.toLowerCase().replace("_", "-")}`}
                    style={{ fontSize: 10.5, padding: "2px 8px" }}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Faculty Roster */}
      <div className="card fade-in" style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 className="section-title" style={{ margin: 0 }}>Faculty Roster</h3>
          <a href="/cluster/roster" className="btn-outline" style={{ padding: "6px 14px", fontSize: 12 }}>
            Full roster
          </a>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Designation</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "hsl(var(--text-muted))", padding: 32 }}>
                    No members in this cluster yet.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.userId}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar avatar-sm">{getInitials(m.user.name)}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.user.name}</div>
                          <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>{m.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "hsl(var(--text-secondary))", fontSize: 13 }}>
                      {m.user.designation ?? "—"}
                    </td>
                    <td style={{ color: "hsl(var(--text-muted))", fontSize: 13 }}>
                      {formatDate(m.joinedAt)}
                    </td>
                    <td>
                      <a href={`/cluster/roster/${m.userId}`} className="btn-outline"
                        style={{ padding: "5px 12px", fontSize: 12 }}>
                        View Profile
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}