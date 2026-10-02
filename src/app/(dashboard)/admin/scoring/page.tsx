import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ScoringConfigForm } from "@/app/(dashboard)/hod/scoring/ScoringConfigForm";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function AdminScoringPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  const activeConfig = await db.scoringConfig.findFirst({
    where: { isActive: true },
    orderBy: { version: "desc" },
    include: { setByAdmin: { select: { name: true } } },
  });

  const history = await db.scoringConfig.findMany({
    orderBy: { version: "desc" },
    take: 10,
    include: { setByAdmin: { select: { name: true } } },
  });

  return (
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Scoring" },
        ]}
        dotMatrixText="SCORING"
        eyebrow="HEURISTICS CALIBRATION · GLOBAL MULTIPLIERS"
        title="Scoring Configuration & Rules"
        subtitle="System-level scoring heuristics, performance dimensions, and audited recognition parameters."
        actions={
          <span className="badge status-published" style={{ fontWeight: 700 }}>
            <span className="badge-dot" />
            SCORING ENGINE ACTIVE
          </span>
        }
      />

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid var(--grey-100)", paddingBottom: 14 }}>
          <div>
            <span className="section-eyebrow" style={{ marginBottom: 2 }}>// FACTOR WEIGHTS</span>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "2px 0 0", color: "var(--grey-900)" }}>
              Factor Weights Calibration
            </h2>
          </div>
          <span className="badge" style={{ color: "#16a34a", borderColor: "#16a34a" }}>
            ● Active Engine
          </span>
        </div>
        <ScoringConfigForm activeConfig={activeConfig} />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--grey-100)" }}>
          <span className="section-eyebrow" style={{ marginBottom: 2 }}>// AUDIT LEDGER</span>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0", color: "var(--grey-900)" }}>
            Configuration Audit History
          </h2>
        </div>
        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>CONFIGURATION</th>
                <th>STATUS</th>
                <th>SET BY</th>
                <th>ON-TIME</th>
                <th>EARLY</th>
                <th>QUALITY</th>
                <th>CREATED</th>
              </tr>
            </thead>
            <tbody>
              {history.map((cfg) => (
                <tr key={cfg.id} className="cyber-row-hover">
                  <td>
                    <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                      Config #{cfg.id.slice(-6)}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        fontWeight: 700,
                        color: cfg.isActive ? "#16a34a" : "var(--grey-500)",
                      }}
                    >
                      {cfg.isActive ? "● Active" : "Archived"}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: "var(--grey-800)" }}>
                    {cfg.setByAdmin?.name ?? "—"}
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                    {Math.round(cfg.onTimeWeight * 100)}%
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                    {Math.round(cfg.earlyWeight * 100)}%
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                    {Math.round(cfg.qualityWeight * 100)}%
                  </td>
                  <td style={{ fontSize: 12, color: "var(--grey-500)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                    {formatDate(cfg.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}