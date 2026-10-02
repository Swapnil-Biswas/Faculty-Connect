"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import GlyphDivider from "@/components/ui/GlyphDivider";

// 18x6 interactive dot grid that reacts to mouse
function JoinGlyphGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let w = 0, h = 0;
    let animId = 0;

    const COLS = 18;
    const ROWS = 6;
    const dots: { x: number; y: number; phase: number }[] = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        dots.push({ x: 0, y: 0, phase: Math.random() * Math.PI * 2 });
      }
    }

    const mouse = { x: -1000, y: -1000, active: false };
    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const handleLeave = () => { mouse.active = false; };
    const handleResize = () => resize();

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cellW = w / COLS;
      const cellH = h / ROWS;
      let i = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          dots[i].x = c * cellW + cellW / 2;
          dots[i].y = r * cellH + cellH / 2;
          i++;
        }
      }
    }

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    window.addEventListener("resize", handleResize);
    resize();

    const start = performance.now();
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const t = (performance.now() - start) / 1000;
      for (const d of dots) {
        let radius = 2.2;
        let opacity = 0.08;
        const wave = Math.sin(t * 1.2 + d.x * 0.02 + d.phase) * 0.5 + 0.5;
        opacity = 0.06 + wave * 0.18;
        radius = 1.6 + wave * 1.6;
        if (mouse.active) {
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const force = 1 - dist / 110;
            radius += force * 4;
            opacity = Math.min(0.9, opacity + force * 0.7);
          }
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(29, 29, 31, ${opacity})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div style={{ width: "100%", height: 110, position: "relative" }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} aria-hidden="true" />
    </div>
  );
}

export default function JoinUs() {
  return (
    <section className="join" id="portal-access">
      <div className="join-inner">
        <RevealOnScroll className="join-header">
          <span className="section-eyebrow">// 07 — Enterprise Access</span>
          <h2 className="section-heading">
            Authenticate to
            <br />
            <span className="join-heading-ghost">your portal.</span>
          </h2>
          <p className="section-body join-sub">
            Single sign-on active for BMSIT faculty, cluster heads, departmental evaluators, and academic administrators.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={80}>
          <div className="card" style={{ maxWidth: 640, margin: "0 auto", padding: "32px 36px", textAlign: "center" }}>
            <JoinGlyphGrid />
            <div style={{ marginTop: 24 }}>
              <span className="hero-status-led" style={{ display: "inline-block", marginRight: 8 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.08em", color: "var(--grey-600)" }}>
                FACULTY AUTH SERVICE · VTU SECURE ENCLAVE
              </span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 12, color: "var(--foreground)" }}>
              Ready to manage your academic portfolio?
            </h3>
            <p style={{ color: "var(--grey-600)", fontSize: 14, lineHeight: 1.6, maxWidth: 480, margin: "10px auto 24px" }}>
              Submit teaching loads, journal publications, and consultancy records with live automated validation and merit index computation.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
              <Link href="/login" className="btn-primary" style={{ padding: "12px 28px" }}>
                SIGN IN WITH INSTITUTIONAL SSO
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>
          </div>
        </RevealOnScroll>

        <GlyphDivider variant="compact" />
      </div>
    </section>
  );
}
export { JoinUs };
