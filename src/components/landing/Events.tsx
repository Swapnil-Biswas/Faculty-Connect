"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import Ticker from "@/components/ui/Ticker";
import GlyphDivider from "@/components/ui/GlyphDivider";

interface AcademicMilestone {
  id: string;
  title: string;
  category: string;
  venue: string;
  start_datetime: string;
  end_datetime: string;
  description: string;
  status: "upcoming" | "live" | "completed";
}

const mockMilestones: AcademicMilestone[] = [
  {
    id: "m1",
    title: "NBA Tier-1 Autonomous Audit Cycle",
    category: "Accreditation",
    venue: "CSE Seminar Hall 1",
    start_datetime: new Date(Date.now() + 86400000 * 5).toISOString(),
    end_datetime: new Date(Date.now() + 86400000 * 7).toISOString(),
    description: "Final verification of Course Outcome attainments, Program Outcomes direct assessment, and faculty publication repositories for Criterion 4 & 5.",
    status: "upcoming",
  },
  {
    id: "m2",
    title: "Annual Faculty Merit & Research Appraisal",
    category: "Evaluation",
    venue: "Dean Academic Office",
    start_datetime: new Date(Date.now() + 86400000 * 12).toISOString(),
    end_datetime: new Date(Date.now() + 86400000 * 15).toISOString(),
    description: "Self-appraisal review, peer teaching evaluations, and research grants verification conducted through the recognition engine.",
    status: "upcoming",
  },
  {
    id: "m3",
    title: "NIRF Research & Consultancy Census",
    category: "Compliance",
    venue: "Main Board Room",
    start_datetime: new Date(Date.now() + 86400000 * 22).toISOString(),
    end_datetime: new Date(Date.now() + 86400000 * 25).toISOString(),
    description: "Cross-departmental indexing of Scopus/WoS journal publications, patents granted, and sponsored consultancy projects.",
    status: "upcoming",
  },
  {
    id: "m4",
    title: "VTU Curriculum Revision & BOS Meet",
    category: "Governance",
    venue: "BMSIT Conference Center",
    start_datetime: new Date(Date.now() - 86400000 * 2).toISOString(),
    end_datetime: new Date(Date.now() - 86400000 * 1).toISOString(),
    description: "Curriculum structuring for autonomous 2026-27 scheme aligning with AICTE guidelines and NEP 2020 frameworks.",
    status: "completed",
  },
];

function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(to).getTime();
  const diff = Math.max(0, target - now.getTime());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return (
    <div className="event-countdown" aria-label="Time until event">
      <span><b>{String(d).padStart(2, "0")}</b><i>d</i></span>
      <span><b>{String(h).padStart(2, "0")}</b><i>h</i></span>
      <span><b>{String(m).padStart(2, "0")}</b><i>m</i></span>
      <span><b>{String(s).padStart(2, "0")}</b><i>s</i></span>
    </div>
  );
}

export default function Events() {
  const tickerItems = [
    "NBA CRITERION 4 & 5 AUDIT PREPARATION",
    "NAAC CYCLE-2 REACCREDITATION ACTIVE",
    "SCOPUS / WOS PUBLICATIONS SYNCING",
    "AUTONOMOUS VTU 2026-27 COMPLIANCE",
    "BMSIT CSE MERIT ENGINE v2.4 ONLINE"
  ];

  return (
    <section className="events" id="events">
      <div className="events-ticker-wrap">
        <Ticker items={tickerItems} speed={3.5} />
      </div>

      <div className="events-inner">
        <RevealOnScroll className="events-header">
          <span className="section-eyebrow">// 02 — Institutional Milestones</span>
          <h2 className="section-heading">
            Accreditation &amp;
            <br />
            <span className="events-heading-ghost">evaluation</span> timeline.
          </h2>
          <p className="section-body events-sub">
            Synchronized calendar of critical academic governance deadlines, NBA compliance milestones, research appraisal cycles, and autonomous BOS reviews.
          </p>
        </RevealOnScroll>

        <GlyphDivider label="ACTIVE SCHEDULE" />

        <div className="events-grid">
          {mockMilestones.map((ev, i) => {
            const isUpcoming = ev.status === "upcoming";
            return (
              <RevealOnScroll key={ev.id} delay={i * 90}>
                <article className="event-card">
                  <div className="event-card-glyphs" aria-hidden="true">
                    <span /><span /><span /><span /><span />
                  </div>
                  <div className="event-card-top">
                    <span className={`event-tag tag-${isUpcoming ? "upcoming" : "live"}`}>
                      {ev.category}
                    </span>
                    <span className="event-date">
                      {new Date(ev.start_datetime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="event-title">{ev.title}</h3>
                  <p className="event-blurb">{ev.description}</p>
                  <div className="event-meta">
                    <span className="event-loc">
                      <span className="event-loc-dot" /> {ev.venue}
                    </span>
                    <span className="event-count">
                      {isUpcoming ? "Pending Audit" : "Concluded"}
                    </span>
                  </div>
                  <div className="event-card-bottom">
                    {isUpcoming ? (
                      <Countdown to={ev.start_datetime} />
                    ) : (
                      <span className="event-date">Archived</span>
                    )}
                    <Link className="event-cta" href="/login">
                      Details
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </article>
              </RevealOnScroll>
            );
          })}
        </div>

        <div className="projects-more" style={{ marginTop: 32 }}>
          <Link href="/login" className="btn-secondary">
            View All Milestones in Portal
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
export { Events };
