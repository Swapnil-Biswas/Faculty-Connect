import Image from "next/image";
import facultySessionImg from "./faculty_session.jpg";

export default function About() {
  return (
    <section id="about" className="bg-[#FFFFFF] border-b-4 border-[#121212] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 self-start bg-[#1040C0] text-white border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-3.5 py-1 text-xs font-black tracking-widest uppercase">
              // 01 — MISSION &amp; VISION
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#121212] leading-[1.12]">
              INTELLIGENT ACADEMIC
              <br />
              DATA GOVERNANCE.
              <br />
              <span className="text-[#D02020]">BUILT FOR FACULTY.</span>
            </h2>

            <p className="text-base sm:text-lg font-medium text-[#121212] leading-relaxed">
              Faculty-Connect is the unified academic operating system for BMS Institute of Technology &amp; Management (Department of Computer Science &amp; Engineering). It replaces fragmented spreadsheets, manual appraisal binders, and ad-hoc accreditation audits with real-time institutional synchrony.
            </p>

            <p className="text-sm sm:text-base font-normal text-[#424245] leading-relaxed">
              Input teaching loads, research publications, student mentoring, and departmental service milestones once. Our deterministic engine maps every outcome to NBA Criterion 4 &amp; 5, NAAC SSR metrics, NIRF rankings, and annual merit evaluations without duplicate paperwork.
            </p>
          </div>

          {/* Right Image Column with Bauhaus Frame & Grayscale */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-[4/3] w-full bg-[#121212] border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] overflow-hidden group">
              <Image
                src={facultySessionImg}
                alt="BMSIT Faculty Council Session"
                className="w-full h-full object-cover grayscale contrast-125 transition-all duration-300 group-hover:grayscale-0 group-hover:contrast-100"
                placeholder="blur"
              />
              <div className="absolute top-0 right-0 bg-[#F0C020] border-b-2 border-l-2 border-[#121212] px-3.5 py-1 text-[11px] font-black uppercase text-[#121212]">
                ARCHIVE // BMSIT CSE
              </div>
            </div>

            <div className="bg-[#F0F0F0] border-2 border-[#121212] p-3.5 flex items-center justify-between shadow-[3px_3px_0px_0px_#121212]">
              <span className="text-xs font-black uppercase text-[#121212]">
                FIG. 02 — ACADEMIC GOVERNANCE
              </span>
              <span className="text-xs font-bold text-[#D02020] uppercase">
                BENGALURU, KA
              </span>
            </div>
          </div>
        </div>

        {/* Three Bauhaus Constructivist Pillars spanning full width */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 mt-12 border-t-2 border-[#121212]/15">
          <div className="bg-[#F0F0F0] border-3 border-[#121212] p-6 sm:p-7 shadow-[4px_4px_0px_0px_#121212] flex flex-col gap-3 relative">
            <span className="w-8 h-8 bg-[#D02020] text-white font-black text-xs flex items-center justify-center border-2 border-[#121212]">
              01
            </span>
            <h4 className="text-base font-black uppercase text-[#121212] leading-snug">
              Enter Once, Sync Everywhere
            </h4>
            <p className="text-sm font-medium text-[#424245] leading-relaxed">
              Milestones automatically map to NBA, NAAC, and annual appraisal files without duplicate entries.
            </p>
          </div>

          <div className="bg-[#F0F0F0] border-3 border-[#121212] p-6 sm:p-7 shadow-[4px_4px_0px_0px_#121212] flex flex-col gap-3 relative">
            <span className="w-8 h-8 bg-[#1040C0] text-white font-black text-xs flex items-center justify-center border-2 border-[#121212]">
              02
            </span>
            <h4 className="text-base font-black uppercase text-[#121212] leading-snug">
              Transparent Merit Scoring
            </h4>
            <p className="text-sm font-medium text-[#424245] leading-relaxed">
              Audited recognition engine based on published criteria, verifiable outcomes, and objective rubrics.
            </p>
          </div>

          <div className="bg-[#F0F0F0] border-3 border-[#121212] p-6 sm:p-7 shadow-[4px_4px_0px_0px_#121212] flex flex-col gap-3 relative">
            <span className="w-8 h-8 bg-[#F0C020] text-[#121212] font-black text-xs flex items-center justify-center border-2 border-[#121212]">
              03
            </span>
            <h4 className="text-base font-black uppercase text-[#121212] leading-snug">
              Accreditation Autopilot
            </h4>
            <p className="text-sm font-medium text-[#424245] leading-relaxed">
              Instant SAR tables, course outcome attainment matrices, and statutory compliance ledgers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export { About };
