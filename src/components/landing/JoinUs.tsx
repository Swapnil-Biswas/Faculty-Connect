"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function JoinUs() {
  return (
    <section
      id="portal-access"
      className="bg-[#F0C020] border-b-4 border-[#121212] py-16 sm:py-24 lg:py-28 relative overflow-hidden text-[#121212]"
    >
      {/* Subtle Bauhaus decorative geometric corner accents (contained and responsive) */}
      <div
        className="absolute top-6 left-6 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#D02020] opacity-25 border-4 border-[#121212] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-6 right-6 w-24 h-24 sm:w-32 sm:h-32 bg-[#1040C0] opacity-25 border-4 border-[#121212] rotate-12 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-8 sm:p-12 lg:p-14 flex flex-col items-center text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-[#121212] text-white px-3.5 py-1.5 text-xs font-black tracking-widest uppercase mb-6 shadow-[2px_2px_0px_0px_#121212]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D02020]" />
            <span>ENTERPRISE IDENTITY FEDERATION // SSO</span>
          </div>

          {/* Heading with generous line-height to prevent text collision */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#121212] leading-[1.12] mb-5">
            READY TO MANAGE YOUR
            <br />
            <span className="text-[#D02020]">ACADEMIC PORTFOLIO?</span>
          </h2>

          {/* Subheading with relaxed line-height */}
          <p className="text-sm sm:text-base lg:text-lg font-medium text-[#424245] leading-relaxed max-w-2xl mx-auto mb-8">
            Submit teaching loads, journal publications, and consultancy records with real-time automated validation and merit index computation.
          </p>

          {/* Action button container with generous vertical breathing room */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-3 bg-[#D02020] text-white border-3 sm:border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#D02020]/90 px-8 sm:px-10 py-4 text-sm sm:text-base font-black tracking-wider uppercase transition-all duration-150"
            >
              <span>SIGN IN WITH INSTITUTIONAL SSO</span>
              <ArrowRight className="w-5 h-5" strokeWidth={3} />
            </Link>
          </div>

          {/* Bottom security strip with border and clean spacing */}
          <div className="w-full pt-6 border-t-2 border-[#121212] flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold uppercase tracking-wider text-[#121212]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1040C0]" strokeWidth={2.5} />
              <span>VTU ENCLAVE AUTH</span>
            </div>
            <span className="text-[#121212]/30 font-black">·</span>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#D02020]" strokeWidth={2.5} />
              <span>256-BIT ENCRYPTION</span>
            </div>
            <span className="text-[#121212]/30 font-black">·</span>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" strokeWidth={2.5} />
              <span>AUDITED MERIT ENGINE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { JoinUs };
