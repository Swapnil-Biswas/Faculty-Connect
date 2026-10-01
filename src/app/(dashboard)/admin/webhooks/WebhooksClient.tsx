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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20, marginBottom: 28 }}>
        {integrations.map((itg, i) => (
          <div
            key={i}
            style={{
              background: "#0E121B",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 12,
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 16,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              transition: "border-color 0.2s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.18)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: "rgba(56, 189, 248, 0.1)",
                      border: "1px solid rgba(56, 189, 248, 0.25)",
                      color: "#38BDF8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Server size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#F8FAFC" }}>{itg.name}</h3>
                    <span style={{ fontSize: 11, color: "#64748B", fontFamily: "var(--font-mono)" }}>CONNECTOR NODE</span>
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#22C55E",
                    background: "rgba(34, 197, 94, 0.12)",
                    border: "1px solid rgba(34, 197, 94, 0.25)",
                    padding: "3px 8px",
                    borderRadius: 4,
                  }}
                >
                  ● {itg.status.toUpperCase()}
                </span>
              </div>

              <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, margin: 0 }}>
                {itg.desc}
              </p>
            </div>

            <div style={{ fontSize: 11, color: "#64748B", borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: 12, fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "#94A3B8" }}>EVENTS: </span>
              <code style={{ color: "#F59E0B", background: "rgba(245, 158, 11, 0.08)", padding: "2px 6px", borderRadius: 4 }}>
                {itg.events}
              </code>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook Dispatch Tester Card */}
      <div
        style={{
          background: "#0E121B",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 12,
          padding: 28,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          maxWidth: 860,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={18} style={{ color: "#F59E0B" }} />
          </div>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", fontFamily: "var(--font-mono)" }}>
              // DISPATCH SIMULATOR
            </span>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: "2px 0 0", color: "#F8FAFC" }}>
              Live Webhook Simulator & Delivery Test
            </h2>
          </div>
        </div>
        <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 24px 0" }}>
          Dispatch an authenticated JSON test payload signed with an HMAC SHA-256 header to test your external listener.
        </p>

        <form onSubmit={handleTest} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#CBD5E1" }} htmlFor="endpointUrl">
              ENDPOINT DESTINATION URL
            </label>
            <input
              id="endpointUrl"
              type="url"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="https://your-domain.edu/api/webhook"
              required
              style={{
                background: "#07090E",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#F8FAFC",
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#CBD5E1" }} htmlFor="eventType">
                SIMULATED EVENT TYPE
              </label>
              <select
                id="eventType"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                style={{
                  background: "#07090E",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#F8FAFC",
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              >
                <option value="TASK_COMPLETED">TASK_COMPLETED (High Priority)</option>
                <option value="LEAVE_APPROVED">LEAVE_APPROVED (Sanction Event)</option>
                <option value="FACULTY_OF_MONTH">FACULTY_OF_MONTH (Announcement)</option>
                <option value="EVALUATION_SUBMITTED">EVALUATION_SUBMITTED (Appraisal)</option>
                <option value="SYSTEM_HEALTH_CHECK">SYSTEM_HEALTH_CHECK (Ping)</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#CBD5E1" }} htmlFor="secretToken">
                HMAC SIGNING SECRET
              </label>
              <input
                id="secretToken"
                type="text"
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
                style={{
                  background: "#07090E",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#F59E0B",
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button
              type="submit"
              disabled={isPending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                border: "none",
                borderRadius: 8,
                color: "#0A0D14",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                fontWeight: 800,
                cursor: isPending ? "not-allowed" : "pointer",
                boxShadow: "0 0 16px rgba(245, 158, 11, 0.35)",
              }}
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
              background: result.success ? "rgba(34, 197, 94, 0.06)" : "rgba(244, 63, 94, 0.06)",
              border: `1px solid ${result.success ? "rgba(34, 197, 94, 0.3)" : "rgba(244, 63, 94, 0.3)"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              {result.success ? (
                <CheckCircle2 size={18} style={{ color: "#22C55E" }} />
              ) : (
                <AlertCircle size={18} style={{ color: "#F43F5E" }} />
              )}
              <strong style={{ fontSize: 14, color: "#F8FAFC", fontFamily: "var(--font-mono)" }}>
                {result.message}
              </strong>
            </div>

            {result.payload && (
              <pre
                style={{
                  background: "#07090E",
                  padding: 14,
                  borderRadius: 6,
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "#38BDF8",
                  overflowX: "auto",
                  marginTop: 10,
                  border: "1px solid rgba(255, 255, 255, 0.06)",
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
