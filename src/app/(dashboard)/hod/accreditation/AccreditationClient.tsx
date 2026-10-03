"use client";

import { useState } from "react";
import {
  Award,
  Printer,
  Download,
  FileSpreadsheet,
  Users,
  BookOpen,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

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
    const headers = [
      "Faculty Name",
      "Designation",
      "Publications Count",
      "Years of Service",
      "Criterion 5 Eligibility",
    ];
    const rows = facultyList.map((f) => [
      `"${f.name}"`,
      `"${f.designation}"`,
      f.publicationsCount,
      f.serviceYears,
      f.serviceYears >= 1 ? "Eligible" : "Provisional",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
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
      {/* Print Specific CSS Overrides */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .app-layout, body {
            background-color: #FFFFFF !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .table-container {
            overflow: visible !important;
          }
        }
      `}</style>

      {/* 1. SSR Action Toolbar Banner */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Award size={18} color="#173B67" />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: 0 }}>
              NBA Self-Study Report (SSR) Dossier
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "#667085", margin: 0, maxWidth: 660 }}>
            Automated Criterion 5 calculations pre-validated against Tier-I and Tier-II engineering accreditation metrics (Form 5A & 5B).
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => window.print()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 600,
              backgroundColor: "#173B67",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
          >
            <Printer size={14} /> Print SSR
          </button>

          <button
            onClick={exportForm5ACSV}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 600,
              backgroundColor: "#FFFFFF",
              color: "#17202A",
              border: "1px solid #E4E7EC",
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <FileSpreadsheet size={14} color="#173B67" /> Export Form 5A (.CSV)
          </button>

          <button
            onClick={exportDossierJSON}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 600,
              backgroundColor: "#FFFFFF",
              color: "#17202A",
              border: "1px solid #E4E7EC",
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Download size={14} color="#173B67" /> Export JSON Dossier
          </button>
        </div>
      </div>

      {/* 2. Main Analysis Grid: Criterion 5.1 & Criterion 5.2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 20,
        }}
      >
        {/* Criterion 5.1: Student Faculty Ratio */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase" }}>
                  CRITERION 5.1
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: "2px 0 0 0" }}>
                  Student-Faculty Ratio (SFR)
                </h3>
              </div>
              {fsrCompliant ? (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 4,
                    backgroundColor: "rgba(25, 135, 84, 0.1)",
                    color: "#198754",
                    border: "1px solid rgba(25, 135, 84, 0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <CheckCircle2 size={13} /> NBA Compliant (≤ 1:15)
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: 4,
                    backgroundColor: "rgba(192, 57, 43, 0.1)",
                    color: "#C0392B",
                    border: "1px solid rgba(192, 57, 43, 0.25)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <AlertCircle size={13} /> Needs Optimization
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 10, margin: "14px 0" }}>
              <span
                style={{
                  fontSize: 38,
                  fontWeight: 700,
                  color: fsrCompliant ? "#198754" : "#C0392B",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                1:{fsr}
              </span>
              <span style={{ fontSize: 13, color: "#667085" }}>
                Target: 1:15 or better for maximum score (20 pts)
              </span>
            </div>
          </div>

          {/* Interactive Intake Slider */}
          <div
            style={{
              backgroundColor: "#F7F8FA",
              padding: "16px 18px",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "#667085", fontWeight: 500 }}>Sanctioned Student Intake:</span>
              <strong style={{ color: "#17202A", fontSize: 13.5 }}>
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
                accentColor: "#173B67",
                cursor: "pointer",
                height: 6,
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11.5,
                color: "#667085",
                marginTop: 8,
              }}
            >
              <span>60 (Min Intake)</span>
              <span>240 (Sanctioned Intake)</span>
              <span>600 (Max Multi-Shift)</span>
            </div>
          </div>
        </div>

        {/* Criterion 5.2: Cadre Ratio */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase" }}>
                  CRITERION 5.2
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: "2px 0 0 0" }}>
                  Faculty Cadre Proportion
                </h3>
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "3px 8px",
                  borderRadius: 4,
                  backgroundColor: "#F2F4F7",
                  color: "#17202A",
                  border: "1px solid #E4E7EC",
                }}
              >
                Target: 1 : 2 : 6
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                margin: "14px 0",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "#F7F8FA",
                  padding: "14px 10px",
                  borderRadius: 6,
                  border: "1px solid #E4E7EC",
                }}
              >
                <div style={{ fontSize: 11, color: "#667085", fontWeight: 600 }}>PROFESSORS</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#17202A", marginTop: 4 }}>
                  {metrics.professors}
                </div>
                <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>Benchmark: 1</div>
              </div>

              <div
                style={{
                  backgroundColor: "#F7F8FA",
                  padding: "14px 10px",
                  borderRadius: 6,
                  border: "1px solid #E4E7EC",
                }}
              >
                <div style={{ fontSize: 11, color: "#667085", fontWeight: 600 }}>ASSOC. PROFESSORS</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#17202A", marginTop: 4 }}>
                  {metrics.associateProfessors}
                </div>
                <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>Benchmark: 2</div>
              </div>

              <div
                style={{
                  backgroundColor: "#F7F8FA",
                  padding: "14px 10px",
                  borderRadius: 6,
                  border: "1px solid #E4E7EC",
                }}
              >
                <div style={{ fontSize: 11, color: "#667085", fontWeight: 600 }}>ASST. PROFESSORS</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#17202A", marginTop: 4 }}>
                  {metrics.assistantProfessors}
                </div>
                <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>Benchmark: 6</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12.5, color: "#667085", lineHeight: 1.5 }}>
            Total sanctioned cadre active: <span style={{ color: "#17202A", fontWeight: 600 }}>{metrics.totalFaculty} faculty members</span> across academic clusters.
          </div>
        </div>
      </div>

      {/* 3. Criterion 5.7: Research & Development */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          padding: 20,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase" }}>
              CRITERION 5.7
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: "2px 0 0 0" }}>
              Research Publications & IPR Portfolio
            </h3>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "4px 10px",
              backgroundColor: "#F2F4F7",
              color: "#17202A",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
            }}
          >
            {metrics.pubsPerFaculty} publications / faculty
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          <div
            style={{
              backgroundColor: "#F7F8FA",
              padding: "16px 18px",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
            }}
          >
            <div style={{ fontSize: 12, color: "#667085", marginBottom: 6 }}>Scopus / SCI Journals</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#17202A" }}>{metrics.journals}</div>
          </div>

          <div
            style={{
              backgroundColor: "#F7F8FA",
              padding: "16px 18px",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
            }}
          >
            <div style={{ fontSize: 12, color: "#667085", marginBottom: 6 }}>IEEE / ACM Conferences</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#17202A" }}>{metrics.conferences}</div>
          </div>

          <div
            style={{
              backgroundColor: "#F7F8FA",
              padding: "16px 18px",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
            }}
          >
            <div style={{ fontSize: 12, color: "#667085", marginBottom: 6 }}>Granted / Published Patents</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#17202A" }}>{metrics.patents}</div>
          </div>

          <div
            style={{
              backgroundColor: "#F7F8FA",
              padding: "16px 18px",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
            }}
          >
            <div style={{ fontSize: 12, color: "#667085", marginBottom: 6 }}>Faculty Retention Rate</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: "#198754" }}>{metrics.retentionRate}%</div>
          </div>
        </div>
      </div>

      {/* 4. Form 5A Faculty Matrix */}
      <div
        className="table-container"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #E4E7EC",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            backgroundColor: "#FFFFFF",
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: 0 }}>
              Faculty Compliance Matrix (Form 5A)
            </h3>
            <p style={{ fontSize: 13, color: "#667085", margin: "2px 0 0 0" }}>
              Verified roster detailing academic designation, service tenure, and Criterion 5 eligibility.
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "4px 10px",
              backgroundColor: "#F2F4F7",
              color: "#17202A",
              borderRadius: 6,
              border: "1px solid #E4E7EC",
            }}
          >
            {facultyList.length} Faculty Members
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E4E7EC", backgroundColor: "#F7F8FA" }}>
                <th
                  style={{
                    padding: "12px 18px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                  }}
                >
                  FACULTY NAME
                </th>
                <th
                  style={{
                    padding: "12px 18px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                  }}
                >
                  DESIGNATION
                </th>
                <th
                  style={{
                    padding: "12px 18px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                  }}
                >
                  SERVICE TENURE
                </th>
                <th
                  style={{
                    padding: "12px 18px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                  }}
                >
                  INDEXED PUBLICATIONS
                </th>
                <th
                  style={{
                    padding: "12px 18px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#667085",
                    textAlign: "right",
                  }}
                >
                  CRITERION 5 STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map((f, i) => {
                const isEligible = f.serviceYears >= 1;
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid #F2F4F7",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "14px 18px", fontWeight: 600, color: "#17202A", fontSize: 13.5 }}>
                      {f.name}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#667085", fontSize: 13 }}>
                      {f.designation}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#17202A", fontSize: 13 }}>
                      {f.serviceYears} {f.serviceYears === 1 ? "year" : "years"}
                    </td>
                    <td style={{ padding: "14px 18px", color: "#17202A", fontSize: 13 }}>
                      {f.publicationsCount} {f.publicationsCount === 1 ? "publication" : "publications"}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: 4,
                          display: "inline-block",
                          backgroundColor: isEligible
                            ? "rgba(25, 135, 84, 0.1)"
                            : "rgba(183, 121, 31, 0.1)",
                          color: isEligible ? "#198754" : "#B7791F",
                          border: isEligible
                            ? "1px solid rgba(25, 135, 84, 0.25)"
                            : "1px solid rgba(183, 121, 31, 0.25)",
                        }}
                      >
                        {isEligible ? "Eligible" : "Provisional"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
