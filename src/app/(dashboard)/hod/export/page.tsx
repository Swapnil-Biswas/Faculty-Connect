import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ExportClient } from "./ExportClient";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Export — HOD Console",
};

export default async function HodExportPage() {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  // Fetch exportable records
  const [faculty, tasks, leaves, evaluations, clusters] = await Promise.all([
    db.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        createdAt: true,
      },
    }),
    db.task.findMany({
      where: { deletedAt: null },
      include: {
        assignedTo: { select: { name: true, email: true } },
        assignedBy: { select: { name: true } },
        cluster: { select: { name: true } },
      },
    }),
    db.leaveApplication.findMany({
      include: {
        applicant: { select: { name: true, email: true } },
        cluster: { select: { name: true } },
        decidedBy: { select: { name: true } },
      },
    }),
    db.evaluation.findMany({
      include: {
        evaluator: { select: { name: true } },
        faculty: { select: { name: true, email: true } },
      },
    }),
    db.cluster.findMany({
      include: {
        head: { select: { name: true } },
        members: { where: { leftAt: null } },
      },
    }),
  ]);

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
          { label: "HOD_CONSOLE", href: "/hod" },
          { label: "DATA_EXPORT" },
        ]}
        title="Data Export"
        subtitle="Export verified departmental datasets for institutional governance, NBA/NAAC compliance, and administrative audits."
        showDotMatrix={false}
      />

      {/* 2. Export Client Ledger */}
      <ExportClient
        data={{
          faculty: faculty.map((f: any) => ({
            ID: f.id,
            Name: f.name,
            Email: f.email,
            Role: f.role,
            Designation: f.designation ?? "",
            JoinedDate: f.createdAt.toISOString().split("T")[0],
          })),
          tasks: tasks.map((t: any) => ({
            TaskID: t.id,
            Title: t.title,
            AssignedTo: t.assignedTo.name,
            AssignedToEmail: t.assignedTo.email,
            AssignedBy: t.assignedBy.name,
            Cluster: t.cluster.name,
            Priority: t.priority,
            Status: t.status,
            Deadline: t.deadline.toISOString().split("T")[0],
            CompletedAt: t.completedAt ? t.completedAt.toISOString().split("T")[0] : "",
          })),
          leaves: leaves.map((l: any) => ({
            LeaveID: l.id,
            FacultyName: l.applicant.name,
            FacultyEmail: l.applicant.email,
            Cluster: l.cluster.name,
            StartDate: l.startDate.toISOString().split("T")[0],
            EndDate: l.endDate.toISOString().split("T")[0],
            Status: l.status,
            DecidedBy: l.decidedBy?.name ?? "",
          })),
          evaluations: evaluations.map((e: any) => ({
            EvaluationID: e.id,
            FacultyName: e.faculty.name,
            Evaluator: e.evaluator.name,
            Quality: e.quality,
            Contribution: e.contribution,
            Initiative: e.initiative,
            OverallRating: e.overallRating,
            CreatedAt: e.createdAt.toISOString().split("T")[0],
          })),
          clusters: clusters.map((c: any) => ({
            ClusterID: c.id,
            ClusterName: c.name,
            Head: c.head?.name ?? "UNASSIGNED",
            FacultyMembersCount: c.members.length,
          })),
        }}
      />
    </div>
  );
}
