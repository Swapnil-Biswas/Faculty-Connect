"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="footer-glyph-strip" aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
      </div>

      <div className="footer-top">
        {/* Brand */}
        <div className="footer-brand">
          <Link href="/" className="footer-brand-logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="#1d1d1f" />
              <text
                x="50%"
                y="54%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
              >
                FC
              </text>
            </svg>
            <span className="footer-brand-name">Faculty-Connect</span>
          </Link>
          <span className="footer-brand-tagline">
            Enter Once. Sync Everywhere.
          </span>
          <span className="footer-brand-meta">
            Department of CSE · BMSIT &amp; M · Bengaluru, IN
          </span>
        </div>

        {/* Quick Links */}
        <div>
          <p className="footer-col-title">Portals</p>
          <ul className="footer-col-list">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/login">Faculty Workspace</Link></li>
            <li><Link href="/login">Cluster Lead Hub</Link></li>
            <li><Link href="/login">HOD Merit Review</Link></li>
            <li><Link href="/login">Administrator OS</Link></li>
          </ul>
        </div>

        {/* Accreditation */}
        <div>
          <p className="footer-col-title">Accreditation</p>
          <ul className="footer-col-list">
            <li><Link href="#resources">NBA Tier-1 Criteria</Link></li>
            <li><Link href="#resources">NAAC SSR Matrix</Link></li>
            <li><Link href="#resources">NIRF Data Census</Link></li>
            <li><Link href="#resources">VTU Autonomous Scheme</Link></li>
          </ul>
        </div>

        {/* Clusters */}
        <div>
          <p className="footer-col-title">Academic Clusters</p>
          <ul className="footer-col-list">
            <li><Link href="#domains">Systems &amp; Cloud</Link></li>
            <li><Link href="#domains">AI &amp; Data Science</Link></li>
            <li><Link href="#domains">Cybersecurity</Link></li>
            <li><Link href="#domains">IoT &amp; Embedded</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © {year} BMS Institute of Technology &amp; Management (Department of CSE). All rights reserved.
        </span>
        <span className="footer-status-pill">
          <span className="footer-status-dot" />
          SYSTEM OPERATIONAL · AUTONOMOUS VTU TIER-1
        </span>
      </div>
    </footer>
  );
}
export { Footer };
