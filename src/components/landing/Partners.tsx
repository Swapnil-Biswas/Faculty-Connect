"use client";

import { ArrowUpRight } from "lucide-react";

const institutionalPartners = [
  {
    id: "p1",
    name: "National Board of Accreditation",
    acronym: "NBA",
    badge: "TIER-1 AUTONOMOUS",
    accent: "#D02020",
    description: "Accredited CSE undergraduate programme under Washington Accord Tier-1 guidelines for autonomous institutions.",
    url: "https://www.nbaind.org",
  },
  {
    id: "p2",
    name: "National Assessment & Accreditation Council",
    acronym: "NAAC",
    badge: "GRADE 'A+' CERTIFIED",
    accent: "#1040C0",
    description: "Institutional Grade A+ recognition for academic excellence, state-of-the-art laboratory infrastructure, and research output.",
    url: "http://naac.gov.in",
  },
  {
    id: "p3",
    name: "Visvesvaraya Technological University",
    acronym: "VTU",
    badge: "AFFILIATED & AUTONOMOUS",
    accent: "#F0C020",
    description: "Autonomous degree-granting status under Visvesvaraya Technological University, Belagavi, Karnataka.",
    url: "https://vtu.ac.in",
  },
  {
    id: "p4",
    name: "All India Council for Technical Education",
    acronym: "AICTE",
    badge: "AICTE APPROVED",
    accent: "#121212",
    description: "Apex statutory regulatory body approving technical programmes, faculty cadre ratios, and institutional research labs.",
    url: "https://www.aicte-india.org",
  },
];

export default function Partners() {
  return (
    <section id="accreditations" className="bg-[#FFFFFF] border-b-4 border-[#121212] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col gap-4 mb-14">
          <div className="inline-flex items-center gap-2 self-start bg-[#1040C0] text-white border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-3.5 py-1 text-xs font-black tracking-widest uppercase">
            // BENCHMARKED BY
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#121212] leading-[1.12]">
                ACCREDITATIONS &amp;
                <br />
                <span className="text-[#D02020]">REGULATORY BODIES.</span>
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm sm:text-base font-medium text-[#424245] leading-relaxed">
                Adhering to strict statutory compliance guidelines set by apex accreditation authorities and state university bodies for autonomous colleges.
              </p>
            </div>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {institutionalPartners.map((p) => {
            const isYellow = p.accent === "#F0C020";
            return (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#F0F0F0] border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] p-6 lg:p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200 text-inherit no-underline min-h-[260px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-1 border-2 border-[#121212]"
                      style={{
                        backgroundColor: p.accent,
                        color: isYellow ? "#121212" : "#FFFFFF",
                      }}
                    >
                      {p.badge}
                    </span>
                    <div className="w-7 h-7 bg-white border-2 border-[#121212] flex items-center justify-center group-hover:bg-[#F0C020] transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#121212]" strokeWidth={3} />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#121212] mb-2 leading-snug group-hover:text-[#D02020] transition-colors">
                    {p.name} ({p.acronym})
                  </h3>

                  <p className="text-xs sm:text-[13px] font-medium text-[#424245] leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t-2 border-[#121212] flex items-center justify-between text-xs font-black uppercase tracking-wider text-[#121212]">
                  <span>OFFICIAL PORTAL</span>
                  <span className="w-2 h-2 rounded-full bg-[#121212]" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export { Partners };
