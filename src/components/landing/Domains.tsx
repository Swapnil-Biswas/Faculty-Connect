"use client";

import RevealOnScroll from "@/components/ui/RevealOnScroll";

const domains = [
  { code: "SYS", icon: "◆", label: "Systems & Cloud Computing", blurb: "OS, Distributed Systems, High-Performance Networks." },
  { code: "AIML", icon: "◇", label: "Artificial Intelligence & ML", blurb: "Deep Learning, LLMs, Computer Vision, Edge AI." },
  { code: "CYBR", icon: "◈", label: "Cybersecurity & Cryptography", blurb: "Post-quantum cryptosystems, Network Defense, Forensics." },
  { code: "DATA", icon: "▣", label: "Data Engineering & Analytics", blurb: "Big Data Pipelines, Streaming architectures, Warehouses." },
  { code: "SOFT", icon: "◉", label: "Software Engineering & Dev", blurb: "Full-Stack Web/Mobile, Agile Methods, CI/CD, DevOps." },
  { code: "IOT", icon: "▤", label: "Internet of Things & Embedded", blurb: "Microcontrollers, Sensors, Robotics, Hardware Security." },
];

export default function Domains() {
  return (
    <section className="domains" id="domains">
      <div className="domains-inner">
        <RevealOnScroll className="domains-header">
          <span className="section-eyebrow">// 06 — Academic Clusters</span>
          <h2 className="section-heading domains-heading">
            Six clusters. <span className="domains-heading-ghost">One department.</span>
          </h2>
        </RevealOnScroll>
        <div className="domains-grid">
          {domains.map((d, i) => (
            <RevealOnScroll key={d.label} delay={i * 70}>
              <div className="domain-chip" id={`domain-${d.code.toLowerCase()}`}>
                <span className="domain-chip-glyph" aria-hidden="true">{d.icon}</span>
                <div className="domain-chip-body">
                  <span className="domain-chip-label">{d.label}</span>
                  <span className="domain-chip-blurb">{d.blurb}</span>
                </div>
                <span className="domain-chip-code">{d.code}</span>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
export { Domains };
