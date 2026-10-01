import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ClusterManagerClient } from "./ClusterManagerClient";

export default async function AdminClustersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch all clusters with head and member counts
  const clusters = await db.cluster.findMany({
    include: {
      head: {
        select: { id: true, name: true, email: true, designation: true },
      },
      members: {
        where: { leftAt: null },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      tasks: {
        where: { deletedAt: null },
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Eligible users who can be appointed as Cluster Head
  const eligibleHeads = await db.user.findMany({
    where: {
      deletedAt: null,
      role: { in: ["FACULTY", "CLUSTER_HEAD"] },
    },
    select: { id: true, name: true, email: true, role: true, designation: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="page-content">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Cluster Management</h1>
        <p className="page-subtitle">
          Create clusters, appoint Cluster Heads, and view departmental grouping configurations.
        </p>
      </div>

      <ClusterManagerClient
        initialClusters={clusters.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          createdAt: c.createdAt.toISOString(),
          head: c.head ? { id: c.head.id, name: c.head.name, email: c.head.email } : null,
          memberCount: c.members.length,
          taskCount: c.tasks.length,
          completedTaskCount: c.tasks.filter((t) => t.status === "COMPLETED").length,
        }))}
        eligibleHeads={eligibleHeads}
      />
    </div>
  );
}
