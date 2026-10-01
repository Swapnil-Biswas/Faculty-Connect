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
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* BMSIT High-Tech Header */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", borderRadius: 4, background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", color: "#38BDF8", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
            <span>●</span> DATA EXPORT HUB // COMPLIANCE ARCHIVE
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F8FAFC", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
            Academic Data & Compliance Records
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, fontFamily: "var(--font-mono)" }}>
            // Verified departmental exports for NBA, NAAC, NIRF & internal academic audits
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 6, background: "rgba(14, 18, 27, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E", display: "inline-block" }}></span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#E2E8F0" }}>CSV ENCODING UTF-8</span>
        </div>
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
