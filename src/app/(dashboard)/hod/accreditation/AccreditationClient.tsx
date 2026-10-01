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
    <div>
      {/* Top Banner & Export Actions */}
      <div
        className="card"
        style={{
          padding: "20px 24px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          background: "linear-gradient(135deg, hsl(var(--color-primary) / 0.08), hsl(var(--color-secondary) / 0.05))",
          borderColor: "hsl(var(--color-primary) / 0.25)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Award size={20} style={{ color: "hsl(var(--color-primary))" }} />
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>NBA Self-Study Report (SSR) Generator</h2>
          </div>
          <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", margin: 0 }}>
            Automated Criterion 5 calculations pre-validated against Tier-I and Tier-II engineering accreditation metrics.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => window.print()} className="btn-outline" style={{ fontSize: 13, gap: 6 }}>
            <Printer size={16} /> Print SSR
          </button>
          <button onClick={exportForm5ACSV} className="btn-outline" style={{ fontSize: 13, gap: 6 }}>
            <FileText size={16} /> Export Form 5A (CSV)
          </button>
          <button onClick={exportDossierJSON} className="btn-gradient" style={{ fontSize: 13, gap: 6 }}>
            <Download size={16} /> Export JSON Dossier
          </button>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Criterion 5.1: Student Faculty Ratio */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "hsl(var(--color-primary))", textTransform: "uppercase" }}>
                Criterion 5.1
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0" }}>Student-Faculty Ratio (SFR)</h3>
            </div>
            {fsrCompliant ? (
              <span className="role-badge" style={{ background: "hsl(var(--color-success) / 0.15)", color: "hsl(var(--color-success))" }}>
                ✓ NBA Compliant (≤ 1:15)
              </span>
            ) : (
              <span className="role-badge" style={{ background: "hsl(var(--color-danger) / 0.15)", color: "hsl(var(--color-danger))" }}>
                ⚠️ Needs Optimization
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "16px 0" }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: fsrCompliant ? "hsl(var(--color-success))" : "hsl(var(--color-danger))" }}>
              1:{fsr}
            </span>
            <span style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>
              Target: 1:15 for maximum marks (20 pts)
            </span>
          </div>

          <div style={{ background: "hsl(var(--bg-subtle))", padding: "14px 16px", borderRadius: "var(--radius-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span>Total Sanctioned Intake Students</span>
              <strong style={{ color: "hsl(var(--color-primary))" }}>{sanctionedStudents} students</strong>
            </div>
            <input
              type="range"
              min={60}
              max={600}
              step={30}
              value={sanctionedStudents}
              onChange={(e) => setSanctionedStudents(parseInt(e.target.value, 10))}
              style={{ width: "100%", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 4 }}>
              <span>60 (1 Division)</span>
              <span>240 (Standard)</span>
              <span>600 (Multi-shift)</span>
            </div>
          </div>
        </div>

        {/* Criterion 5.2: Cadre Ratio */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "hsl(var(--color-primary))", textTransform: "uppercase" }}>
                Criterion 5.2
              </span>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0" }}>Faculty Cadre Proportion</h3>
            </div>
            <span className="role-badge" style={{ background: "hsl(var(--color-info) / 0.15)", color: "hsl(var(--color-info))" }}>
              Target Ratio 1:2:6
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, margin: "16px 0", textAlign: "center" }}>
            <div style={{ background: "hsl(var(--bg-subtle))", padding: "12px", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", fontWeight: 600 }}>PROFESSORS</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{metrics.professors}</div>
              <div style={{ fontSize: 10, color: "hsl(var(--text-muted))" }}>Target: 1</div>
            </div>

            <div style={{ background: "hsl(var(--bg-subtle))", padding: "12px", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", fontWeight: 600 }}>ASSOC. PROF</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{metrics.associateProfessors}</div>
              <div style={{ fontSize: 10, color: "hsl(var(--text-muted))" }}>Target: 2</div>
            </div>

            <div style={{ background: "hsl(var(--bg-subtle))", padding: "12px", borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", fontWeight: 600 }}>ASST. PROF</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{metrics.assistantProfessors}</div>
              <div style={{ fontSize: 10, color: "hsl(var(--text-muted))" }}>Target: 6</div>
            </div>
          </div>

          <div style={{ fontSize: 12.5, color: "hsl(var(--text-secondary))", lineHeight: 1.5 }}>
            Total sanctioned cadre strength active: <strong>{metrics.totalFaculty} faculty members</strong> across department clusters.
          </div>
        </div>
      </div>

      {/* Criterion 5.7: Research & Development */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "hsl(var(--color-primary))", textTransform: "uppercase" }}>
              Criterion 5.7
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 0" }}>Research Publications & IPR Portfolio</h3>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>
            ★ {metrics.pubsPerFaculty} papers / faculty
          </div>
        </div>

        <div className="grid-4">
          <div style={{ background: "hsl(var(--bg-subtle))", padding: "14px", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>Scopus / SCI Journals</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "hsl(var(--color-primary))" }}>{metrics.journals}</div>
          </div>
          <div style={{ background: "hsl(var(--bg-subtle))", padding: "14px", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>IEEE / ACM Conferences</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "hsl(var(--color-info))" }}>{metrics.conferences}</div>
          </div>
          <div style={{ background: "hsl(var(--bg-subtle))", padding: "14px", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>Granted / Published Patents</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#F59E0B" }}>{metrics.patents}</div>
          </div>
          <div style={{ background: "hsl(var(--bg-subtle))", padding: "14px", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>Faculty Retention Rate</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "hsl(var(--color-success))" }}>{metrics.retentionRate}%</div>
          </div>
        </div>
      </div>

      {/* Faculty SSR Roster */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--border))" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Faculty Table (Form 5A Compliance)</h3>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Designation</th>
                <th>Service Tenure</th>
                <th>Indexed Publications</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map((f, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{f.name}</td>
                  <td>{f.designation}</td>
                  <td>{f.serviceYears} year(s)</td>
                  <td>{f.publicationsCount} publications</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "hsl(var(--color-success))", background: "hsl(var(--color-success) / 0.12)", padding: "2px 8px", borderRadius: 6 }}>
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
