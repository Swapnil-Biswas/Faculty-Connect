"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Lock, Terminal, Shield, CheckSquare, Award } from "lucide-react";
import { DotMatrixCanvas } from "@/components/ui/DotMatrixCanvas";
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
        backgroundColor: "#07090E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient background glows */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "10%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1040,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 48,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left column: BMSIT Tech Architecture & Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Brand header */}
          <div>
            <DotMatrixCanvas
              text="FACULTY CONNECT"
              fontSize={28}
              color="#FFD700"
              animate={true}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  backgroundColor: "#07090E",
                  border: "1.5px solid #FFD700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFD700",
                  fontSize: 16,
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  boxShadow: "0 0 16px rgba(255, 215, 0, 0.3)",
                }}
              >
                FC
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#F8FAFC",
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
                    color: "#64748B",
                    letterSpacing: "0.05em",
                  }}
                >
                  BMSIT // BENGALURU · EST. 2002
                </span>
              </div>
            </div>

            {/* Live Telemetry Ribbon */}
            <div className="tech-ticker" style={{ marginBottom: 18 }}>
              <span className="tech-led led-green" />
              <span style={{ color: "#F8FAFC", fontWeight: 600 }}>SYSTEM ONLINE</span>
              <span style={{ opacity: 0.3 }}>//</span>
              <span>NODE: BMSIT-CSE-PROD</span>
              <span style={{ opacity: 0.3 }}>//</span>
              <span style={{ color: "#FFD700" }}>AY 2026-27</span>
            </div>

            <div className="hero-eyebrow">
              // 01 — ACADEMIC OPERATING SYSTEM
            </div>

            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#F8FAFC",
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
                color: "#94A3B8",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              A high-precision developer-grade portal for faculty workloads, peer evaluations, merit stars, and automated NBA / NAAC compliance synchronization.
            </p>
          </div>

          {/* Tech Feature Modules */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "12px 14px",
                borderRadius: 8,
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: "rgba(14, 165, 233, 0.1)",
                  border: "1px solid rgba(14, 165, 233, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#38BDF8",
                  flexShrink: 0,
                }}
              >
                <CheckSquare size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", fontFamily: "var(--font-mono)" }}>
                  ◆ WORKSPACE PIPELINE
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2, lineHeight: 1.4 }}>
                  Task assignments, cluster deliverables, and instantaneous leave approvals with audit trails.
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "12px 14px",
                borderRadius: 8,
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: "rgba(255, 215, 0, 0.1)",
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFD700",
                  flexShrink: 0,
                }}
              >
                <Award size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", fontFamily: "var(--font-mono)" }}>
                  ★ MERIT & RECOGNITION LEDGER
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2, lineHeight: 1.4 }}>
                  Point scoring algorithms, peer badges, Faculty-of-the-Month rankings, and research catalog.
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "12px 14px",
                borderRadius: 8,
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4ADE80",
                  flexShrink: 0,
                }}
              >
                <Shield size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", fontFamily: "var(--font-mono)" }}>
                  ◈ ACCREDITATION SYNCHRONIZER
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2, lineHeight: 1.4 }}>
                  Automated NBA Criterion 5 dossier compilation and NAAC quality assurance telemetry.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 11.5,
              fontFamily: "var(--font-mono)",
              color: "#64748B",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>GOVERNED BY</span>
            <span style={{ color: "#FFD700" }}>{deptName.toUpperCase()}</span>
          </div>
        </div>

        {/* Right column: Cyber Terminal Login Box */}
        <div
          style={{
            backgroundColor: "#0E121B",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 14,
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 24px rgba(255, 215, 0, 0.05)",
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
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#F43F5E" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#F59E0B" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#22C55E" }} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "#64748B",
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
                color: "#F8FAFC",
                letterSpacing: "-0.01em",
                margin: "0 0 6px 0",
              }}
            >
              Authenticate Identity
            </h2>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>
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
                  color: "#FFD700",
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
                style={{
                  height: 42,
                  padding: "0 14px",
                  borderRadius: 8,
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backgroundColor: "#07090E",
                  fontSize: 13.5,
                  fontFamily: "var(--font-mono)",
                  color: "#F8FAFC",
                  outline: "none",
                  transition: "all 0.18s ease",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FFD700";
                  e.target.style.boxShadow = "0 0 0 2px rgba(255, 215, 0, 0.18)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  e.target.style.boxShadow = "none";
                }}
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
                    color: "#FFD700",
                    letterSpacing: "0.04em",
                  }}
                >
                  02 // ACCESS KEY
                </label>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "#64748B",
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
                  style={{
                    width: "100%",
                    height: 42,
                    padding: "0 40px 0 14px",
                    borderRadius: 8,
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    backgroundColor: "#07090E",
                    fontSize: 13.5,
                    fontFamily: "var(--font-mono)",
                    color: "#F8FAFC",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "all 0.18s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FFD700";
                    e.target.style.boxShadow = "0 0 0 2px rgba(255, 215, 0, 0.18)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    e.target.style.boxShadow = "none";
                  }}
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
                    color: "#64748B",
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
                  backgroundColor: "rgba(244, 63, 94, 0.1)",
                  border: "1px solid rgba(244, 63, 94, 0.35)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#FB7185",
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
                fontSize: 14,
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
              marginTop: 26,
              padding: "14px",
              backgroundColor: "rgba(7, 9, 14, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                color: "#FFD700",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>// DEMO QUICK-SWITCH ACCOUNTS</span>
              <span style={{ fontSize: 10, color: "#64748B", textTransform: "none", fontWeight: 400 }}>
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
                      padding: "8px 10px",
                      borderRadius: 6,
                      border: isSelected
                        ? "1px solid #FFD700"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                      backgroundColor: isSelected
                        ? "rgba(255, 215, 0, 0.08)"
                        : "rgba(255, 255, 255, 0.02)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "rgba(255, 215, 0, 0.4)";
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.04)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: "var(--font-mono)",
                          color: isSelected ? "#FFD700" : "#38BDF8",
                          minWidth: 80,
                        }}
                      >
                        {acc.glyph} {acc.role}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: isSelected ? "#F8FAFC" : "#94A3B8",
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
                        color: isSelected ? "#FFD700" : "#64748B",
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
        </div>
      </div>

      {/* BMSIT Live Continuous Telemetry Ticker */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10 }}>
        <Ticker
          items={[
            "BMS INSTITUTE OF TECHNOLOGY & MANAGEMENT",
            "DEPT OF COMPUTER SCIENCE & ENGINEERING",
            "AUTONOMOUS ACADEMIC OPERATING SYSTEM",
            "NBA & NAAC ACCREDITATION Dossier Engine",
            "FACULTY CONNECT v2.4",
            "ENTER ONCE · USE EVERYWHERE",
          ]}
          speed={20}
        />
      </div>
    </div>
  );
}