import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ScoringConfigForm } from "./ScoringConfigForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { History, Info, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ScoringConfigPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role } = session.user;
  if (!["HOD", "ADMIN"].includes(role)) redirect("/faculty");

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
    <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* BMSIT Dot Matrix Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Scoring Configuration" },
        ]}
        eyebrow="HOD // MERIT MATRIX SYSTEM"
        dotMatrixText="SCORING"
        dotMatrixFontSize={36}
        title="Scoring Configuration"
        ghost="parameters."
        subtitle="Adjust the weight of each performance dimension in the Recognition Engine. All changes are permanently tracked and audited."
      />

      {/* Info Callout */}
      <div
        className="card"
        style={{
          display: "flex",
          gap: 14,
          padding: 18,
          background: "#FAFAFA",
          borderColor: "#E8E8ED",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#1D1D1F",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sparkles size={16} />
        </div>
        <div style={{ fontSize: 13, color: "#424245", lineHeight: 1.6 }}>
          <strong style={{ color: "#1D1D1F" }}>Explainability Guarantee:</strong> Historical faculty scores remain permanently tied to the formula active when awards were computed. No historical points are retroactively altered.
          <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: 11, color: "#6E6E73" }}>
            Status: <span style={{ fontWeight: 700, color: "#16A34A" }}>Active Heuristic</span> · Established by: <span style={{ fontWeight: 600, color: "#1D1D1F" }}>{activeConfig?.setByAdmin?.name ?? "System"}</span>
          </div>
        </div>
      </div>

      {/* Factor Weights Config Form */}
      <div className="card">
        <div style={{ marginBottom: 20 }}>
          <span className="section-eyebrow">// CONFIGURATION FORM</span>
          <h2 className="card-title" style={{ marginTop: 4 }}>
            Evaluation Weights Distribution
          </h2>
          <p className="card-muted">
            Define percentage weights allocated to on-time execution, early delivery, peer quality, and departmental contributions.
          </p>
        </div>
        <ScoringConfigForm activeConfig={activeConfig} />
      </div>

      {/* Version History Table */}
      {history.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <span className="section-eyebrow">// AUDIT TRAIL</span>
              <h2 className="card-title" style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <History size={18} />
                Configuration History Ledger
              </h2>
            </div>
            <span className="badge badge-dark">
              {history.length} Changes
            </span>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Config Entry</th>
                  <th>Status</th>
                  <th>Set By</th>
                  <th>On-Time</th>
                  <th>Early</th>
                  <th>Quality</th>
                  <th>Contribution</th>
                  <th>Initiative</th>
                  <th>Overall</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {history.map((cfg) => (
                  <tr key={cfg.id}>
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#1D1D1F" }}>
                        #{cfg.id.slice(-6)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${cfg.isActive ? "status-published" : "status-draft"}`}>
                        <span className="badge-dot" />
                        {cfg.isActive ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "#424245" }}>{cfg.setByAdmin?.name ?? "—"}</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{Math.round(cfg.onTimeWeight * 100)}%</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{Math.round(cfg.earlyWeight * 100)}%</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{Math.round(cfg.qualityWeight * 100)}%</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{Math.round(cfg.contributionWeight * 100)}%</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{Math.round(cfg.initiativeWeight * 100)}%</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>{Math.round(cfg.overallRatingWeight * 100)}%</td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#86868B", whiteSpace: "nowrap" }}>
                      {formatDate(cfg.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}