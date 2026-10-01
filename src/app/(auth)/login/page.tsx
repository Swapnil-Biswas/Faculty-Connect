"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckSquare, Award, Shield, ArrowRight, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const demoAccounts = [
    { role: "Faculty", email: "ananya@facultyconnect.edu", pass: "Faculty@123", tag: "Primary View" },
    { role: "Cluster Head", email: "ch@facultyconnect.edu", pass: "Ch@123", tag: "Management" },
    { role: "HOD", email: "hod@facultyconnect.edu", pass: "Hod@123", tag: "Governance" },
    { role: "Admin", email: "admin@facultyconnect.edu", pass: "Admin@123", tag: "System" },
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

  const institutionName = process.env.NEXT_PUBLIC_INSTITUTION_NAME ?? "Academic Management Platform";
  const deptName = process.env.NEXT_PUBLIC_DEPARTMENT_NAME ?? "Department of Computer Science & Engineering";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7F8FA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 48,
          alignItems: "center",
        }}
      >
        {/* Left column: Institutional Introduction */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "8px 0" }}>
          {/* Institution & Brand mark */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  backgroundColor: "#173B67",
                  border: "1px solid #132F53",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                FC
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#17202A", lineHeight: 1.2 }}>
                  Faculty Connect
                </span>
                <span style={{ fontSize: 12, color: "#667085" }}>
                  {institutionName}
                </span>
              </div>
            </div>

            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "#173B67",
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
                margin: "16px 0 8px 0",
              }}
            >
              Academic Management & Recognition Platform
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#667085",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              A centralized workspace for academic faculty, cluster leads, and departmental leadership. Enter data once, synchronize across reporting, recognition, and compliance.
            </p>
          </div>

          {/* Academic Features list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              paddingTop: 8,
              borderTop: "1px solid #E4E7EC",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #DBEAFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2F6FED",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <CheckSquare size={15} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}>
                  Academic Deliverables & Workflow
                </div>
                <div style={{ fontSize: 12, color: "#667085", lineHeight: 1.4 }}>
                  Transparent task queues, leave applications, and cluster progress review.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #DBEAFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2F6FED",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <Award size={15} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}>
                  Merit Recognition Ledger
                </div>
                <div style={{ fontSize: 12, color: "#667085", lineHeight: 1.4 }}>
                  Audited merit points, star recognitions, and publication registry.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #DBEAFE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2F6FED",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <Shield size={15} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}>
                  Accreditation & Compliance
                </div>
                <div style={{ fontSize: 12, color: "#667085", lineHeight: 1.4 }}>
                  Direct aggregation for NBA/NAAC Criterion 5 institutional SSR dossiers.
                </div>
              </div>
            </div>
          </div>

          {/* Department footer note */}
          <div style={{ fontSize: 12, color: "#667085" }}>
            Governed by <strong style={{ color: "#17202A" }}>{deptName}</strong>
          </div>
        </div>

        {/* Right column: White Authentication Panel */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 8,
            boxShadow: "0 4px 12px -2px rgba(16, 24, 40, 0.05), 0 2px 6px -1px rgba(16, 24, 40, 0.03)",
            padding: "36px 32px",
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#17202A",
                margin: "0 0 6px 0",
                letterSpacing: "-0.01em",
              }}
            >
              Sign In
            </h2>
            <p style={{ fontSize: 13, color: "#667085", margin: 0 }}>
              Enter your institutional credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email field */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="email"
                style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}
              >
                Academic Email
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
                  height: 38,
                  padding: "0 12px",
                  borderRadius: 6,
                  border: "1px solid #E4E7EC",
                  backgroundColor: "#FFFFFF",
                  fontSize: 13,
                  color: "#17202A",
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2F6FED")}
                onBlur={(e) => (e.target.style.borderColor = "#E4E7EC")}
              />
            </div>

            {/* Password field */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: 13, fontWeight: 600, color: "#17202A" }}
                >
                  Password
                </label>
                <span
                  style={{
                    fontSize: 11,
                    color: "#667085",
                  }}
                  title="Contact your department administrator to reset credentials"
                >
                  Forgot password?
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    height: 38,
                    padding: "0 38px 0 12px",
                    borderRadius: 6,
                    border: "1px solid #E4E7EC",
                    backgroundColor: "#FFFFFF",
                    fontSize: 13,
                    color: "#17202A",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2F6FED")}
                  onBlur={(e) => (e.target.style.borderColor = "#E4E7EC")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: 4,
                    color: "#667085",
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
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECDCA",
                  borderRadius: 6,
                  padding: "9px 12px",
                  color: "#C0392B",
                  fontSize: 12.5,
                  fontWeight: 500,
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
              style={{
                height: 40,
                backgroundColor: "#173B67",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 6,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.75 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background-color 0.15s ease",
                marginTop: 4,
              }}
              onMouseEnter={(e) => {
                if (!isPending) (e.currentTarget.style.backgroundColor = "#122F53");
              }}
              onMouseLeave={(e) => {
                if (!isPending) (e.currentTarget.style.backgroundColor = "#173B67");
              }}
            >
              {isPending ? (
                <span>Authenticating…</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Panel */}
          <div
            style={{
              marginTop: 24,
              padding: "12px 14px",
              backgroundColor: "#F7F8FA",
              border: "1px solid #E4E7EC",
              borderRadius: 6,
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "#173B67",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>Authorized Demo Accounts</span>
              <span style={{ fontSize: 10, color: "#667085", textTransform: "none", fontWeight: 400 }}>
                Click to fill
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc.email, acc.pass)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    borderRadius: 4,
                    border: "1px solid #E4E7EC",
                    backgroundColor: email === acc.email ? "#EFF6FF" : "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2F6FED")}
                  onMouseLeave={(e) => {
                    if (email !== acc.email) e.currentTarget.style.borderColor = "#E4E7EC";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: email === acc.email ? "#173B67" : "#17202A",
                        minWidth: 74,
                      }}
                    >
                      {acc.role}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#667085",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}
                    >
                      {acc.email}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      color: email === acc.email ? "#2F6FED" : "#98A2B3",
                      fontWeight: 500,
                    }}
                  >
                    {acc.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}