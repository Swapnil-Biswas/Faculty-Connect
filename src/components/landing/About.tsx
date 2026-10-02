import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

export default function About() {
  return (
    <section className="about" id="about">
      <div className="about-dot-bg" aria-hidden="true" />
      <div className="about-content">
        <div className="about-text">
          <RevealOnScroll>
            <span className="section-eyebrow">// 01 — Mission &amp; Vision</span>
            <h2 className="section-heading">
              Intelligent academic
              <br />
              data governance.
              <br />
              <span className="about-heading-ghost">Built for faculty.</span>
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={120}>
            <p className="section-body">
              Faculty-Connect is the unified academic operating system for BMS Institute of Technology &amp; Management (Department of CSE). It replaces fragmented spreadsheets, manual appraisal binders, and ad-hoc accreditation audits with real-time institutional synchrony.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={200}>
            <p className="section-body">
              Input teaching, research, mentoring, and service milestones once — automate NBA criteria portfolios, NAAC SSR metrics, and annual merit evaluations without duplicate paperwork.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delay={280}>
            <div className="about-pillars">
              <div className="about-pillar">
                <span className="about-pillar-num">01</span>
                <div>
                  <h4>Enter Once, Sync Everywhere</h4>
                  <p>Every milestone automatically maps to NBA Criteria, NAAC indicators, and annual appraisal files.</p>
                </div>
              </div>
              <div className="about-pillar">
                <span className="about-pillar-num">02</span>
                <div>
                  <h4>Transparent Merit Scoring</h4>
                  <p>Deterministic, audited recognition engine based on published criteria, peer reviews, and verifiable outcomes.</p>
                </div>
              </div>
              <div className="about-pillar">
                <span className="about-pillar-num">03</span>
                <div>
                  <h4>Accreditation Autopilot</h4>
                  <p>Instant exports of SAR tables, course outcome matrices, and institutional compliance ledgers at the click of a button.</p>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
        <RevealOnScroll delay={150} className="about-image-wrapper">
          <Image
            src="/20260518_154505 (1).jpg"
            alt="BMSIT Faculty & Academic Council Session"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            priority={false}
          />
          <div className="about-image-dots" aria-hidden="true" />
          <div className="about-image-corners" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <div className="about-image-tag">
            <span>FIG. 01</span>
            <span>— BMSIT CSE · ACADEMIC GOVERNANCE</span>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
export { About };
