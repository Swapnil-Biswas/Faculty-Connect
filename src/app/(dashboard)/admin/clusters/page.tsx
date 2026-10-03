import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ClusterManagerClient } from "./ClusterManagerClient";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Academic Clusters — Admin | Faculty Connect" };

export default async function AdminClustersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all clusters with head, members, and tasks
  const clusters = await db.cluster.findMany({
    where: { deletedAt: null },
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
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Academic Clusters" },
        ]}
        title="Academic Clusters"
        subtitle="Configure departmental cluster topology, assign academic leadership, and monitor operational progress."
      />

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
