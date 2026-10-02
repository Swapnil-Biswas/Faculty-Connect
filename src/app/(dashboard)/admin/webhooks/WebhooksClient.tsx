"use client";

import { useState, useTransition } from "react";
import { Send, CheckCircle2, AlertCircle, RefreshCw, Zap, Server } from "lucide-react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Integrations Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
        {integrations.map((itg, i) => (
          <div
            key={i}
            className="card cyber-card-hover"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 16,
              padding: 24,
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(2, 132, 199, 0.08)",
                      border: "1px solid rgba(2, 132, 199, 0.2)",
                      color: "#0284c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Server size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "var(--foreground)" }}>{itg.name}</h3>
                    <span style={{ fontSize: 11, color: "var(--grey-400)", fontFamily: "var(--font-mono)" }}>CONNECTOR NODE</span>
                  </div>
                </div>
                <span className="badge status-published">
                  <span className="badge-dot" />
                  {itg.status.toUpperCase()}
                </span>
              </div>

              <p style={{ fontSize: 13, color: "var(--grey-600)", lineHeight: 1.6, margin: 0 }}>
                {itg.desc}
              </p>
            </div>

            <div style={{ fontSize: 11, color: "var(--grey-500)", borderTop: "1px solid var(--border)", paddingTop: 12, fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "var(--grey-400)" }}>EVENTS: </span>
              <code style={{ color: "#d97706", background: "rgba(217, 119, 6, 0.08)", padding: "2px 6px", borderRadius: 4 }}>
                {itg.events}
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook Dispatch Tester Card */}
      <div className="card" style={{ maxWidth: 860, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(217, 119, 6, 0.1)", border: "1px solid rgba(217, 119, 6, 0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} style={{ color: "#d97706" }} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#d97706", fontFamily: "var(--font-mono)" }}>
              // DISPATCH SIMULATOR
            </span>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: "2px 0 0", color: "var(--foreground)" }}>
              Live Webhook Simulator &amp; Delivery Test
            </h2>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "var(--grey-500)", margin: "0 0 24px 0" }}>
          Dispatch an authenticated JSON test payload signed with an HMAC SHA-256 header to test your external listener.
        </p>

        <form onSubmit={handleTest} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="field">
            <label className="field-label" htmlFor="endpointUrl">
              ENDPOINT DESTINATION URL <span className="req">*</span>
            </label>
            <input
              id="endpointUrl"
              type="url"
              className="input"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="https://your-domain.edu/api/webhook"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div className="field">
              <label className="field-label" htmlFor="eventType">
                SIMULATED EVENT TYPE
              </label>
              <select
                id="eventType"
                className="select"
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

            <div className="field">
              <label className="field-label" htmlFor="secretToken">
                HMAC SIGNING SECRET
              </label>
              <input
                id="secretToken"
                type="text"
                className="input"
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
            >
              {isPending ? (
                <>
                  <RefreshCw size={14} className="spin" /> DISPATCHING TEST PAYLOAD...
                </>
              ) : (
                <>
                  <Send size={14} /> SEND TEST WEBHOOK
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result Inspection */}
        {result && (
          <div
            style={{
              marginTop: 24,
              padding: 18,
              borderRadius: 8,
              background: result.success ? "rgba(22, 163, 74, 0.06)" : "rgba(220, 38, 38, 0.06)",
              border: `1px solid ${result.success ? "rgba(22, 163, 74, 0.25)" : "rgba(220, 38, 38, 0.25)"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              {result.success ? (
                <CheckCircle2 size={18} style={{ color: "#16a34a" }} />
              ) : (
                <AlertCircle size={18} style={{ color: "#dc2626" }} />
              )}
              <strong style={{ fontSize: 14, color: "var(--foreground)", fontFamily: "var(--font-mono)" }}>
                {result.message}
              </strong>
            </div>

            {result.payload && (
              <pre
                style={{
                  background: "var(--grey-50)",
                  padding: 14,
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "var(--foreground)",
                  overflowX: "auto",
                  marginTop: 10,
                  border: "1px solid var(--border)",
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
