"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

interface ComplianceResource {
  title: string;
  kind: string;
  level: "Mandatory" | "Recommended" | "Audit";
  format: string;
  blurb: string;
  link: string;
}

const groups: { tag: string; items: ComplianceResource[] }[] = [
  {
    tag: "NBA TIER-1",
    items: [
      {
        title: "Criterion 4: Students' Performance & Outcomes Assessment",
        kind: "SAR MANUAL",
        level: "Mandatory",
        format: "NBA 2026 Guidelines · 100 Marks",
        blurb: "Methods for calculating direct and indirect CO-PO attainment levels with target benchmarking.",
        link: "https://www.nbaind.org",
      },
      {
        title: "Criterion 5: Faculty Information & Contributions (SFR & FSR)",
        kind: "COMPLIANCE",
        level: "Mandatory",
        format: "Autonomous Tier-1 Metric · 200 Marks",
        blurb: "Faculty Student Ratio (1:20 mandatory), Cadre Ratio, retention rates, and Ph.D. qualification scores.",
        link: "https://www.nbaind.org",
      },
    ],
  },
  {
    tag: "NAAC CRITERIA",
    items: [
      {
        title: "Criterion 2: Teaching-Learning and Evaluation",
        kind: "SSR FRAMEWORK",
        level: "Mandatory",
        format: "NAAC Manual · 350 Weightage",
        blurb: "Continuous Internal Evaluation (CIE), experiential learning, and student-centric mentoring records.",
        link: "http://naac.gov.in",
      },
      {
        title: "Criterion 3: Research, Innovations and Extension",
        kind: "RESEARCH METRIC",
        level: "Mandatory",
        format: "NAAC Manual · 120 Weightage",
        blurb: "Ecosystem for innovations, seed money grants, research publications in UGC-CARE / Scopus.",
        link: "http://naac.gov.in",
      },
    ],
  },
  {
    tag: "NIRF METRICS",
    items: [
      {
        title: "RPC: Research and Professional Practice",
        kind: "NATIONAL METRIC",
        level: "Audit",
        format: "MoE NIRF 2026 Ranking · 100 Marks",
        blurb: "Combined metric for publications (PU), quality of publications (QP), patents (IPR), and funded projects (FPHP).",
        link: "https://www.nirfindia.org",
      },
      {
        title: "TLR: Teaching, Learning & Resources",
        kind: "NATIONAL METRIC",
        level: "Mandatory",
        format: "MoE NIRF 2026 Ranking · 100 Marks",
        blurb: "Student strength including doctoral students, faculty-student ratio with emphasis on permanent faculty.",
        link: "https://www.nirfindia.org",
      },
    ],
  },
  {
    tag: "AUTONOMOUS VTU",
    items: [
      {
        title: "Autonomous Examination & Grading Regulations",
        kind: "STATUTE",
        level: "Mandatory",
        format: "BMSIT Autonomous Statute · NEP 2020",
        blurb: "Guidelines for continuous assessment, relative grading, make-up exams, and grade moderation panels.",
        link: "https://vtu.ac.in",
      },
      {
        title: "Curriculum Framework & BOS Guidelines",
        kind: "REGULATION",
        level: "Recommended",
        format: "AICTE / VTU Model Curriculum",
        blurb: "Credit distribution across basic sciences, engineering core, professional electives, and capstones.",
        link: "https://vtu.ac.in",
      },
    ],
  },
];

export default function Resources() {
  const [active, setActive] = useState<string>(groups[0].tag);
  const visible = groups.find((g) => g.tag === active) ?? groups[0];

  return (
    <section id="resources" className="bg-[#FFFFFF] border-b-4 border-[#121212] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="inline-flex items-center gap-2 self-start bg-[#1040C0] text-white border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-3.5 py-1 text-xs font-black tracking-widest uppercase">
            // 05 — COMPLIANCE REPOSITORY
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#121212] leading-[1.12]">
                ACCREDITATION STANDARDS
                <br />
                <span className="text-[#D02020]">AT YOUR FINGERTIPS.</span>
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base font-medium text-[#424245] leading-relaxed">
                Direct references, calculation manuals, and scoring rubrics for NBA Tier-1, NAAC Cycle-2, NIRF India Rankings, and Autonomous VTU statutes.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-10" role="tablist">
          {groups.map((g) => {
            const isActive = active === g.tag;
            return (
              <button
                key={g.tag}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(g.tag)}
                className={`text-xs font-black uppercase tracking-wider px-5 py-3 border-2 border-[#121212] transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#D02020] text-white shadow-[4px_4px_0px_0px_#121212]"
                    : "bg-[#F0F0F0] text-[#121212] hover:bg-[#E0E0E0] shadow-[2px_2px_0px_0px_#121212]"
                }`}
              >
                {g.tag}
              </button>
            );
          })}
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visible.items.map((r, idx) => {
            const badgeBg =
              idx % 2 === 0 ? "bg-[#1040C0] text-white" : "bg-[#F0C020] text-[#121212]";

            return (
              <a
                key={r.title}
                href={r.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#F0F0F0] border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] p-7 sm:p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200 relative text-inherit no-underline min-h-[260px]"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 border-2 border-[#121212] ${badgeBg}`}>
                      {r.kind}
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider bg-[#121212] text-white px-2.5 py-0.5">
                      {r.level}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#121212] mb-3 group-hover:text-[#D02020] transition-colors leading-snug">
                    {r.title}
                  </h3>

                  <p className="text-sm font-medium text-[#424245] leading-relaxed mb-6">
                    {r.blurb}
                  </p>
                </div>

                <div className="pt-4 border-t-2 border-[#121212] flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-[#121212]">
                    {r.format}
                  </span>
                  <div className="w-8 h-8 bg-white border-2 border-[#121212] flex items-center justify-center group-hover:bg-[#F0C020] transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-[#121212]" strokeWidth={3} />
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { Resources };
