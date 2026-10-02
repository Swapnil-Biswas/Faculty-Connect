import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ScoringConfigForm } from "./ScoringConfigForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShieldCheck, History } from "lucide-react";
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
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/hod" },
          { label: "Scoring Configuration" },
        ]}
        eyebrow="// GOVERNANCE · RECOGNITION PARAMETERS"
        title="Scoring Configuration"
        subtitle="Configure the relative weight distribution of performance dimensions governing departmental scoring. All modifications are versioned and audited."
        showDotMatrix={false}
      />

      {/* 2. Explainability & Versioning Callout */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "20px 24px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          alignItems: "flex-start",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
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
            Explainability & Versioning Protocol
          </div>
          <p style={{ fontSize: 13, color: "#667085", lineHeight: 1.5, margin: "0 0 10px 0" }}>
            Historical faculty points remain permanently tied to the configuration version active when deliverables and evaluations were completed. Updates to weight factors take effect immediately for future scoring without altering historical records.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#667085" }}>
            <span>
              Active Configuration:{" "}
              <strong style={{ color: "#17202A" }}>
                Version #{activeConfig?.version ?? 1}
              </strong>
            </span>
            <span>·</span>
            <span>
              Established By:{" "}
              <strong style={{ color: "#17202A" }}>
                {activeConfig?.setByAdmin?.name ?? "Department Administration"}
              </strong>
            </span>
            {activeConfig?.createdAt && (
              <>
                <span>·</span>
                <span>
                  Last Updated:{" "}
                  <strong style={{ color: "#17202A" }}>
                    {formatDate(activeConfig.createdAt)}
                  </strong>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Weight Distribution Form */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          padding: "24px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: "0 0 4px 0" }}>
            Evaluation Factor Weights
          </h2>
          <p style={{ fontSize: 13, color: "#667085", margin: 0 }}>
            Adjust the balance between automated delivery indicators and qualitative peer evaluations.
          </p>
        </div>
        <ScoringConfigForm activeConfig={activeConfig} />
      </div>

      {/* 4. Configuration History Ledger */}
      {history.length > 0 && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid #E4E7EC",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#17202A",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <History size={16} color="#667085" />
                <span>Configuration History Ledger</span>
              </h2>
              <p style={{ fontSize: 12.5, color: "#667085", margin: "4px 0 0 0" }}>
                Chronological audit trail of scoring parameter revisions and administrative updates
              </p>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#173B67",
                backgroundColor: "#F0F4F8",
                border: "1px solid #D0D7DE",
                borderRadius: 4,
                padding: "4px 10px",
              }}
            >
              {history.length} Revisions Recorded
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: "#F7F8FA", borderBottom: "1px solid #E4E7EC" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085" }}>Version</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085" }}>Configured By</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>On-Time</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Early</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Quality</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Contribution</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Initiative</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085", textAlign: "center" }}>Overall</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#667085" }}>Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((cfg, index) => {
                  const rowBorder = index !== history.length - 1 ? "1px solid #F2F4F7" : "none";

                  return (
                    <tr
                      key={cfg.id}
                      style={{
                        borderBottom: rowBorder,
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {/* Version */}
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontWeight: 700, color: "#17202A" }}>
                          Version #{cfg.version}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        {cfg.isActive ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#166534",
                              backgroundColor: "#F0FDF4",
                              border: "1px solid #BBF7D0",
                              borderRadius: 4,
                              padding: "2px 8px",
                            }}
                          >
                            Active
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#667085",
                              backgroundColor: "#F7F8FA",
                              border: "1px solid #E4E7EC",
                              borderRadius: 4,
                              padding: "2px 8px",
                            }}
                          >
                            Archived
                          </span>
                        )}
                      </td>

                      {/* Configured By */}
                      <td style={{ padding: "14px 16px", color: "#17202A" }}>
                        {cfg.setByAdmin?.name ?? "System"}
                      </td>

                      {/* Weights */}
                      <td style={{ padding: "14px 16px", textAlign: "center", color: "#17202A" }}>
                        {Math.round(cfg.onTimeWeight * 100)}%
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center", color: "#17202A" }}>
                        {Math.round(cfg.earlyWeight * 100)}%
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center", color: "#17202A" }}>
                        {Math.round(cfg.qualityWeight * 100)}%
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center", color: "#17202A" }}>
                        {Math.round(cfg.contributionWeight * 100)}%
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center", color: "#17202A" }}>
                        {Math.round(cfg.initiativeWeight * 100)}%
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center", color: "#17202A" }}>
                        {Math.round(cfg.overallRatingWeight * 100)}%
                      </td>

                      {/* Effective Date */}
                      <td style={{ padding: "14px 16px", color: "#667085", whiteSpace: "nowrap" }}>
                        {formatDate(cfg.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}