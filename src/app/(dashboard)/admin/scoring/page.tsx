import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ScoringConfigForm } from "@/app/(dashboard)/hod/scoring/ScoringConfigForm";
import { Settings } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
    <div className="dashboard-container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Settings className="text-primary" size={28} />
          Scoring Config — Admin Defaults
        </h1>
        <p className="page-subtitle">
          System-level scoring configuration. Changes create a new versioned snapshot; historical ledger entries remain linked to the config version at award time.
        </p>
      </div>

      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Factor Weights</h2>
          <span className="status-badge status-approved" style={{ fontSize: "12px" }}>
            Current: v{activeConfig?.version ?? 1}
          </span>
        </div>
        <ScoringConfigForm activeConfig={activeConfig} />
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "1rem" }}>Version History</h2>
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
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {history.map((cfg) => (
                <tr key={cfg.id}>
                  <td><span style={{ fontWeight: 700 }}>v{cfg.version}</span></td>
                  <td>
                    <span className={`status-badge ${cfg.isActive ? "status-approved" : ""}`} style={{ fontSize: "11px" }}>
                      {cfg.isActive ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.8125rem" }}>{cfg.setByAdmin?.name ?? "—"}</td>
                  <td>{Math.round(cfg.onTimeWeight * 100)}%</td>
                  <td>{Math.round(cfg.earlyWeight * 100)}%</td>
                  <td>{Math.round(cfg.qualityWeight * 100)}%</td>
                  <td style={{ fontSize: "0.8125rem", color: "hsl(var(--text-muted))", whiteSpace: "nowrap" }}>
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