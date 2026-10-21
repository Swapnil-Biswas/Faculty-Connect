"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface FacultyResearchProject {
  id: string;
  category: "all" | "grants" | "patents" | "scopus" | "consultancy";
  status: "verified" | "wip" | "concept";
  title: string;
  description: string;
  tags: string[];
  investigator: string;
  year: string;
  fundingAgency?: string;
  amount?: string;
}

const CATEGORIES = [
  { key: "all", label: "ALL WORKS" },
  { key: "grants", label: "FUNDED GRANTS" },
  { key: "patents", label: "PATENTS" },
  { key: "scopus", label: "SCOPUS / WOS" },
  { key: "consultancy", label: "INDUSTRY CONSULTANCY" },
];

const FEATURED_RESEARCH: FacultyResearchProject[] = [
  {
    id: "r1",
    category: "grants",
    status: "verified",
    title: "AI-Assisted Autonomous Drone Surveillance for Rural Infrastructure",
    description: "Multi-spectral computer vision pipeline deployed on NVIDIA edge devices for real-time fault detection in high-voltage transmission lines.",
    tags: ["VGST K-FIST", "EDGE AI", "COMPUTER VISION", "₹20,00,000"],
    investigator: "Dr. Anupama H S / Dr. BHARATHI M A",
    year: "AY 2025-26",
    fundingAgency: "Govt of Karnataka VGST",
  },
  {
    id: "r2",
    category: "patents",
    status: "verified",
    title: "Method & Apparatus for Low-Power Cryptographic Key Exchange in IoT",
    description: "Published Indian Patent (App No. 202441089212) on lightweight lattice-based post-quantum cryptography for resource-constrained microcontrollers.",
    tags: ["INDIAN PATENT", "POST-QUANTUM", "IOT SECURITY", "PUBLISHED"],
    investigator: "Dr. Vidya A / Dr. Satish Kumar",
    year: "AY 2025-26",
  },
  {
    id: "r3",
    category: "scopus",
    status: "verified",
    title: "Transformer-based Explainable Predictive Modeling in Clinical Diagnostics",
    description: "Published in IEEE Transactions on Medical Imaging (Q1 Journal, Impact Factor: 10.6). Proposes novel attention head regularization for CT scans.",
    tags: ["IEEE TRANS", "Q1 JOURNAL", "EXPLAINABLE AI", "CITATIONS: 42"],
    investigator: "Dr. Shankaragowda B B / Dr. Archana",
    year: "AY 2025-26",
  },
  {
    id: "r4",
    category: "consultancy",
    status: "wip",
    title: "Enterprise Distributed Ledger for Cross-Border Supply Chain Compliance",
    description: "Industry sponsored consultancy project developing a zero-knowledge proof verification engine for logistics audit compliance.",
    tags: ["INDUSTRY SPONSORED", "ZERO KNOWLEDGE", "HYPERLEDGER", "₹8,50,000"],
    investigator: "Dr. Mahesh G / Dr. Rajesh K",
    year: "AY 2026-27",
  },
];

export default function Projects() {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? FEATURED_RESEARCH
      : FEATURED_RESEARCH.filter((p) => p.category === filter);

  return (
    <section id="research" className="bg-[#FFFFFF] border-b-4 border-[#121212] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-12">
          <div className="inline-flex items-center gap-2 self-start bg-[#1040C0] text-white border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-3.5 py-1 text-xs font-black tracking-widest uppercase">
            // 03 — SCHOLARLY OUTPUTS
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#121212] leading-[1.12]">
                RESEARCH &amp; PATENTS,
                <br />
                <span className="text-[#D02020]">AUDITED &amp; INDEXED.</span>
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base font-medium text-[#424245] leading-relaxed">
                All publications, sponsored grants, patents, and consultancy projects are verified by cluster heads and automatically compiled for NIRF &amp; NBA Criterion 5.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-10" role="tablist">
          {CATEGORIES.map((c) => {
            const isActive = filter === c.key;
            return (
              <button
                key={c.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(c.key)}
                id={`filter-${c.key}`}
                className={`text-xs font-black uppercase tracking-wider px-4 sm:px-5 py-2.5 border-2 border-[#121212] transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-[#D02020] text-white shadow-[3px_3px_0px_0px_#121212]"
                    : "bg-[#F0F0F0] text-[#121212] hover:bg-[#E0E0E0] shadow-[2px_2px_0px_0px_#121212]"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Research Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((p, idx) => {
            const accentColor =
              idx % 3 === 0 ? "#D02020" : idx % 3 === 1 ? "#1040C0" : "#F0C020";

            return (
              <article
                key={p.id}
                className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-7 sm:p-8 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200 relative min-h-[300px]"
              >
                {/* Geometric corner decoration */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {idx % 3 === 0 ? (
                    <div className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-[#121212]" />
                  ) : idx % 3 === 1 ? (
                    <div className="w-4 h-4 bg-[#1040C0] border-2 border-[#121212]" />
                  ) : (
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#F0C020]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider bg-[#121212] text-white px-2.5 py-1">
                      {p.status === "verified" ? "● VERIFIED & INDEXED" : "○ IN PROGRESS"}
                    </span>
                    <span className="text-xs font-bold text-[#424245] uppercase">
                      {p.year}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#121212] mb-3 leading-snug">
                    {p.title}
                  </h3>

                  <p className="text-sm font-medium text-[#424245] leading-relaxed mb-6">
                    {p.description}
                  </p>
                </div>

                <div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {p.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-black uppercase tracking-wider bg-[#F0F0F0] border border-[#121212] px-2.5 py-1 text-[#121212]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t-2 border-[#121212] flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#121212] truncate max-w-[280px]">
                      {p.investigator}
                    </span>
                    <span
                      className="w-3 h-3 border border-[#121212]"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-3 bg-[#F0C020] text-[#121212] border-3 sm:border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#F0C020]/90 px-8 sm:px-10 py-4 text-sm font-black tracking-wider uppercase transition-all duration-150"
          >
            <span>ACCESS RESEARCH REPOSITORY</span>
            <ArrowRight className="w-4 h-4" strokeWidth={3} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export { Projects };
