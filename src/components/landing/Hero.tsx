"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative bg-[#F0F0F0] border-b-4 border-[#121212] overflow-hidden pt-20 sm:pt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Massive Constructivist Poster Typography & Actions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 self-start bg-[#F0C020] text-[#121212] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-3.5 py-1 text-xs sm:text-sm font-black tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#D02020]" />
            <span>ACADEMIC OS // EST. BMSIT CSE</span>
          </div>

          {/* Constructivist Display Headline */}
          <div className="flex flex-col gap-1">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[1.0] text-[#121212]">
              FACULTY.
            </h1>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[1.0] text-[#1040C0]">
              CONNECT.
            </h1>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[1.0] text-[#D02020]">
              EXCELLENCE.
            </h1>
          </div>

          {/* Subheading / Tagline */}
          <p className="text-base sm:text-lg font-medium text-[#121212] leading-relaxed max-w-2xl border-l-4 border-[#121212] pl-4 my-2">
            Intelligent Academic Data Synchronization &amp; Governance Engine. Enter teaching loads, research milestones, and mentorship records once — synchronize effortlessly for NBA, NAAC, NIRF &amp; annual appraisals.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href="/login"
              id="hero-enter-btn"
              className="inline-flex items-center gap-3 bg-[#D02020] text-white border-3 sm:border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#D02020]/90 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-black tracking-wider uppercase transition-all duration-150"
            >
              <span>ENTER WORKSPACE</span>
              <ArrowRight className="w-5 h-5" strokeWidth={3} />
            </Link>

            <Link
              href="#domains"
              id="hero-modules-btn"
              className="inline-flex items-center gap-3 bg-[#F0C020] text-[#121212] border-3 sm:border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#F0C020]/90 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-black tracking-wider uppercase transition-all duration-150"
            >
              <span>EXPLORE CLUSTERS</span>
            </Link>
          </div>

          {/* Teaser Highlight Box */}
          <div className="mt-4 bg-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] p-4 flex items-center justify-between max-w-xl">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#1040C0]" />
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#121212]">
                AY 2026-27 · FULL AUTONOMOUS VTU SCHEME
              </span>
            </div>
            <span className="text-xs font-black bg-[#E0E0E0] border border-[#121212] px-2 py-0.5 uppercase">
              TIER-1
            </span>
          </div>
        </div>

        {/* Right Column: Bauhaus Frame with Seamless Loop Video */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md sm:max-w-lg aspect-square bg-[#121212] border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] relative overflow-hidden flex flex-col justify-between">
            {/* The Video Element */}
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/api/video" type="video/mp4" />
              <source src="/hero-loop.mp4" type="video/mp4" />
            </video>

            {/* Top Bauhaus Header Overlay */}
            <div className="relative z-10 p-4 sm:p-5 flex items-center justify-start pointer-events-none">
              <div className="flex items-center gap-2 bg-[#121212]/90 backdrop-blur-sm border-2 border-white/80 px-2.5 py-1">
                <span className="w-3 h-3 rounded-full bg-[#D02020] animate-pulse" />
                <span className="w-3 h-3 bg-[#1040C0]" />
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#F0C020]" />
              </div>
            </div>

            {/* Bottom Bauhaus Caption Overlay */}
            <div className="relative z-10 bg-[#121212]/90 backdrop-blur-sm border-t-2 border-[#121212] px-4 sm:px-6 py-3 flex items-center justify-between text-white text-xs font-black uppercase tracking-widest pointer-events-none">
              <span className="text-[#F0C020]">FORM FOLLOWS FUNCTION</span>
              <span>1926 // 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Hero };
