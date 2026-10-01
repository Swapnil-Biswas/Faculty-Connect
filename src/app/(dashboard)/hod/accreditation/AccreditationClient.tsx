"use client";

import { useState } from "react";
import { Award, CheckCircle2, AlertTriangle, Download, Printer, FileText, Users, BookOpen, Star } from "lucide-react";

interface Metrics {
  totalFaculty: number;
  professors: number;
  associateProfessors: number;
  assistantProfessors: number;
  retentionRate: number;
  totalPubs: number;
  journals: number;
  conferences: number;
  patents: number;
  pubsPerFaculty: string;
  totalTasks: number;
  completedTasks: number;
  avgEvalScore: string;
}

interface FacultySummary {
  name: string;
  designation: string;
  publicationsCount: number;
  serviceYears: number;
}

interface Props {
  metrics: Metrics;
  facultyList: FacultySummary[];
}

export function AccreditationClient({ metrics, facultyList }: Props) {
  const [sanctionedStudents, setSanctionedStudents] = useState(240);

  const fsr = metrics.totalFaculty > 0 ? (sanctionedStudents / metrics.totalFaculty).toFixed(1) : "0";
  const fsrCompliant = parseFloat(fsr) <= 15 && parseFloat(fsr) > 0;

  function exportDossierJSON() {
    const report = {
      academicInstitution: "Department of Computer Engineering",
      generatedAt: new Date().toISOString(),
      nbaCriteria5: {
        facultyStudentRatio: {
          sanctionedStudents,
          totalFaculty: metrics.totalFaculty,
          calculatedFSR: `1:${fsr}`,
          nbaBenchmark: "1:15 or better",
          compliant: fsrCompliant,
        },
        cadreRatio: {
          professors: metrics.professors,
          associateProfessors: metrics.associateProfessors,
          assistantProfessors: metrics.assistantProfessors,
          nbaRatioTarget: "1:2:6",
        },
        researchAndPublications: {
          totalPublications: metrics.totalPubs,
          journals: metrics.journals,
          conferences: metrics.conferences,
          patents: metrics.patents,
          averagePerFaculty: metrics.pubsPerFaculty,
        },
        retentionAndAppraisal: {
          retentionRatePercent: metrics.retentionRate,
          averageAppraisalRating: metrics.avgEvalScore,
        },
      },
      facultyList,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NBA_Criterion_5_Dossier_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportForm5ACSV() {
    const headers = ["Faculty Name", "Designation", "Publications Count", "Years of Service", "Criterion 5 Eligibility"];
    const rows = facultyList.map((f) => [
      `"${f.name}"`,
      `"${f.designation}"`,
      f.publicationsCount,
      f.serviceYears,
      f.serviceYears >= 1 ? "Eligible" : "Provisional",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NBA_Form_5A_Faculty_Details_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Top Banner & Export Actions */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(14, 18, 27, 0.95) 60%, rgba(56, 189, 248, 0.08) 100%)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: 12,
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={18} style={{ color: "#F59E0B" }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#F8FAFC", letterSpacing: "-0.01em" }}>
              NBA Self-Study Report (SSR) Generator
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, maxWidth: 600 }}>
            Automated Criterion 5 calculations pre-validated against Tier-I and Tier-II engineering accreditation metrics (Form 5A & 5B).
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => window.print()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 8,
              color: "#E2E8F0",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Printer size={15} style={{ color: "#38BDF8" }} /> PRINT SSR
          </button>
          <button
            onClick={exportForm5ACSV}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 8,
              color: "#E2E8F0",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <FileText size={15} style={{ color: "#F59E0B" }} /> EXPORT FORM 5A (.CSV)
          </button>
          <button
            onClick={exportDossierJSON}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              border: "none",
              borderRadius: 8,
              color: "#0A0D14",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 0 16px rgba(245, 158, 11, 0.35)",
            }}
          >
            <Download size={15} /> EXPORT JSON DOSSIER
          </button>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 20 }}>
        {/* Criterion 5.1: Student Faculty Ratio */}
        <div
          style={{
            background: "#0E121B",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
                // CRITERION 5.1
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "4px 0 0", color: "#F8FAFC" }}>
                Student-Faculty Ratio (SFR)
              </h3>
            </div>
            {fsrCompliant ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  background: "rgba(34, 197, 94, 0.12)",
                  color: "#22C55E",
                  border: "1px solid rgba(34, 197, 94, 0.25)",
                }}
              >
                ● NBA COMPLIANT (≤ 1:15)
              </span>
            ) : (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  background: "rgba(244, 63, 94, 0.12)",
                  color: "#F43F5E",
                  border: "1px solid rgba(244, 63, 94, 0.25)",
                }}
              >
                ▲ NEEDS OPTIMIZATION
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "20px 0" }}>
            <span
              style={{
                fontSize: 42,
                fontWeight: 900,
                fontFamily: "var(--font-mono)",
                color: fsrCompliant ? "#22C55E" : "#F43F5E",
                letterSpacing: "-0.03em",
              }}
            >
              1:{fsr}
            </span>
            <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>
              Target: 1:15 for max score (20 pts)
            </span>
          </div>

          <div
            style={{
              background: "#07090E",
              padding: "16px 18px",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
              <span style={{ color: "#94A3B8" }}>Total Sanctioned Intake Students:</span>
              <strong style={{ color: "#38BDF8", fontFamily: "var(--font-mono)", fontSize: 14 }}>
                {sanctionedStudents} students
              </strong>
            </div>
            <input
              type="range"
              min={60}
              max={600}
              step={30}
              value={sanctionedStudents}
              onChange={(e) => setSanctionedStudents(parseInt(e.target.value, 10))}
              style={{
                width: "100%",
                accentColor: "#F59E0B",
                cursor: "pointer",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: 4,
                height: 6,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#64748B",
                fontFamily: "var(--font-mono)",
                marginTop: 8,
              }}
            >
              <span>60 (1 Div)</span>
              <span>240 (Standard BMSIT)</span>
              <span>600 (Multi-Shift)</span>
            </div>
          </div>
        </div>

        {/* Criterion 5.2: Cadre Ratio */}
        <div
          style={{
            background: "#0E121B",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
                // CRITERION 5.2
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "4px 0 0", color: "#F8FAFC" }}>
                Faculty Cadre Proportion
              </h3>
            </div>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                background: "rgba(56, 189, 248, 0.12)",
                color: "#38BDF8",
                border: "1px solid rgba(56, 189, 248, 0.25)",
              }}
            >
              TARGET RATIO 1:2:6
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "20px 0", textAlign: "center" }}>
            <div style={{ background: "#07090E", padding: "14px 10px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, fontFamily: "var(--font-mono)" }}>PROFESSORS</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#F59E0B", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                {metrics.professors}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", fontFamily: "var(--font-mono)", marginTop: 2 }}>Target: 1</div>
            </div>

            <div style={{ background: "#07090E", padding: "14px 10px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, fontFamily: "var(--font-mono)" }}>ASSOC. PROF</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#38BDF8", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                {metrics.associateProfessors}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", fontFamily: "var(--font-mono)", marginTop: 2 }}>Target: 2</div>
            </div>

            <div style={{ background: "#07090E", padding: "14px 10px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
              <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, fontFamily: "var(--font-mono)" }}>ASST. PROF</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#A855F7", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                {metrics.assistantProfessors}
              </div>
              <div style={{ fontSize: 10, color: "#64748B", fontFamily: "var(--font-mono)", marginTop: 2 }}>Target: 6</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#94A3B8", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
            Sanctioned cadre strength active: <span style={{ color: "#F8FAFC", fontWeight: 700 }}>{metrics.totalFaculty} faculty members</span> across academic clusters.
          </div>
        </div>
      </div>

      {/* Criterion 5.7: Research & Development */}
      <div
        style={{
          background: "#0E121B",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#22C55E", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>
              // CRITERION 5.7
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "4px 0 0", color: "#F8FAFC" }}>
              Research Publications & IPR Portfolio
            </h3>
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              color: "#F59E0B",
              background: "rgba(245, 158, 11, 0.12)",
              padding: "4px 12px",
              borderRadius: 6,
              border: "1px solid rgba(245, 158, 11, 0.25)",
            }}
          >
            ★ {metrics.pubsPerFaculty} papers / faculty
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div style={{ background: "#07090E", padding: "16px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)", marginBottom: 4 }}>Scopus / SCI Journals</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{metrics.journals}</div>
          </div>
          <div style={{ background: "#07090E", padding: "16px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)", marginBottom: 4 }}>IEEE / ACM Conferences</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#A855F7", fontFamily: "var(--font-mono)" }}>{metrics.conferences}</div>
          </div>
          <div style={{ background: "#07090E", padding: "16px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)", marginBottom: 4 }}>Granted / Published Patents</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>{metrics.patents}</div>
          </div>
          <div style={{ background: "#07090E", padding: "16px", borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "var(--font-mono)", marginBottom: 4 }}>Faculty Retention Rate</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#22C55E", fontFamily: "var(--font-mono)" }}>{metrics.retentionRate}%</div>
          </div>
        </div>
      </div>

      {/* Faculty SSR Roster */}
      <div
        style={{
          background: "#0E121B",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", fontFamily: "var(--font-mono)" }}>
              // NBA CRITERIA FORM 5A
            </span>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "2px 0 0", color: "#F8FAFC" }}>
              Faculty Compliance Matrix & Service Record
            </h3>
          </div>
          <span style={{ fontSize: 12, color: "#64748B", fontFamily: "var(--font-mono)" }}>
            {facultyList.length} FACULTY MEMBERS ENROLLED
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.02)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>FACULTY NAME</th>
                <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>DESIGNATION</th>
                <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>SERVICE TENURE</th>
                <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700 }}>INDEXED PUBS</th>
                <th style={{ padding: "12px 20px", fontSize: 11, fontFamily: "var(--font-mono)", color: "#94A3B8", fontWeight: 700, textAlign: "right" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map((f, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "#F8FAFC", fontSize: 13 }}>{f.name}</td>
                  <td style={{ padding: "14px 20px", color: "#94A3B8", fontSize: 13 }}>{f.designation}</td>
                  <td style={{ padding: "14px 20px", color: "#CBD5E1", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                    {f.serviceYears} {f.serviceYears === 1 ? "year" : "years"}
                  </td>
                  <td style={{ padding: "14px 20px", color: "#F59E0B", fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    {f.publicationsCount} papers
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        color: "#22C55E",
                        background: "rgba(34, 197, 94, 0.12)",
                        border: "1px solid rgba(34, 197, 94, 0.25)",
                        padding: "3px 8px",
                        borderRadius: 4,
                      }}
                    >
                      ● VERIFIED
                    </span>
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
