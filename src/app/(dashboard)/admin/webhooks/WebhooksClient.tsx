"use client";

import { useState, useTransition } from "react";
import { Send, CheckCircle2, AlertCircle, Globe, Shield, RefreshCw, Zap, Server } from "lucide-react";
import { testWebhookEndpoint, WebhookTestResult } from "@/actions/webhooks";

export function WebhooksClient() {
  const [endpointUrl, setEndpointUrl] = useState("https://webhook.site/placeholder");
  const [selectedEvent, setSelectedEvent] = useState("TASK_COMPLETED");
  const [secretToken, setSecretToken] = useState("fc_sec_9938472910");
  const [result, setResult] = useState<WebhookTestResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      const res = await testWebhookEndpoint(endpointUrl, selectedEvent);
      setResult(res);
    });
  };

  const integrations = [
    {
      name: "Campus ERP Connector",
      desc: "Push faculty leave approvals and service records directly into SAP / Oracle PeopleSoft ERP.",
      status: "Active",
      events: "LEAVE_APPROVED, ROLE_CHANGED",
    },
    {
      name: "LMS & Accreditation Sync",
      desc: "Export task progress and evaluation metrics to Moodle / Canvas LMS accreditation buckets.",
      status: "Configured",
      events: "TASK_COMPLETED, EVALUATION_SUBMITTED",
    },
    {
      name: "Department Slack / Teams Bot",
      desc: "Post instant celebration alerts for Faculty of the Month and high-velocity star earners.",
      status: "Ready",
      events: "FACULTY_OF_MONTH, STARS_AWARDED",
    },
  ];

  return (
    <div>
      {/* Integrations Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18, marginBottom: 28 }}>
        {integrations.map((itg, i) => (
          <div key={i} className="card" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "hsl(var(--color-primary) / 0.12)",
                    color: "hsl(var(--color-primary))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Server size={18} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{itg.name}</h3>
              </div>
              <span className="role-badge" style={{ background: "hsl(var(--color-success) / 0.12)", color: "hsl(var(--color-success))", fontSize: 11 }}>
                {itg.status}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", lineHeight: 1.5, marginBottom: 14 }}>
              {itg.desc}
            </p>

            <div style={{ fontSize: 11.5, color: "hsl(var(--text-muted))", borderTop: "1px solid hsl(var(--border))", paddingTop: 10 }}>
              <strong>Subscribed Events:</strong> <code>{itg.events}</code>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook Dispatch Tester Card */}
      <div className="card" style={{ maxWidth: 760 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Zap size={20} style={{ color: "#F59E0B" }} />
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0 }}>Live Webhook Simulator & Delivery Test</h2>
        </div>
        <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", marginBottom: 20 }}>
          Dispatch an authenticated JSON test payload signed with an HMAC SHA-256 header to test your external listener.
        </p>

        <form onSubmit={handleTest} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="endpointUrl">Endpoint Destination URL</label>
            <input
              id="endpointUrl"
              type="url"
              className="form-input"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="https://your-domain.edu/api/webhook"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="eventType">Simulated Event Type</label>
              <select
                id="eventType"
                className="form-input"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="TASK_COMPLETED">TASK_COMPLETED (High Priority)</option>
                <option value="LEAVE_APPROVED">LEAVE_APPROVED (Sanction Event)</option>
                <option value="FACULTY_OF_MONTH">FACULTY_OF_MONTH (Announcement)</option>
                <option value="EVALUATION_SUBMITTED">EVALUATION_SUBMITTED (Appraisal)</option>
                <option value="SYSTEM_HEALTH_CHECK">SYSTEM_HEALTH_CHECK (Ping)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="secretToken">HMAC Signing Secret</label>
              <input
                id="secretToken"
                type="text"
                className="form-input"
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
            <button type="submit" disabled={isPending} className="btn-gradient" style={{ gap: 6 }}>
              {isPending ? (
                <>
                  <RefreshCw size={16} className="spin" /> Dispatching Test Payload…
                </>
              ) : (
                <>
                  <Send size={16} /> Send Test Webhook
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result Inspection */}
        {result && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: "var(--radius-sm)",
              background: result.success ? "hsl(var(--color-success) / 0.08)" : "hsl(var(--color-danger) / 0.08)",
              border: `1px solid ${result.success ? "hsl(var(--color-success) / 0.25)" : "hsl(var(--color-danger) / 0.25)"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {result.success ? (
                <CheckCircle2 size={18} style={{ color: "hsl(var(--color-success))" }} />
              ) : (
                <AlertCircle size={18} style={{ color: "hsl(var(--color-danger))" }} />
              )}
              <strong style={{ fontSize: 14 }}>{result.message}</strong>
            </div>

            {result.payload && (
              <pre
                style={{
                  background: "hsl(var(--bg-base))",
                  padding: 12,
                  borderRadius: 6,
                  fontSize: 12,
                  overflowX: "auto",
                  marginTop: 10,
                }}
              >
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
