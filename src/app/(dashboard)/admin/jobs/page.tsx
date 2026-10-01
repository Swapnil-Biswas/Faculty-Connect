import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JobsClient } from "./JobsClient";

export default async function AdminJobsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Automated Jobs & System Maintenance</h1>
        <p className="page-subtitle">
          Manage scheduled cron tasks, background sweepers, automated email notification digests, and system integrity jobs.
        </p>
      </div>

      <JobsClient />
    </div>
  );
}
