"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#121212] text-white border-t-4 border-[#121212]" id="footer">
      {/* Bauhaus Geometric Color Strip Accent */}
      <div className="flex w-full h-2">
        <div className="w-1/3 bg-[#D02020]" />
        <div className="w-1/3 bg-[#1040C0]" />
        <div className="w-1/3 bg-[#F0C020]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-14">
          {/* Brand Column (2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-white" />
                <span className="w-4 h-4 bg-[#1040C0] border-2 border-white" />
                <div
                  className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#F0C020]"
                />
              </div>
              <span className="text-xl font-black uppercase tracking-tight text-white">
                FACULTY CONNECT
              </span>
            </Link>

            <p className="text-xs font-black text-[#F0C020] uppercase tracking-widest mt-1">
              ENTER ONCE. SYNC EVERYWHERE.
            </p>

            <p className="text-xs text-[#E0E0E0]/80 leading-relaxed max-w-sm">
              Department of Computer Science &amp; Engineering
              <br />
              BMS Institute of Technology &amp; Management
              <br />
              Autonomous Institution Affiliated to VTU · Bengaluru, Karnataka
            </p>
          </div>

          {/* Quick Portals */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#F0C020] mb-5 border-b-2 border-white/20 pb-2">
              PORTALS
            </p>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-wider text-[#E0E0E0]">
              <li><Link href="/login" className="hover:text-[#D02020] transition-colors">Faculty Workspace</Link></li>
              <li><Link href="/login" className="hover:text-[#D02020] transition-colors">Cluster Lead Hub</Link></li>
              <li><Link href="/login" className="hover:text-[#D02020] transition-colors">HOD Merit Review</Link></li>
              <li><Link href="/login" className="hover:text-[#D02020] transition-colors">Administrator OS</Link></li>
            </ul>
          </div>

          {/* Accreditation */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#F0C020] mb-5 border-b-2 border-white/20 pb-2">
              ACCREDITATION
            </p>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-wider text-[#E0E0E0]">
              <li><Link href="#resources" className="hover:text-[#D02020] transition-colors">NBA Tier-1 Criteria</Link></li>
              <li><Link href="#resources" className="hover:text-[#D02020] transition-colors">NAAC SSR Matrix</Link></li>
              <li><Link href="#resources" className="hover:text-[#D02020] transition-colors">NIRF Data Census</Link></li>
              <li><Link href="#resources" className="hover:text-[#D02020] transition-colors">VTU Autonomous BOS</Link></li>
            </ul>
          </div>

          {/* Academic Clusters */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#F0C020] mb-5 border-b-2 border-white/20 pb-2">
              ACADEMIC CLUSTERS
            </p>
            <ul className="space-y-3 text-xs font-bold uppercase tracking-wider text-[#E0E0E0]">
              <li><Link href="#domains" className="hover:text-[#D02020] transition-colors">Systems &amp; Cloud</Link></li>
              <li><Link href="#domains" className="hover:text-[#D02020] transition-colors">AI &amp; Data Science</Link></li>
              <li><Link href="#domains" className="hover:text-[#D02020] transition-colors">Cybersecurity</Link></li>
              <li><Link href="#domains" className="hover:text-[#D02020] transition-colors">IoT &amp; Embedded</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t-2 border-white/20 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-[#E0E0E0]/80">
          <div>
            © {year} BMS Institute of Technology &amp; Management (Department of CSE). All rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#D02020]" />
            <span className="font-bold tracking-widest uppercase text-white">
              SYSTEM OPERATIONAL · AUTONOMOUS VTU TIER-1
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
