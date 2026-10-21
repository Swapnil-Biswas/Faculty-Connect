"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    <section id="leadership" className="bg-[#F0F0F0] border-b-4 border-[#121212] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-14">
          <div className="inline-flex items-center gap-2 self-start bg-[#F0C020] text-[#121212] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-3.5 py-1 text-xs font-black tracking-widest uppercase">
            // 04 — ACADEMIC LEADERSHIP
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#121212] leading-[1.12]">
                DEPARTMENT COUNCIL,
                <br />
                <span className="text-[#1040C0]">DRIVING EXCELLENCE.</span>
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base font-medium text-[#424245] leading-relaxed">
                The faculty committee leaders overseeing autonomous curriculum design, research initiatives, NBA accreditation criteria, and transparent evaluation governance.
              </p>
            </div>
          </div>
        </div>

        {/* Leadership Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {facultyLeadership.map((m, idx) => {
            const roleBadgeBg =
              idx % 3 === 0 ? "bg-[#D02020] text-white" : idx % 3 === 1 ? "bg-[#1040C0] text-white" : "bg-[#F0C020] text-[#121212]";

            return (
              <article
                key={m.id}
                className="bg-white border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] p-7 sm:p-8 flex flex-col items-center text-center justify-between hover:-translate-y-1 transition-transform duration-200 min-h-[300px]"
              >
                {/* Circular Bauhaus Avatar with 4px border */}
                <div
                  className="w-20 h-20 rounded-full bg-[#121212] text-white border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212] flex items-center justify-center text-xl font-black mb-4 tracking-wider"
                  aria-hidden="true"
                >
                  {m.initials}
                </div>

                <div className="flex flex-col items-center gap-1.5 w-full">
                  {/* Role Badge */}
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 border-2 border-[#121212] mb-1 ${roleBadgeBg}`}
                  >
                    {m.role}
                  </span>

                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#121212]">
                    {m.name}
                  </h3>

                  <p className="text-xs font-bold text-[#424245] uppercase tracking-wide">
                    {m.designation}
                  </p>

                  <p className="text-xs font-semibold text-[#1040C0] uppercase tracking-wider">
                    {m.cluster}
                  </p>
                </div>

                {/* Bottom decorative bar */}
                <div className="w-12 h-1 bg-[#121212] mt-5" />
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-3 bg-[#121212] text-white border-3 sm:border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#D02020] px-8 sm:px-10 py-4 text-sm font-black tracking-wider uppercase transition-all duration-150"
          >
            <span>VIEW ALL FACULTY PROFILES IN PORTAL</span>
            <ArrowRight className="w-4 h-4" strokeWidth={3} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export { Team };
