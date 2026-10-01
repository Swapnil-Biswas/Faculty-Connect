import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WebhooksClient } from "./WebhooksClient";

export default async function AdminWebhooksPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="page-content">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Enterprise Webhooks & External Connectors</h1>
        <p className="page-subtitle">
          Synchronize Faculty Connect events with external campus systems, LMS, ERP, Slack, and Microsoft Teams.
        </p>
      </div>

      <WebhooksClient />
    </div>
  );
}
