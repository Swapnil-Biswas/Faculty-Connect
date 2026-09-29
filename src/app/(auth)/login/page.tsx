"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, GraduationCap, Sparkles, Users, BarChart3, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const features = [
    { icon: <GraduationCap size={20} />, text: "Enter Once — Sync Everywhere" },
    { icon: <BarChart3 size={20} />, text: "Real-time Department Analytics" },
    { icon: <Users size={20} />, text: "Cluster-based Faculty Management" },
    { icon: <Sparkles size={20} />, text: "Recognition & Leaderboard Engine" },
    { icon: <ShieldCheck size={20} />, text: "Full Audit Trail & RBAC" },
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
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div style={{ position: "relative", zIndex: 1, maxWidth: 440, width: "100%" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 800,
                color: "white",
                fontFamily: "Plus Jakarta Sans, sans-serif",
              }}
            >
              FC
            </div>
            <div>
              <div style={{ color: "white", fontSize: 20, fontWeight: 800, fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                Faculty Connect
              </div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                {process.env.NEXT_PUBLIC_INSTITUTION_NAME ?? "Academic Platform"}
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.15,
              marginBottom: 16,
              fontFamily: "Plus Jakarta Sans, sans-serif",
            }}
          >
            Your Academic
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #a78bfa, #67e8f9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Hub Awaits
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            Centralize faculty data, streamline workflows, and celebrate
            excellence — all from one intelligent platform.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {features.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 14,
                  fontWeight: 500,
                  animation: `fadeIn 0.5s ease ${i * 0.1}s forwards`,
                  opacity: 0,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#a78bfa",
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </div>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-form-box fade-in">
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "hsl(var(--text-primary))",
                fontFamily: "Plus Jakarta Sans, sans-serif",
                marginBottom: 6,
              }}
            >
              Welcome back
            </h2>
            <p style={{ color: "hsl(var(--text-secondary))", fontSize: 14 }}>
              Sign in to your Faculty Connect account
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "hsl(var(--text-muted))",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: "hsl(0 84% 60% / 0.08)",
                  border: "1px solid hsl(0 84% 60% / 0.25)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "hsl(0 70% 50%)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className="btn-gradient"
              disabled={isPending}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "12px 20px",
                fontSize: 15,
                opacity: isPending ? 0.75 : 1,
              }}
            >
              {isPending ? (
                <>
                  <svg className="spin" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div
            style={{
              marginTop: 28,
              padding: "14px 16px",
              background: "hsl(var(--color-primary) / 0.06)",
              border: "1px solid hsl(var(--color-primary) / 0.15)",
              borderRadius: 10,
              fontSize: 12.5,
              color: "hsl(var(--text-secondary))",
              lineHeight: 1.7,
            }}
          >
            <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 4 }}>
              🧪 Demo Credentials
            </div>
            <div>Admin: <code>admin@facultyconnect.edu</code> / <code>Admin@123</code></div>
            <div>HOD: <code>hod@facultyconnect.edu</code> / <code>Hod@123</code></div>
            <div>Cluster Head: <code>ch@facultyconnect.edu</code> / <code>Ch@123</code></div>
            <div>Faculty: <code>ananya@facultyconnect.edu</code> / <code>Faculty@123</code></div>
          </div>

          <p
            style={{
              marginTop: 24,
              textAlign: "center",
              fontSize: 12.5,
              color: "hsl(var(--text-muted))",
            }}
          >
            Access is managed by your system administrator.
            <br />
            Contact Admin to request an account.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}