import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ScoringConfigForm } from "./ScoringConfigForm";
import { Settings, Info, History } from "lucide-react";
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
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Settings className="text-primary" size={28} />
          Scoring Configuration
        </h1>
        <p className="page-subtitle">
          Adjust the weight of each performance dimension in the Recognition Engine. All changes are versioned and audited.
        </p>
      </div>

      {/* Info box */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          padding: "1rem",
          background: "hsl(var(--color-primary) / 0.07)",
          border: "1px solid hsl(var(--color-primary) / 0.2)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <Info size={18} style={{ flexShrink: 0, marginTop: "1px", color: "hsl(var(--color-primary))" }} />
        <div style={{ fontSize: "0.875rem" }}>
          <strong>Explainability guarantee:</strong> Saving creates a new versioned config — historical scores remain linked
          to the version active at award time. No points are retroactively recalculated.
          Current version: <strong>v{activeConfig?.version ?? 1}</strong> — set by{" "}
          <strong>{activeConfig?.setByAdmin?.name ?? "System"}</strong>.
        </div>
      </div>

      {/* Config Form */}
      <div className="card" style={{ padding: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.5rem" }}>
          Factor Weights
        </h2>
        <ScoringConfigForm activeConfig={activeConfig} />
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <History size={20} />
            Version History
          </h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Version</th>
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
                      <span style={{ fontWeight: 700 }}>v{cfg.version}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${cfg.isActive ? "status-approved" : ""}`} style={{ fontSize: "11px" }}>
                        {cfg.isActive ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8125rem" }}>{cfg.setByAdmin?.name ?? "—"}</td>
                    <td>{Math.round(cfg.onTimeWeight * 100)}%</td>
                    <td>{Math.round(cfg.earlyWeight * 100)}%</td>
                    <td>{Math.round(cfg.qualityWeight * 100)}%</td>
                    <td>{Math.round(cfg.contributionWeight * 100)}%</td>
                    <td>{Math.round(cfg.initiativeWeight * 100)}%</td>
                    <td>{Math.round(cfg.overallRatingWeight * 100)}%</td>
                    <td style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))", whiteSpace: "nowrap" }}>
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