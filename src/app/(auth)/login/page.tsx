"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Lock, CheckSquare, Award, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

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
        setError("Invalid email or password. Please verify your institutional credentials.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  const deptName = process.env.NEXT_PUBLIC_DEPARTMENT_NAME ?? "Dept. of Computer Science & Engineering";

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212] flex flex-col justify-between relative selection:bg-[#F0C020] selection:text-[#121212]">
      {/* Top Bauhaus Header Bar */}
      <header className="bg-white border-b-4 border-[#121212] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-4 h-4 rounded-full bg-[#D02020] border-2 border-[#121212]" />
              <span className="w-4 h-4 bg-[#1040C0] border-2 border-[#121212]" />
              <div
                className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#F0C020]"
              />
            </div>
            <span className="text-lg font-black uppercase tracking-tight text-[#121212]">
              FACULTY CONNECT // AUTH
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#121212]">
            <span>NODE: BMSIT-CSE-PROD</span>
            <span>·</span>
            <span>AY 2026-27</span>
          </div>
        </div>
      </header>

      {/* Main Login Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
        {/* Left Column: Constructivist Bauhaus Manifesto & Pillars */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-start bg-[#F0C020] text-[#121212] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-3.5 py-1 text-xs font-black tracking-widest uppercase">
            // 01 — ACADEMIC OPERATING SYSTEM
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[1.04] text-[#121212]">
              AUTHENTICATE.
            </h1>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[1.04] text-[#1040C0]">
              SYNCHRONIZE.
            </h1>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[1.04] text-[#D02020]">
              GOVERN.
            </h1>
          </div>

          <p className="text-base sm:text-lg font-medium text-[#121212] leading-relaxed max-w-xl border-l-4 border-[#121212] pl-4 my-2">
            The unified academic workspace for BMS Institute of Technology &amp; Management. Enter once, sync everywhere for NBA, NAAC, NIRF &amp; annual merit appraisals.
          </p>

          {/* Three Constructivist Modular Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3">
            <div className="bg-white border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] p-4 sm:p-5 flex flex-col gap-2.5">
              <div className="w-8 h-8 bg-[#D02020] text-white flex items-center justify-center border-2 border-[#121212]">
                <CheckSquare size={16} strokeWidth={3} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#121212]">
                Task Pipeline
              </h4>
              <p className="text-xs font-medium text-[#424245] leading-relaxed">
                Course outcome assignments, lab reports, and leaves.
              </p>
            </div>

            <div className="bg-white border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] p-4 sm:p-5 flex flex-col gap-2.5">
              <div className="w-8 h-8 bg-[#F0C020] text-[#121212] flex items-center justify-center border-2 border-[#121212]">
                <Award size={16} strokeWidth={3} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#121212]">
                Merit Stars
              </h4>
              <p className="text-xs font-medium text-[#424245] leading-relaxed">
                Verifiable point engine, leaderboard, and badges.
              </p>
            </div>

            <div className="bg-white border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] p-4 sm:p-5 flex flex-col gap-2.5">
              <div className="w-8 h-8 bg-[#1040C0] text-white flex items-center justify-center border-2 border-[#121212]">
                <Shield size={16} strokeWidth={3} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#121212]">
                Accreditation
              </h4>
              <p className="text-xs font-medium text-[#424245] leading-relaxed">
                Instant NBA SAR criteria and NAAC SSR portfolios.
              </p>
            </div>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-[#424245] pt-3">
            GOVERNED BY: <span className="text-[#121212] font-black">{deptName.toUpperCase()}</span>
          </div>
        </div>

        {/* Right Column: Bauhaus Constructivist Terminal Login Card */}
        <div className="lg:col-span-5">
          <div className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-7 sm:p-10 relative">
            {/* Terminal Decorative Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-[#121212]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#D02020] border border-[#121212]" />
                <span className="w-3.5 h-3.5 bg-[#F0C020] border border-[#121212]" />
                <span className="w-3.5 h-3.5 bg-[#1040C0] border border-[#121212]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#121212]">
                AUTH // SSL_256
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#121212] mb-1.5">
                IDENTITY VERIFICATION
              </h2>
              <p className="text-xs font-medium text-[#424245] leading-relaxed">
                Enter your institutional credentials to access the workspace
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-xs font-black uppercase tracking-wider text-[#121212]"
                >
                  01 // INSTITUTIONAL EMAIL
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="faculty@bmsit.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-[#F0F0F0] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] focus:bg-white focus:shadow-[4px_4px_0px_0px_#121212] focus:outline-none px-4 py-3.5 text-sm font-bold text-[#121212] placeholder:text-[#424245]/50 transition-all rounded-none"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-black uppercase tracking-wider text-[#121212]"
                  >
                    02 // ACCESS KEY
                  </label>
                  <span className="text-[10px] font-bold text-[#424245] uppercase tracking-wider">
                    DEPT ADMIN RESET
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full bg-[#F0F0F0] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] focus:bg-white focus:shadow-[4px_4px_0px_0px_#121212] focus:outline-none px-4 py-3.5 text-sm font-bold text-[#121212] placeholder:text-[#424245]/50 transition-all rounded-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#121212] hover:text-[#D02020] p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-[#D02020]/10 border-2 border-[#D02020] p-3 text-xs font-bold text-[#D02020] uppercase tracking-wider flex items-center gap-2">
                  <Lock size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={isPending}
                className="mt-2 w-full inline-flex items-center justify-center gap-3 bg-[#D02020] text-white border-2 sm:border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#D02020]/90 py-4 text-xs sm:text-sm font-black tracking-widest uppercase transition-all duration-150 cursor-pointer disabled:opacity-60"
              >
                {isPending ? (
                  <span>AUTHENTICATING NODE…</span>
                ) : (
                  <>
                    <span>AUTHENTICATE &amp; ENTER</span>
                    <ArrowRight size={18} strokeWidth={3} />
                  </>
                )}
              </button>
            </form>

            {/* Security notice */}
            <div className="mt-7 pt-4 border-t-2 border-[#121212] flex items-center gap-3 text-xs font-medium text-[#424245]">
              <Shield size={18} className="shrink-0 text-[#1040C0]" />
              <span>VTU autonomous single sign-on with 256-bit encrypted credential verification.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Marquee Strip */}
      <footer className="bg-[#121212] text-white border-t-4 border-[#121212] py-3 px-4 text-xs font-bold uppercase tracking-widest flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#D02020]" />
          <span>BMS INSTITUTE OF TECHNOLOGY &amp; MANAGEMENT // DEPT OF CSE</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[#F0C020]">
          <span>FORM FOLLOWS FUNCTION</span>
          <span>·</span>
          <span>ENTER ONCE, SYNC EVERYWHERE</span>
        </div>
      </footer>
    </div>
  );
}