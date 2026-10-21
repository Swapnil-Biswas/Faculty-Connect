"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Calendar, MapPin, ArrowRight } from "lucide-react";

interface AcademicMilestone {
  id: string;
  title: string;
  category: string;
  venue: string;
  dateStr: string;
  description: string;
  status: "upcoming" | "active" | "completed";
  deliverables: string[];
}

const ACADEMIC_MILESTONES: AcademicMilestone[] = [
  {
    id: "m1",
    title: "NBA Tier-1 Autonomous Audit Cycle",
    category: "Accreditation",
    venue: "CSE Seminar Hall 1",
    dateStr: "OCT 26 - 28, 2026",
    description: "Final institutional verification of Course Outcome attainments, Program Outcomes direct assessment, and faculty publication repositories for Criterion 4 & 5.",
    status: "upcoming",
    deliverables: ["SAR Criterion 4 Dossier", "Student Attainment Ledgers", "Cadre Ratio Verification"],
  },
  {
    id: "m2",
    title: "Annual Faculty Merit & Research Appraisal",
    category: "Evaluation",
    venue: "Dean Academic Office",
    dateStr: "NOV 02 - 05, 2026",
    description: "Self-appraisal review, peer teaching evaluations, student feedback indices, and research grants verification conducted through the recognition engine.",
    status: "upcoming",
    deliverables: ["Merit Star Calculations", "Peer Review Summaries", "Scopus Publications Audit"],
  },
  {
    id: "m3",
    title: "NIRF Research & Consultancy Census",
    category: "Compliance",
    venue: "Main Board Room",
    dateStr: "NOV 12 - 15, 2026",
    description: "Cross-departmental indexing of Scopus/WoS journal publications, patents granted, and sponsored consultancy projects for national rankings.",
    status: "upcoming",
    deliverables: ["IPR Dossiers", "External Funding Proofs", "Ph.D. Scholar Graduations"],
  },
  {
    id: "m4",
    title: "VTU Curriculum Revision & BOS Meet",
    category: "Governance",
    venue: "BMSIT Conference Center",
    dateStr: "OCT 14 - 15, 2026",
    description: "Curriculum structuring for autonomous 2026-27 scheme aligning with AICTE guidelines, industry advisory feedback, and NEP 2020 frameworks.",
    status: "completed",
    deliverables: ["Scheme Draft 2026", "Elective Basket Approvals", "Lab Syllabus Revisions"],
  },
];

export default function Events() {
  const [openId, setOpenId] = useState<string>("m1");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? "" : id));
  };

  return (
    <section id="events" className="bg-[#F0F0F0] border-b-4 border-[#121212] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-14">
          <div className="inline-flex items-center gap-2 self-start bg-[#D02020] text-white border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-3.5 py-1 text-xs font-black tracking-widest uppercase">
            // 02 — INSTITUTIONAL MILESTONES
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#121212] leading-[1.12]">
                ACCREDITATION &amp;
                <br />
                <span className="text-[#1040C0]">GOVERNANCE SCHEDULE.</span>
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base font-medium text-[#424245] leading-relaxed">
                Synchronized calendar of critical academic governance deadlines, NBA compliance milestones, research appraisal cycles, and autonomous BOS reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Bauhaus Accordion List */}
        <div className="flex flex-col gap-6">
          {ACADEMIC_MILESTONES.map((ev) => {
            const isOpen = openId === ev.id;
            return (
              <div
                key={ev.id}
                className="border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] transition-all duration-200"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggle(ev.id)}
                  aria-expanded={isOpen}
                  className={`w-full text-left p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer transition-colors duration-200 ${
                    isOpen ? "bg-[#D02020] text-white" : "bg-white text-[#121212] hover:bg-[#F0F0F0]"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <span
                      className={`text-xs font-black uppercase tracking-wider px-3 py-1 border-2 border-[#121212] ${
                        isOpen ? "bg-[#F0C020] text-[#121212]" : "bg-[#1040C0] text-white"
                      }`}
                    >
                      {ev.category}
                    </span>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-black uppercase tracking-tight">
                      {ev.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wider">
                      <Calendar className="w-4 h-4" />
                      <span>{ev.dateStr}</span>
                    </div>

                    <div
                      className={`w-8 h-8 rounded-none border-2 border-[#121212] flex items-center justify-center transition-transform duration-200 ${
                        isOpen ? "bg-white text-[#121212] rotate-180" : "bg-[#F0C020] text-[#121212]"
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" strokeWidth={3} />
                    </div>
                  </div>
                </button>

                {/* Expanded Content: Light Yellow background (#FFF9C4), black text, border-t-4 black */}
                {isOpen && (
                  <div className="bg-[#FFF9C4] text-[#121212] border-t-4 border-[#121212] p-6 sm:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 flex flex-col gap-4">
                        <p className="text-base font-medium leading-relaxed">
                          {ev.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm font-bold text-[#121212]">
                          <MapPin className="w-4 h-4 text-[#D02020]" />
                          <span>VENUE: {ev.venue}</span>
                        </div>
                      </div>

                      <div className="lg:col-span-4 bg-white border-2 border-[#121212] p-5 shadow-[4px_4px_0px_0px_#121212] flex flex-col gap-3">
                        <span className="text-xs font-black uppercase tracking-wider text-[#1040C0]">
                          KEY DELIVERABLES
                        </span>
                        <ul className="space-y-2">
                          {ev.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs font-bold text-[#121212]">
                              <span className="w-2 h-2 rounded-full bg-[#D02020]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>

                        <Link
                          href="/login"
                          className="mt-3 inline-flex items-center justify-center gap-2 bg-[#D02020] text-white border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#D02020]/90 py-2.5 px-4 text-xs font-black uppercase tracking-wider transition-all duration-150"
                        >
                          <span>VERIFY IN PORTAL</span>
                          <ArrowRight className="w-4 h-4" strokeWidth={3} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { Events };
