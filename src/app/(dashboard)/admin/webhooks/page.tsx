import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WebhooksClient } from "./WebhooksClient";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function AdminWebhooksPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PageHeader
        breadcrumbs={[
          { label: "Admin Console", href: "/admin" },
          { label: "External Connectors & Webhooks" },
        ]}
        eyebrow="ADMIN // DISPATCH & INTEGRATION"
        dotMatrixText="WEBHOOKS"
        dotMatrixFontSize={36}
        title="Enterprise Webhooks"
        ghost="connectors."
        subtitle="Configure event dispatchers, external ERP integrations, LMS webhooks, and test HMAC-SHA256 authenticated delivery payloads."
        actions={
          <div className="hero-status-row" style={{ margin: 0, padding: "6px 14px" }}>
            <span className="hero-status-led" />
            <span className="hero-status-label">HMAC SHA-256 SIGNING</span>
          </div>
        }
      />

      <WebhooksClient />
    </div>
  );
}
