import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ScoringConfigForm } from "@/app/(dashboard)/hod/scoring/ScoringConfigForm";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { Settings, Cpu, Sliders, History, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scoring Configuration — Admin | Faculty Connect",
};

export default async function AdminScoringPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin");

  const [activeConfig, history, totalRevisions] = await Promise.all([
    db.scoringConfig.findFirst({
      where: { isActive: true },
      orderBy: { version: "desc" },
      include: { setByAdmin: { select: { name: true } } },
    }),
    db.scoringConfig.findMany({
      orderBy: { version: "desc" },
      take: 10,
      include: { setByAdmin: { select: { name: true } } },
    }),
    db.scoringConfig.count(),
  ]);

  const automatedWeight = Math.round(
    ((activeConfig?.onTimeWeight ?? 0.2) +
      (activeConfig?.earlyWeight ?? 0.1) +
      (activeConfig?.completionRateWeight ?? 0.15) +
      (activeConfig?.streakWeight ?? 0.05)) *
      100
  );

  const manualWeight = Math.round(
    ((activeConfig?.qualityWeight ?? 0.2) +
      (activeConfig?.contributionWeight ?? 0.1) +
      (activeConfig?.initiativeWeight ?? 0.1) +
      (activeConfig?.overallRatingWeight ?? 0.1)) *
      100
  );

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
          { label: "Scoring Configuration" },
        ]}
        title="Scoring Configuration"
        subtitle="Configure the relative weight distribution of performance dimensions governing departmental scoring. All modifications are versioned and audited."
        showDotMatrix={false}
        actions={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: 6,
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              fontSize: 12,
              fontWeight: 600,
              color: "#17202A",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "#16A34A",
                display: "inline-block",
              }}
            />
            <span>Engine Active · v{activeConfig?.version ?? 1}</span>
          </div>
        }
      />

      {/* 4 Restrained Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <MetricBlock
          label="Active Engine Version"
          value={activeConfig ? `v${activeConfig.version}` : "v1"}
          context="Active institutional calibration"
          trendType="positive"
          icon={<Settings size={18} />}
        />
        <MetricBlock
          label="Automated Weight"
          value={`${automatedWeight}%`}
          context="4 delivery factor multipliers"
          trendType="neutral"
          icon={<Cpu size={18} />}
        />
        <MetricBlock
          label="Manual Weight"
          value={`${manualWeight}%`}
          context="4 qualitative evaluation factors"
          trendType="neutral"
          icon={<Sliders size={18} />}
        />
        <MetricBlock
          label="Configuration Revisions"
          value={totalRevisions}
          context="Audited heuristic versions"
          trendType="neutral"
          icon={<History size={18} />}
        />
      </div>

      {/* Explainability & Governance Callout */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "20px 24px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 10,
          alignItems: "flex-start",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: "#F0F4F8",
            border: "1px solid #D0D7DE",
            color: "#173B67",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#17202A", marginBottom: 4 }}>
            Institutional Governance & Versioning Protocol
          </div>
          <p style={{ fontSize: 13, color: "#667085", lineHeight: 1.5, margin: "0 0 10px 0" }}>
            Departmental scoring operates under immutable versioned heuristics. Points accrued by faculty remain permanently anchored to the configuration version active when deliverables and evaluations were completed. Saving modifications increments the global version number and takes effect immediately for future scoring without altering historical records.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#667085" }}>
            <span>
              Active Version: <strong style={{ color: "#17202A" }}>#{activeConfig?.version ?? 1}</strong>
            </span>
            <span>·</span>
            <span>
              Established By: <strong style={{ color: "#17202A" }}>{activeConfig?.setByAdmin?.name ?? "System Administrator"}</strong>
            </span>
            {activeConfig?.createdAt && (
              <>
                <span>·</span>
                <span>
                  Last Modified: <strong style={{ color: "#17202A" }}>{formatDate(activeConfig.createdAt)}</strong>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Factor Weights Calibration Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            borderBottom: "1px solid #F2F4F7",
            paddingBottom: 14,
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#17202A" }}>
              Factor Weights Calibration
            </h2>
            <p style={{ fontSize: 13, color: "#667085", margin: "4px 0 0 0" }}>
              Adjust relative weight distributions between automated deliverable timelines and peer evaluations.
            </p>
          </div>
        </div>
        <ScoringConfigForm activeConfig={activeConfig} />
      </div>

      {/* Configuration Audit History Ledger */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
      >
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #E4E7EC" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#17202A" }}>
            Configuration Audit History
          </h2>
          <p style={{ fontSize: 13, color: "#667085", margin: "4px 0 0 0" }}>
            Chronological record of calibrated heuristic versions and privileged updates.
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#F7F8FA",
                  borderBottom: "1px solid #E4E7EC",
                  color: "#667085",
                  fontSize: 11.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <th style={{ padding: "12px 20px" }}>Configuration</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px" }}>Set By</th>
                <th style={{ padding: "12px 16px" }}>On-Time</th>
                <th style={{ padding: "12px 16px" }}>Early</th>
                <th style={{ padding: "12px 16px" }}>Quality</th>
                <th style={{ padding: "12px 20px", textAlign: "right" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {history.map((cfg, idx) => (
                <tr
                  key={cfg.id}
                  style={{
                    borderBottom: idx < history.length - 1 ? "1px solid #F2F4F7" : "none",
                  }}
                >
                  <td style={{ padding: "14px 20px", fontWeight: 700, color: "#17202A" }}>
                    Version #{cfg.version}
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: "#98A2B3",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 400,
                      }}
                    >
                      ({cfg.id.slice(-6)})
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: cfg.isActive ? "#F0FDF4" : "#F2F4F7",
                        color: cfg.isActive ? "#166534" : "#667085",
                        border: `1px solid ${cfg.isActive ? "#BBF7D0" : "#E4E7EC"}`,
                      }}
                    >
                      {cfg.isActive ? "● Active" : "Archived"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#17202A", fontWeight: 500 }}>
                    {cfg.setByAdmin?.name ?? "—"}
                  </td>
                  <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 13, color: "#17202A" }}>
                    {Math.round(cfg.onTimeWeight * 100)}%
                  </td>
                  <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 13, color: "#17202A" }}>
                    {Math.round(cfg.earlyWeight * 100)}%
                  </td>
                  <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 13, color: "#17202A" }}>
                    {Math.round(cfg.qualityWeight * 100)}%
                  </td>
                  <td
                    style={{
                      padding: "14px 20px",
                      fontSize: 12,
                      color: "#667085",
                      whiteSpace: "nowrap",
                      textAlign: "right",
                    }}
                  >
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