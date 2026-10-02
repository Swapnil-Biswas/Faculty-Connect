"use client";

import RevealOnScroll from "@/components/ui/RevealOnScroll";
import GlyphDivider from "@/components/ui/GlyphDivider";
import Link from "next/link";

interface FacultyLeader {
  id: string;
  name: string;
  role: string;
  designation: string;
  cluster: string;
  initials: string;
}

const facultyLeadership: FacultyLeader[] = [
  {
    id: "f1",
    name: "Dr. BHARATHI M A",
    role: "Head of Department",
    designation: "Professor & HOD (CSE)",
    cluster: "Academic Executive",
    initials: "BM",
  },
  {
    id: "f2",
    name: "Dr. Anupama H S",
    role: "NBA Coordinator",
    designation: "Professor",
    cluster: "Accreditation Cluster",
    initials: "AH",
  },
  {
    id: "f3",
    name: "Dr. Vidya A",
    role: "NAAC Steering Lead",
    designation: "Associate Professor",
    cluster: "Quality Assurance",
    initials: "VA",
  },
  {
    id: "f4",
    name: "Dr. Shankaragowda B B",
    role: "R&D Dean Nominee",
    designation: "Professor",
    cluster: "Research & Grants",
    initials: "SB",
  },
  {
    id: "f5",
    name: "Dr. Satish Kumar",
    role: "Curriculum & BOS Head",
    designation: "Associate Professor",
    cluster: "Autonomous Schemes",
    initials: "SK",
  },
  {
    id: "f6",
    name: "Dr. Mahesh G",
    role: "Industry Liaison Lead",
    designation: "Associate Professor",
    cluster: "Placements & Internships",
    initials: "MG",
  },
];

export default function Team() {
  return (
    <section className="team" id="leadership">
      <div className="team-inner">
        <RevealOnScroll className="team-header">
          <span className="section-eyebrow">// 04 — Academic Leadership</span>
          <h2 className="section-heading">
            Department council,
            <br />
            <span className="team-heading-ghost">driving excellence.</span>
          </h2>
          <p className="section-body team-sub">
            The faculty committee leaders overseeing autonomous curriculum design, research initiatives, NBA accreditation criteria, and transparent evaluation governance.
          </p>
        </RevealOnScroll>

        <GlyphDivider label="LEADERSHIP COUNCIL" />

        <div className="team-grid">
          {facultyLeadership.map((m, i) => (
            <RevealOnScroll key={m.id} delay={i * 60}>
              <article className="team-card card-hover" style={{ textAlign: "center" }}>
                <div className="member-avatar">
                  {m.initials}
                </div>
                <div className="team-info">
                  <span className="team-role">{m.role}</span>
                  <h3 className="team-name">{m.name}</h3>
                  <span className="team-year">{m.designation} · {m.cluster}</span>
                </div>
                <div className="team-card-line" aria-hidden="true" />
              </article>
            </RevealOnScroll>
          ))}
        </div>

        <div className="projects-more" style={{ marginTop: 32 }}>
          <Link href="/login" className="btn-secondary">
            View All Faculty Profiles in Portal
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
export { Team };
