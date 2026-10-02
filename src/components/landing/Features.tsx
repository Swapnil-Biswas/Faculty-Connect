import Link from "next/link";
import { Award, BookOpen, CheckSquare, Shield, Trophy, Users, BarChart3, Clock } from "lucide-react";

export default function Features() {
  const modules = [
    {
      icon: <Award size={22} />,
      title: "Star & Merit Appraisal",
      blurb: "Transparent points matrix rewarding publications, funded grants, FDP attendance, and pedagogical innovation.",
      tag: "Criterion 5",
    },
    {
      icon: <Users size={22} />,
      title: "Cluster-Based Hierarchy",
      blurb: "Decentralized faculty clusters (AI/ML, Systems, Core Computing) with cluster head evaluations and workload balancing.",
      tag: "Governance",
    },
    {
      icon: <Shield size={22} />,
      title: "Accreditation Engine",
      blurb: "Automated generation of NBA Criterion 5 and NAAC Form 5A dossiers with one-click PDF & Excel dossiers.",
      tag: "NBA / NAAC",
    },
    {
      icon: <BookOpen size={22} />,
      title: "Scholarly Registry",
      blurb: "Centralized repository for IEEE, Scopus, and SCI-indexed publications with impact factor tracking and audit trail.",
      tag: "Research",
    },
    {
      icon: <CheckSquare size={22} />,
      title: "Task Lifecycle Management",
      blurb: "End-to-end task delegation from HOD to cluster heads and faculty with submission review and deadline alerts.",
      tag: "Operations",
    },
    {
      icon: <BarChart3 size={22} />,
      title: "Faculty Velocity & Analytics",
      blurb: "Real-time metrics on teaching load, publication velocity, leave balance, and inter-cluster performance index.",
      tag: "Analytics",
    },
  ];

  return (
    <section className="about" id="modules" style={{ padding: "80px 48px", background: "var(--off-white)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <span className="section-eyebrow">// 02 — ARCHITECTURE</span>
          <h2 className="section-heading" style={{ marginTop: 8 }}>
            Engineered for
            <br />
            Academic Rigor.
            <br />
            <span style={{ color: "transparent", WebkitTextStroke: "1.2px var(--grey-300)", fontStyle: "italic" }}>
              Built for BMSIT.
            </span>
          </h2>
          <p className="section-body" style={{ maxWidth: 640, marginTop: 16 }}>
            Eliminate duplicate data entry across departmental files. Faculty Connect provides unified synchronization across accreditation, research output, task distribution, and performance appraisal.
          </p>
        </div>

        <div className="grid grid-3" style={{ gap: 24 }}>
          {modules.map((m, idx) => (
            <div key={idx} className="card card-hover" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: "var(--grey-50)",
                    border: "1px solid var(--grey-200)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--grey-800)",
                  }}
                >
                  {m.icon}
                </div>
                <span className="badge">{m.tag}</span>
              </div>
              <h3 className="card-title" style={{ fontSize: 18, marginTop: 6 }}>
                {m.title}
              </h3>
              <p className="card-muted" style={{ margin: 0 }}>
                {m.blurb}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, textAlign: "center" }}>
          <Link href="/login" className="btn-primary" style={{ display: "inline-flex" }}>
            ACCESS FACULTY PORTAL →
          </Link>
        </div>
      </div>
    </section>
  );
}
