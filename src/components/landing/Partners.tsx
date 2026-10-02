"use client";

import RevealOnScroll from "@/components/ui/RevealOnScroll";
import GlyphDivider from "@/components/ui/GlyphDivider";

const institutionalPartners = [
  {
    id: "p1",
    name: "National Board of Accreditation (NBA)",
    badge: "Tier-1 Autonomous",
    description: "Accredited CSE undergraduate programme under Washington Accord Tier-1 guidelines for autonomous institutions.",
    url: "https://www.nbaind.org",
  },
  {
    id: "p2",
    name: "NAAC Re-Accreditation",
    badge: "Grade 'A+' Certified",
    description: "National Assessment and Accreditation Council institutional grade A+ recognition for academic and research infrastructure.",
    url: "http://naac.gov.in",
  },
  {
    id: "p3",
    name: "Visvesvaraya Technological University",
    badge: "Affiliated & Autonomous",
    description: "Autonomous degree-granting status under Visvesvaraya Technological University, Belagavi, Karnataka.",
    url: "https://vtu.ac.in",
  },
  {
    id: "p4",
    name: "All India Council for Technical Education",
    badge: "AICTE Approved",
    description: "Recognized apex body approved technical institute ensuring benchmarked faculty cadre ratios and laboratories.",
    url: "https://www.aicte-india.org",
  },
];

export default function Partners() {
  return (
    <section className="domains" id="accreditations" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="domains-inner">
        <RevealOnScroll className="domains-header">
          <span className="section-eyebrow">// Benchmarked by</span>
          <h2 className="section-heading domains-heading">
            Accreditations &amp; <span className="domains-heading-ghost">regulatory bodies.</span>
          </h2>
        </RevealOnScroll>

        <div className="sponsor-grid">
          {institutionalPartners.map((p, i) => (
            <RevealOnScroll key={p.id} delay={i * 70}>
              <a
                className="card card-hover sponsor-card"
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: 8 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="badge badge-dark" style={{ fontSize: 11 }}>{p.badge}</span>
                  <span style={{ fontSize: 13, color: "var(--grey-400)" }}>↗</span>
                </div>
                <div className="card-title" style={{ fontSize: 16, marginTop: 4 }}>{p.name}</div>
                <div className="card-muted" style={{ fontSize: 13, lineHeight: 1.5 }}>{p.description}</div>
              </a>
            </RevealOnScroll>
          ))}
        </div>

        <GlyphDivider variant="compact" />
      </div>
    </section>
  );
}
export { Partners };
