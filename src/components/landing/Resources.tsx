"use client";

import { useState } from "react";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import GlyphDivider from "@/components/ui/GlyphDivider";

interface ComplianceResource {
  title: string;
  kind: string;
  level: "Mandatory" | "Recommended" | "Audit";
  format: string;
  blurb: string;
  link: string;
  glyph: string;
}

const groups: { tag: string; items: ComplianceResource[] }[] = [
  {
    tag: "NBA Tier-1",
    items: [
      {
        title: "Criterion 4: Students' Performance & Outcomes Assessment",
        kind: "SAR Manual",
        level: "Mandatory",
        format: "NBA 2026 Guidelines · 100 Marks",
        blurb: "Methods for calculating direct and indirect CO-PO attainment levels with target benchmarking.",
        link: "https://www.nbaind.org",
        glyph: "1100",
      },
      {
        title: "Criterion 5: Faculty Information & Contributions (SFR & FSR)",
        kind: "Compliance",
        level: "Mandatory",
        format: "Autonomous Tier-1 Metric · 200 Marks",
        blurb: "Faculty Student Ratio (1:20 mandatory), Cadre Ratio, retention rates, and Ph.D. qualification scores.",
        link: "https://www.nbaind.org",
        glyph: "1110",
      },
    ],
  },
  {
    tag: "NAAC Criteria",
    items: [
      {
        title: "Criterion 2: Teaching-Learning and Evaluation",
        kind: "SSR Framework",
        level: "Mandatory",
        format: "NAAC Manual · 350 Weightage",
        blurb: "Continuous Internal Evaluation (CIE), experiential learning, and student-centric mentoring records.",
        link: "http://naac.gov.in",
        glyph: "1011",
      },
      {
        title: "Criterion 3: Research, Innovations and Extension",
        kind: "Research Metric",
        level: "Mandatory",
        format: "NAAC Manual · 120 Weightage",
        blurb: "Ecosystem for innovations, seed money grants, research publications in UGC-CARE / Scopus.",
        link: "http://naac.gov.in",
        glyph: "0110",
      },
    ],
  },
  {
    tag: "NIRF Metrics",
    items: [
      {
        title: "RPC: Research and Professional Practice",
        kind: "National Metric",
        level: "Audit",
        format: "MoE NIRF 2026 Ranking · 100 Marks",
        blurb: "Combined metric for publications (PU), quality of publications (QP), patents (IPR), and funded projects (FPHP).",
        link: "https://www.nirfindia.org",
        glyph: "0101",
      },
      {
        title: "TLR: Teaching, Learning & Resources",
        kind: "National Metric",
        level: "Mandatory",
        format: "MoE NIRF 2026 Ranking · 100 Marks",
        blurb: "Student strength including doctoral students, faculty-student ratio with emphasis on permanent faculty.",
        link: "https://www.nirfindia.org",
        glyph: "1001",
      },
    ],
  },
  {
    tag: "Autonomous VTU",
    items: [
      {
        title: "Autonomous Examination & Grading Regulations",
        kind: "Statute",
        level: "Mandatory",
        format: "BMSIT Autonomous Statute · NEP 2020",
        blurb: "Guidelines for continuous assessment, relative grading, make-up exams, and grade moderation panels.",
        link: "https://vtu.ac.in",
        glyph: "0010",
      },
      {
        title: "Curriculum Framework & BOS Guidelines",
        kind: "Regulation",
        level: "Recommended",
        format: "AICTE / VTU Model Curriculum",
        blurb: "Credit distribution across basic sciences, engineering core, professional electives, and capstones.",
        link: "https://vtu.ac.in",
        glyph: "1111",
      },
    ],
  },
];

export default function Resources() {
  const [active, setActive] = useState<string>(groups[0].tag);
  const visible = groups.find((g) => g.tag === active) ?? groups[0];

  return (
    <section className="resources" id="resources">
      <div className="resources-inner">
        <RevealOnScroll className="resources-header">
          <span className="section-eyebrow">// 05 — Compliance Repository</span>
          <h2 className="section-heading">
            Accreditation standards
            <br />
            <span className="resources-heading-ghost">at your fingertips.</span>
          </h2>
          <p className="section-body resources-sub">
            Direct references, calculation manuals, and scoring rubrics for NBA Tier-1, NAAC Cycle-2, NIRF India Rankings, and Autonomous VTU statutes.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <div className="resources-tabs" role="tablist">
            {groups.map((g) => (
              <button
                key={g.tag}
                role="tab"
                aria-selected={active === g.tag}
                className={`resources-tab ${active === g.tag ? "is-active" : ""}`}
                onClick={() => setActive(g.tag)}
                id={`resource-tab-${g.tag.toLowerCase().replace(/[\s-]/g, "")}`}
              >
                {active === g.tag && (
                  <span className="resources-tab-led" aria-hidden="true" />
                )}
                {g.tag}
              </button>
            ))}
          </div>
        </RevealOnScroll>

        <GlyphDivider variant="compact" />

        <div className="resources-list" key={active}>
          {visible.items.map((r, i) => (
            <a
              key={r.title}
              href={r.link}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-row"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="resource-glyph" aria-hidden="true">
                <span>{r.glyph}</span>
                <div className="resource-glyph-bars">
                  {r.glyph.split("").map((bit, k) => (
                    <span
                      key={k}
                      className={`resource-glyph-bar ${bit === "1" ? "is-on" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <div className="resource-content">
                <div className="resource-top">
                  <span className="resource-kind">{r.kind}</span>
                  <span className={`resource-level level-${r.level.toLowerCase()}`}>
                    {r.level}
                  </span>
                </div>
                <h3 className="resource-title">{r.title}</h3>
                <p className="resource-blurb">{r.blurb}</p>
                <span className="resource-format">{r.format}</span>
              </div>
              <div className="resource-arrow" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
export { Resources };
