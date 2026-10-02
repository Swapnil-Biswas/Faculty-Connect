import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobsClient } from "./JobsClient";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function AdminJobsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="page-content" style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Jobs" },
        ]}
        dotMatrixText="JOBS"
        eyebrow="SYSTEM AUTOMATION · CRON ENGINE"
        title="Automated Jobs & System Maintenance"
        subtitle="Scheduled cron tasks, background sweepers, email notification digests & system integrity jobs."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 8, background: "var(--grey-50)", border: "1px solid var(--grey-200)" }}>
            <span className="tech-led led-green" />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "var(--grey-800)" }}>
              DAEMON ACTIVE
            </span>
          </div>
        }
      />

      <JobsClient />
    </div>
  );
}
