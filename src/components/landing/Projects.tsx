"use client";

import { useState } from "react";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import GlyphDivider from "@/components/ui/GlyphDivider";

interface FacultyResearchProject {
  id: string;
  category: "all" | "grants" | "patents" | "scopus" | "consultancy";
  status: "shipped" | "wip" | "concept";
  title: string;
  description: string;
  tags: string[];
  investigator: string;
  year: string;
  fundingAgency?: string;
  amount?: string;
}

const CATEGORIES = [
  { key: "all", label: "All Works" },
  { key: "grants", label: "Funded Grants" },
  { key: "patents", label: "Patents" },
  { key: "scopus", label: "Scopus / WoS" },
  { key: "consultancy", label: "Industry Consultancy" },
];

const mockResearch: FacultyResearchProject[] = [
  {
    id: "r1",
    category: "grants",
    status: "shipped",
    title: "AI-Assisted Autonomous Drone Surveillance for Rural Infrastructure",
    description: "Multi-spectral computer vision pipeline deployed on NVIDIA edge devices for real-time fault detection in high-voltage transmission lines.",
    tags: ["VGST K-FIST", "Edge AI", "Computer Vision", "₹20,00,000"],
    investigator: "Dr. Anupama H S / Dr. BHARATHI M A",
    year: "2025-26",
    fundingAgency: "Govt of Karnataka VGST",
  },
  {
    id: "r2",
    category: "patents",
    status: "shipped",
    title: "Method & Apparatus for Low-Power Cryptographic Key Exchange in IoT",
    description: "Published Indian Patent (App No. 202441089212) on lightweight lattice-based post-quantum cryptography for resource-constrained microcontrollers.",
    tags: ["Indian Patent", "Post-Quantum", "IoT Security", "Published"],
    investigator: "Dr. Vidya A / Dr. Satish Kumar",
    year: "2025",
  },
  {
    id: "r3",
    category: "scopus",
    status: "shipped",
    title: "Transformer-based Explainable Predictive Modeling in Clinical Diagnostics",
    description: "Published in IEEE Transactions on Medical Imaging (Q1 Journal, Impact Factor: 10.6). Proposes novel attention head regularization for CT scans.",
    tags: ["IEEE Trans", "Q1 Journal", "Explainable AI", "Citations: 42"],
    investigator: "Dr. Shankaragowda B B / Dr. Archana",
    year: "2025",
  },
  {
    id: "r4",
    category: "consultancy",
    status: "wip",
    title: "Enterprise Distributed Ledger for Cross-Border Supply Chain Compliance",
    description: "Industry sponsored consultancy project developing a zero-knowledge proof verification engine for logistics audits.",
    tags: ["Industry Sponsored", "Zero Knowledge", "Hyperledger", "₹8,50,000"],
    investigator: "Dr. Mahesh G / Dr. Rajesh K",
    year: "2026",
  },
];

export default function Projects() {
  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? mockResearch
      : mockResearch.filter((p) => p.category === filter);

  return (
    <section className="projects" id="research">
      <div className="projects-inner">
        <RevealOnScroll className="projects-header">
          <span className="section-eyebrow">// 03 — Research &amp; Scholarly Outputs</span>
          <h2 className="section-heading">
            Scholarly impact,
            <br />
            <span className="projects-heading-ghost">audited &amp; indexed.</span>
          </h2>
          <p className="section-body projects-sub">
            All publications, sponsored grants, patents, and consultancy projects are verified by cluster heads and automatically compiled for NIRF &amp; NBA Criterion 5.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={120}>
          <div className="projects-filters" role="tablist">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                role="tab"
                aria-selected={filter === c.key}
                className={`projects-filter ${filter === c.key ? "is-active" : ""}`}
                onClick={() => setFilter(c.key)}
                id={`filter-${c.key}`}
              >
                {filter === c.key && <span className="projects-filter-dot" />}
                {c.label}
              </button>
            ))}
          </div>
        </RevealOnScroll>

        <GlyphDivider variant="compact" />

        <div className="projects-grid">
          {filtered.map((p, i) => (
            <RevealOnScroll key={p.id} delay={i * 70}>
              <article className="project-card">
                <div className="project-card-top">
                  <div className="project-dots" aria-hidden="true">
                    <span /><span /><span />
                  </div>
                  <span className={`project-status status-${p.status}`}>
                    {p.status === "shipped"
                      ? "● Verified & Indexed"
                      : p.status === "wip"
                      ? "○ In Progress"
                      : "◇ Proposal"}
                  </span>
                </div>

                <h3 className="project-title">{p.title}</h3>
                <p className="project-desc">{p.description}</p>

                <div className="project-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="project-tag">{t}</span>
                  ))}
                </div>

                <div className="project-foot">
                  <span className="project-author">{p.investigator}</span>
                  <span className="project-year">{p.year}</span>
                </div>

                <div className="project-shimmer" aria-hidden="true" />
              </article>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll delay={200}>
          <div className="projects-more">
            <a className="btn-secondary" href="/login">
              ACCESS RESEARCH REPOSITORY
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
export { Projects };
