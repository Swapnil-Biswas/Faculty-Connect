import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ExportClient } from "./ExportClient";

export default async function HodExportPage() {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
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
    <div className="page-content">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Export Academic Data & Compliance Records</h1>
        <p className="page-subtitle">
          Export verified departmental data to CSV format for NBA, NAAC, NIRF, and internal academic audits.
        </p>
      </div>

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
            Reason: l.reason,
            DecidedBy: l.decidedBy?.name ?? "Pending",
          })),
          evaluations: evaluations.map((e: any) => ({
            EvaluationID: e.id,
            Faculty: e.faculty.name,
            FacultyEmail: e.faculty.email,
            Evaluator: e.evaluator.name,
            Period: e.period,
            QualityRating: e.quality,
            ContributionRating: e.contribution,
            InitiativeRating: e.initiative,
            OverallRating: e.overallRating,
            Remarks: e.remarks ?? "",
          })),
          clusters: clusters.map((c: any) => ({
            ClusterID: c.id,
            Name: c.name,
            Head: c.head?.name ?? "None",
            ActiveFacultyCount: c.members.length,
          })),
        }}
      />
    </div>
  );
}
