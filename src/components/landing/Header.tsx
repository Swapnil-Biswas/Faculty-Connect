"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="header"
      style={{
        borderBottomColor: scrolled ? "var(--grey-100)" : "transparent",
      }}
    >
      {/* Logo */}
      <Link href="/" className="header-logo" id="header-logo">
        <span className="header-logo-cc">FC</span>
        <span className="header-logo-text">FACULTY CONNECT</span>
      </Link>

      {/* Desktop Nav */}
      <nav className="header-nav" id="header-nav">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="header-nav-link"
            id={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/login" className="header-cta" id="nav-login">
          SIGN IN
        </Link>
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        id="mobile-menu-toggle"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {mobileOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            top: "var(--header-height)",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "48px",
            gap: "8px",
            zIndex: 99,
            animation: "fadeIn 0.3s ease forwards",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="header-nav-link"
              onClick={() => setMobileOpen(false)}
              style={{ fontSize: "15px", padding: "12px 32px" }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="btn-primary"
            onClick={() => setMobileOpen(false)}
            style={{ marginTop: "16px" }}
          >
            SIGN IN
          </Link>
        </div>
      )}
    </header>
  );
}
export { Header };
