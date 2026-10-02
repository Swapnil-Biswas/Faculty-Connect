import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AccreditationClient } from "./AccreditationClient";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function HodAccreditationPage() {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const [faculty, publications, tasks, evaluations] = await Promise.all([
    db.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        role: true,
        createdAt: true,
      },
    }),
    db.publication.findMany({
      where: { deletedAt: null },
      select: { id: true, title: true, type: true, year: true, doi: true, authorId: true },
    }),
    db.task.findMany({
      where: { deletedAt: null },
      select: { id: true, status: true },
    }),
    db.evaluation.findMany({
      select: { quality: true, contribution: true, initiative: true, overallRating: true },
    }),
  ]);

  const totalFaculty = faculty.length;

  const professors = faculty.filter((f) =>
    f.designation?.toLowerCase().includes("professor") &&
    !f.designation?.toLowerCase().includes("assistant") &&
    !f.designation?.toLowerCase().includes("associate")
  ).length;

  const associateProfessors = faculty.filter((f) =>
    f.designation?.toLowerCase().includes("associate")
  ).length;

  const assistantProfessors = faculty.filter((f) =>
    f.designation?.toLowerCase().includes("assistant") ||
    f.designation?.toLowerCase().includes("lecturer") ||
    (!f.designation?.toLowerCase().includes("associate") && !f.designation?.toLowerCase().includes("professor"))
  ).length;

  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  const retainedFaculty = faculty.filter((f) => new Date(f.createdAt) <= twoYearsAgo).length;
  const retentionRate = totalFaculty > 0 ? Math.round((retainedFaculty / totalFaculty) * 100) : 100;

  const totalPubs = publications.length;
  const journals = publications.filter((p) => p.type === "JOURNAL").length;
  const conferences = publications.filter((p) => p.type === "CONFERENCE").length;
  const patents = publications.filter((p) => p.type === "PATENT").length;
  const pubsPerFaculty = totalFaculty > 0 ? (totalPubs / totalFaculty).toFixed(2) : "0";

  return (
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* BMSIT Dot Matrix Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Accreditation" },
        ]}
        eyebrow="HOD // COMPLIANCE & SSR DOSSIER"
        dotMatrixText="ACCREDIT"
        dotMatrixFontSize={34}
        title="NBA & NAAC Accreditation Dossier"
        ghost="criterion 5."
        subtitle="Automated Criterion 5 calculations, Cadre Ratio verification & Self-Study Report (SSR) export"
        actions={
          <span className="badge badge-dark">
            <span className="badge-dot" style={{ backgroundColor: "#16A34A" }} />
            AY 2026-27 COMPLIANT
          </span>
        }
      />

      <AccreditationClient
        metrics={{
          totalFaculty,
          professors,
          associateProfessors,
          assistantProfessors,
          retentionRate,
          totalPubs,
          journals,
          conferences,
          patents,
          pubsPerFaculty,
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t) => t.status === "COMPLETED").length,
          avgEvalScore:
            evaluations.length > 0
              ? (
                  evaluations.reduce((acc, e) => acc + e.overallRating, 0) /
                  evaluations.length
                ).toFixed(1)
              : "N/A",
        }}
        facultyList={faculty.map((f) => ({
          name: f.name,
          designation: f.designation ?? "Faculty",
          publicationsCount: publications.filter((p) => p.authorId === f.id).length,
          serviceYears: Math.max(
            1,
            now.getFullYear() - new Date(f.createdAt).getFullYear()
          ),
        }))}
      />
    </div>
  );
}
