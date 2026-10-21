"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "ABOUT", href: "#about" },
  { label: "MILESTONES", href: "#events" },
  { label: "RESEARCH", href: "#research" },
  { label: "LEADERSHIP", href: "#leadership" },
  { label: "RESOURCES", href: "#resources" },
  { label: "CLUSTERS", href: "#domains" },
  { label: "ACCREDITATIONS", href: "#accreditations" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-200">
      <div className="max-w-7xl mx-auto pointer-events-auto bg-[#F0F0F0]/95 backdrop-blur-md border-3 sm:border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Bauhaus Geometric Logo */}
        <Link href="/" className="flex items-center gap-3 group" id="header-logo">
          {/* Trio of Bauhaus Primaries */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-5 h-5 rounded-full bg-[#D02020] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212]" />
            <span className="w-5 h-5 bg-[#1040C0] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212]" />
            <div
              className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-[#F0C020] drop-shadow-[2px_2px_0px_#121212]"
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black uppercase tracking-tight text-[#121212]">
              FACULTY CONNECT
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[#121212]/70 uppercase">
              BMSIT CSE // AUTONOMOUS
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6" id="header-nav">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-black uppercase tracking-widest text-[#121212] hover:text-[#D02020] hover:underline underline-offset-4 decoration-2 transition-colors"
              id={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="inline-flex items-center bg-[#D02020] text-white border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#D02020]/90 px-5 py-2.5 text-xs font-black tracking-widest uppercase transition-all duration-150"
            id="nav-login"
          >
            SIGN IN
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 bg-[#F0C020] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {mobileOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="max-w-7xl mx-auto pointer-events-auto mt-2 bg-[#F0F0F0] border-3 sm:border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] px-6 py-6 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-black uppercase tracking-wider text-[#121212] py-2 border-b-2 border-[#121212]/15 hover:text-[#D02020]"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="mt-3 text-center bg-[#D02020] text-white border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none py-3 text-xs font-black tracking-widest uppercase"
            onClick={() => setMobileOpen(false)}
          >
            SIGN IN TO WORKSPACE
          </Link>
        </div>
      )}
    </header>
  );
}

export { Header };
