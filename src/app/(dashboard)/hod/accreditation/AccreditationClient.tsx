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
      academicInstitution: "Department of Computer Science & Engineering",
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
        className="card"
        style={{
          background: "#FAFAFA",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#1D1D1F", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={18} />
            </div>
            <h2 className="card-title" style={{ margin: 0 }}>
              NBA Self-Study Report (SSR) Generator
            </h2>
          </div>
          <p className="card-muted" style={{ margin: 0, maxWidth: 640 }}>
            Automated Criterion 5 calculations pre-validated against Tier-I and Tier-II engineering accreditation metrics (Form 5A & 5B).
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => window.print()}
            className="btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Printer size={14} /> PRINT SSR
          </button>
          <button
            onClick={exportForm5ACSV}
            className="btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <FileText size={14} /> EXPORT FORM 5A (.CSV)
          </button>
          <button
            onClick={exportDossierJSON}
            className="btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Download size={14} /> EXPORT JSON DOSSIER
          </button>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 20 }}>
        {/* Criterion 5.1: Student Faculty Ratio */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <span className="section-eyebrow">// CRITERION 5.1</span>
              <h3 className="card-title" style={{ marginTop: 2 }}>
                Student-Faculty Ratio (SFR)
              </h3>
            </div>
            {fsrCompliant ? (
              <span className="badge status-published">
                <span className="badge-dot" />
                NBA COMPLIANT (≤ 1:15)
              </span>
            ) : (
              <span className="badge" style={{ color: "#E11D48", borderColor: "rgba(225, 29, 72, 0.3)" }}>
                <span className="badge-dot" style={{ backgroundColor: "#E11D48" }} />
                NEEDS OPTIMIZATION
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "16px 0" }}>
            <span
              style={{
                fontSize: 42,
                fontWeight: 800,
                fontFamily: "var(--font-mono)",
                color: fsrCompliant ? "#16A34A" : "#E11D48",
                letterSpacing: "-0.03em",
              }}
            >
              1:{fsr}
            </span>
            <span style={{ fontSize: 12, color: "#6E6E73", fontFamily: "var(--font-mono)" }}>
              Target: 1:15 for maximum score (20 pts)
            </span>
          </div>

          <div
            style={{
              background: "#FAFAFA",
              padding: "16px 18px",
              borderRadius: 12,
              border: "1px solid #E8E8ED",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
              <span style={{ color: "#6E6E73" }}>Total Sanctioned Intake Students:</span>
              <strong style={{ color: "#1D1D1F", fontFamily: "var(--font-mono)", fontSize: 14 }}>
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
                accentColor: "#1D1D1F",
                cursor: "pointer",
                borderRadius: 4,
                height: 6,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#86868B",
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
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <span className="section-eyebrow">// CRITERION 5.2</span>
              <h3 className="card-title" style={{ marginTop: 2 }}>
                Faculty Cadre Proportion
              </h3>
            </div>
            <span className="badge">
              TARGET RATIO 1:2:6
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "16px 0", textAlign: "center" }}>
            <div style={{ background: "#FAFAFA", padding: "14px 10px", borderRadius: 10, border: "1px solid #E8E8ED" }}>
              <div style={{ fontSize: 10, color: "#6E6E73", fontWeight: 700, fontFamily: "var(--font-mono)" }}>PROFESSORS</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                {metrics.professors}
              </div>
              <div style={{ fontSize: 10, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 2 }}>Target: 1</div>
            </div>

            <div style={{ background: "#FAFAFA", padding: "14px 10px", borderRadius: 10, border: "1px solid #E8E8ED" }}>
              <div style={{ fontSize: 10, color: "#6E6E73", fontWeight: 700, fontFamily: "var(--font-mono)" }}>ASSOC. PROF</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                {metrics.associateProfessors}
              </div>
              <div style={{ fontSize: 10, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 2 }}>Target: 2</div>
            </div>

            <div style={{ background: "#FAFAFA", padding: "14px 10px", borderRadius: 10, border: "1px solid #E8E8ED" }}>
              <div style={{ fontSize: 10, color: "#6E6E73", fontWeight: 700, fontFamily: "var(--font-mono)" }}>ASST. PROF</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                {metrics.assistantProfessors}
              </div>
              <div style={{ fontSize: 10, color: "#86868B", fontFamily: "var(--font-mono)", marginTop: 2 }}>Target: 6</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#6E6E73", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
            Sanctioned cadre strength active: <span style={{ color: "#1D1D1F", fontWeight: 700 }}>{metrics.totalFaculty} faculty members</span> across academic clusters.
          </div>
        </div>
      </div>

      {/* Criterion 5.7: Research & Development */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <span className="section-eyebrow">// CRITERION 5.7</span>
            <h3 className="card-title" style={{ marginTop: 2 }}>
              Research Publications & IPR Portfolio
            </h3>
          </div>
          <span className="badge badge-dark">
            ★ {metrics.pubsPerFaculty} papers / faculty
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div style={{ background: "#FAFAFA", padding: "16px", borderRadius: 12, border: "1px solid #E8E8ED" }}>
            <div style={{ fontSize: 11, color: "#6E6E73", fontFamily: "var(--font-mono)", marginBottom: 4 }}>Scopus / SCI Journals</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>{metrics.journals}</div>
          </div>
          <div style={{ background: "#FAFAFA", padding: "16px", borderRadius: 12, border: "1px solid #E8E8ED" }}>
            <div style={{ fontSize: 11, color: "#6E6E73", fontFamily: "var(--font-mono)", marginBottom: 4 }}>IEEE / ACM Conferences</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>{metrics.conferences}</div>
          </div>
          <div style={{ background: "#FAFAFA", padding: "16px", borderRadius: 12, border: "1px solid #E8E8ED" }}>
            <div style={{ fontSize: 11, color: "#6E6E73", fontFamily: "var(--font-mono)", marginBottom: 4 }}>Granted / Published Patents</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>{metrics.patents}</div>
          </div>
          <div style={{ background: "#FAFAFA", padding: "16px", borderRadius: 12, border: "1px solid #E8E8ED" }}>
            <div style={{ fontSize: 11, color: "#6E6E73", fontFamily: "var(--font-mono)", marginBottom: 4 }}>Faculty Retention Rate</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#16A34A", fontFamily: "var(--font-mono)" }}>{metrics.retentionRate}%</div>
          </div>
        </div>
      </div>

      {/* Faculty SSR Roster */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #E8E8ED",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#FAFAFA",
          }}
        >
          <div>
            <span className="section-eyebrow">// NBA CRITERIA FORM 5A</span>
            <h3 className="card-title" style={{ marginTop: 2 }}>
              Faculty Compliance Matrix & Service Record
            </h3>
          </div>
          <span className="badge badge-dark">
            {facultyList.length} FACULTY MEMBERS ENROLLED
          </span>
        </div>
        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>FACULTY NAME</th>
                <th>DESIGNATION</th>
                <th>SERVICE TENURE</th>
                <th>INDEXED PUBS</th>
                <th style={{ textAlign: "right" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map((f, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: "#1D1D1F", fontSize: 13.5 }}>{f.name}</td>
                  <td style={{ color: "#6E6E73", fontSize: 13 }}>{f.designation}</td>
                  <td style={{ color: "#424245", fontSize: 13, fontFamily: "var(--font-mono)" }}>
                    {f.serviceYears} {f.serviceYears === 1 ? "year" : "years"}
                  </td>
                  <td style={{ color: "#1D1D1F", fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    {f.publicationsCount} papers
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span className="badge status-published">
                      <span className="badge-dot" />
                      VERIFIED
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
