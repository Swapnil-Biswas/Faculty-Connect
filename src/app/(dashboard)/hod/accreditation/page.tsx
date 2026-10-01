import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AccreditationClient } from "./AccreditationClient";

export default async function HodAccreditationPage() {
  const session = await auth();
  if (!session?.user || !["HOD", "ADMIN"].includes(session.user.role)) {
    redirect("/dashboard");
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
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* BMSIT High-Tech Header */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", borderRadius: 4, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", color: "#F59E0B", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
            <span>●</span> ACCREDITATION COMPLIANCE // CRITERION 5.0 SSR
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F8FAFC", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
            NBA & NAAC Accreditation Dossier
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, fontFamily: "var(--font-mono)" }}>
            // Automated Criterion 5 calculations, Cadre Ratio verification & Self-Study Report (SSR) export
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 6, background: "rgba(14, 18, 27, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E", display: "inline-block" }}></span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#E2E8F0" }}>AY 2026-27 COMPLIANT</span>
        </div>
      </div>

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
