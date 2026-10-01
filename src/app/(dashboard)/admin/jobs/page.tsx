import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobsClient } from "./JobsClient";

export default async function AdminJobsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* BMSIT High-Tech Header */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "3px 10px", borderRadius: 4, background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", color: "#F59E0B", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 10 }}>
            <span>●</span> SYSTEM AUTOMATION // CRON ENGINE
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F8FAFC", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
            Automated Jobs & System Maintenance
          </h1>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, fontFamily: "var(--font-mono)" }}>
            // Scheduled cron tasks, background sweepers, email notification digests & system integrity jobs
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 6, background: "rgba(14, 18, 27, 0.8)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E", display: "inline-block" }}></span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#E2E8F0" }}>DAEMON ACTIVE</span>
        </div>
      </div>

      <JobsClient />
    </div>
  );
}
