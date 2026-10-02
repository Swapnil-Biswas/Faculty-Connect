"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Lock, CheckSquare, Award, Shield } from "lucide-react";
import { DotMatrixCanvas } from "@/components/ui/DotMatrixCanvas";
import { DotMatrixPattern } from "@/components/ui/DotMatrixPattern";
import { Ticker } from "@/components/ui/Ticker";
import { GlyphDivider } from "@/components/ui/GlyphDivider";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const demoAccounts = [
    { role: "Faculty", glyph: "◆", email: "ananya@facultyconnect.edu", pass: "Faculty@123", tag: "Workspace View" },
    { role: "Cluster Head", glyph: "▣", email: "ch@facultyconnect.edu", pass: "Ch@123", tag: "Management Node" },
    { role: "HOD", glyph: "◈", email: "hod@facultyconnect.edu", pass: "Hod@123", tag: "Governance" },
    { role: "Admin", glyph: "★", email: "admin@facultyconnect.edu", pass: "Admin@123", tag: "Root System" },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password. Please verify your credentials.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  function fillDemo(demoEmail: string, demoPass: string) {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  }

  const deptName = process.env.NEXT_PUBLIC_DEPARTMENT_NAME ?? "Dept. of Computer Science & Engineering";

  return (
    <div
      className="bg-tech-grid"
      style={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 56,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left column: BMSIT Tech Architecture & Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Brand header */}
          <div>
            {/* BMSIT 5x7 Dot Matrix Display */}
            <div style={{ marginBottom: 18 }}>
              <DotMatrixCanvas
                text="FACULTY"
                fontSize={48}
                color="#1D1D1F"
                style={{ marginBottom: 4 }}
              />
              <DotMatrixCanvas
                text="CONNECT"
                fontSize={48}
                color="#424245"
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  backgroundColor: "#1D1D1F",
                  border: "1px solid #1D1D1F",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                }}
              >
                FC
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#1D1D1F",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  FACULTY CONNECT
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "#6E6E73",
                    letterSpacing: "0.05em",
                  }}
                >
                  BMSIT // BENGALURU · EST. 2002
                </span>
              </div>
            </div>

            {/* Live Telemetry Ribbon */}
            <div className="tech-ticker" style={{ marginBottom: 18, background: "#FFFFFF", border: "1px solid #E8E8ED", color: "#1D1D1F" }}>
              <span className="tech-led led-green" />
              <span style={{ color: "#1D1D1F", fontWeight: 700 }}>SYSTEM ONLINE</span>
              <span style={{ color: "#D2D2D7" }}>//</span>
              <span style={{ color: "#6E6E73" }}>NODE: BMSIT-CSE-PROD</span>
              <span style={{ color: "#D2D2D7" }}>//</span>
              <span style={{ color: "#1D1D1F", fontWeight: 600 }}>AY 2026-27</span>
            </div>

            <div className="hero-eyebrow" style={{ color: "#86868B" }}>
              // 01 — ACADEMIC OPERATING SYSTEM
            </div>

            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#1D1D1F",
                lineHeight: 1.2,
                letterSpacing: "-0.025em",
                margin: "8px 0 14px 0",
              }}
            >
              Academic Management & Performance Protocol
            </h1>
            <p
              style={{
                fontSize: 14.5,
                color: "#6E6E73",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              A high-precision Nothing/Apple minimalist portal for faculty workloads, peer evaluations, merit stars, and automated NBA / NAAC compliance synchronization.
            </p>
          </div>

          {/* Tech Feature Modules */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 12,
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E8ED",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: "#F5F5F7",
                  border: "1px solid #E8E8ED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1D1D1F",
                  flexShrink: 0,
                }}
              >
                <CheckSquare size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                  ◆ WORKSPACE PIPELINE
                </div>
                <div style={{ fontSize: 12, color: "#6E6E73", marginTop: 2, lineHeight: 1.4 }}>
                  Task assignments, cluster deliverables, and instantaneous leave approvals with audit trails.
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 12,
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E8ED",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: "#F5F5F7",
                  border: "1px solid #E8E8ED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1D1D1F",
                  flexShrink: 0,
                }}
              >
                <Award size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                  ★ MERIT & RECOGNITION LEDGER
                </div>
                <div style={{ fontSize: 12, color: "#6E6E73", marginTop: 2, lineHeight: 1.4 }}>
                  Point scoring algorithms, peer badges, Faculty-of-the-Month rankings, and research catalog.
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 12,
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E8ED",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: "#F5F5F7",
                  border: "1px solid #E8E8ED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#1D1D1F",
                  flexShrink: 0,
                }}
              >
                <Shield size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1D1D1F", fontFamily: "var(--font-mono)" }}>
                  ◈ ACCREDITATION SYNCHRONIZER
                </div>
                <div style={{ fontSize: 12, color: "#6E6E73", marginTop: 2, lineHeight: 1.4 }}>
                  Automated NBA Criterion 5 dossier compilation and NAAC quality assurance telemetry.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 11.5,
              fontFamily: "var(--font-mono)",
              color: "#86868B",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>GOVERNED BY</span>
            <span style={{ color: "#1D1D1F", fontWeight: 600 }}>{deptName.toUpperCase()}</span>
          </div>
        </div>

        {/* Right column: Light Tech Terminal Login Box */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E8E8ED",
            borderRadius: 18,
            boxShadow: "0 20px 60px -15px rgba(0, 0, 0, 0.08)",
            padding: "36px 32px",
            position: "relative",
          }}
        >
          {/* Terminal top header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 16,
              marginBottom: 20,
              borderBottom: "1px solid #E8E8ED",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#E11D48" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#D97706" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#16A34A" }} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "#86868B",
                letterSpacing: "0.08em",
              }}
            >
              AUTH_PORTAL_V2.6 // SSL_256
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#1D1D1F",
                letterSpacing: "-0.01em",
                margin: "0 0 6px 0",
              }}
            >
              Authenticate Identity
            </h2>
            <p style={{ fontSize: 13, color: "#6E6E73", margin: 0 }}>
              Enter your institutional credentials to enter the workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email field */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  color: "#1D1D1F",
                  letterSpacing: "0.04em",
                }}
              >
                01 // ACADEMIC EMAIL
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@facultyconnect.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="form-input"
              />
            </div>

            {/* Password field */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  htmlFor="password"
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    color: "#1D1D1F",
                    letterSpacing: "0.04em",
                  }}
                >
                  02 // ACCESS KEY
                </label>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "#86868B",
                  }}
                  title="Contact your department administrator to reset credentials"
                >
                  FORGOT_KEY?
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="form-input"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: 4,
                    color: "#86868B",
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  backgroundColor: "rgba(225, 29, 72, 0.08)",
                  border: "1px solid rgba(225, 29, 72, 0.25)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#E11D48",
                  fontSize: 12.5,
                  fontFamily: "var(--font-mono)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Lock size={14} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={isPending}
              className="btn-primary"
              style={{
                height: 44,
                width: "100%",
                justifyContent: "center",
                marginTop: 4,
                fontSize: 13.5,
                letterSpacing: "0.04em",
              }}
            >
              {isPending ? (
                <span>AUTHENTICATING NODE…</span>
              ) : (
                <>
                  <span>AUTHENTICATE & ENTER</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <GlyphDivider label="DEMO ACCESS MATRIX" variant="compact" />

          {/* Quick-Switch Demo Accounts */}
          <div
            style={{
              padding: "14px",
              backgroundColor: "#F5F5F7",
              border: "1px solid #E8E8ED",
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                color: "#1D1D1F",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>// DEMO QUICK-SWITCH ACCOUNTS</span>
              <span style={{ fontSize: 10, color: "#86868B", textTransform: "none", fontWeight: 400 }}>
                1-click credentials fill
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {demoAccounts.map((acc) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc.email, acc.pass)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: isSelected ? "1.5px solid #1D1D1F" : "1px solid #E8E8ED",
                      backgroundColor: isSelected ? "#FFFFFF" : "#FFFFFF",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "0 1px 4px rgba(0, 0, 0, 0.08)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: "#1D1D1F",
                          minWidth: 80,
                        }}
                      >
                        {acc.glyph} {acc.role}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#6E6E73",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {acc.email}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: "var(--font-mono)",
                        color: "#86868B",
                        fontWeight: 600,
                      }}
                    >
                      {acc.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive 3D Dot Matrix Sphere Visualizer */}
          <div
            style={{
              borderRadius: 14,
              backgroundColor: "#FAFAFA",
              border: "1px solid #E8E8ED",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#1D1D1F", letterSpacing: "0.14em", fontWeight: 600 }}>
                // INTERACTIVE 3D FIBONACCI SPHERE
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "#86868B" }}>
                DRAG TO ROTATE
              </span>
            </div>
            <div style={{ height: 180, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DotMatrixPattern style={{ height: 180, width: "100%" }} color="#1D1D1F" accentColor="#0284C7" />
            </div>
          </div>
        </div>
      </div>

      {/* BMSIT Live Continuous Telemetry Ticker */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10 }}>
        <Ticker
          items={[
            "BMS INSTITUTE OF TECHNOLOGY & MANAGEMENT",
            "DEPT OF COMPUTER SCIENCE & ENGINEERING",
            "AUTONOMOUS ACADEMIC OPERATING SYSTEM",
            "NBA & NAAC ACCREDITATION DOSSIER ENGINE",
            "FACULTY CONNECT v2.4",
            "ENTER ONCE · USE EVERYWHERE",
          ]}
          speed={20}
        />
      </div>
    </div>
  );
}