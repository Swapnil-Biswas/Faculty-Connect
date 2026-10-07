"use client";

import { useState, useTransition } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  KeyRound,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { testWebhookEndpoint, WebhookTestResult } from "@/actions/webhooks";

export function WebhooksClient() {
  const [endpointUrl, setEndpointUrl] = useState("https://webhook.site/placeholder");
  const [selectedEvent, setSelectedEvent] = useState("TASK_COMPLETED");
  const [secretToken, setSecretToken] = useState("fc_sec_9938472910");
  const [result, setResult] = useState<WebhookTestResult | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      const res = await testWebhookEndpoint(endpointUrl, selectedEvent, secretToken);
      setResult(res);
    });
  };

  const integrations = [
    {
      name: "Campus ERP Connector",
      desc: "Push faculty leave approvals and service records directly into SAP / Oracle PeopleSoft ERP systems.",
      status: "Active Blueprint",
      events: ["LEAVE_APPROVED", "ROLE_CHANGED"],
    },
    {
      name: "LMS & Accreditation Sync",
      desc: "Export task completion records and appraisal metrics into Moodle / Canvas LMS accreditation endpoints.",
      status: "Configured Blueprint",
      events: ["TASK_COMPLETED", "EVALUATION_SUBMITTED"],
    },
    {
      name: "Department Slack / Teams Bot",
      desc: "Post instant departmental alerts for Faculty of the Month honorees and critical task milestones.",
      status: "Ready Blueprint",
      events: ["FACULTY_OF_MONTH", "STARS_AWARDED"],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 3 Connector Definitions Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
          gap: 20,
        }}
      >
        {integrations.map((itg, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: 12,
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 16,
              boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      backgroundColor: "#F7F8FA",
                      border: "1px solid #E4E7EC",
                      color: "#173B67",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Server size={18} />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        margin: 0,
                        color: "#17202A",
                        lineHeight: 1.3,
                      }}
                    >
                      {itg.name}
                    </h2>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 4,
                    backgroundColor: "#F2F4F7",
                    color: "#475467",
                    border: "1px solid #E4E7EC",
                    whiteSpace: "nowrap",
                  }}
                >
                  {itg.status}
                </span>
              </div>

              <p
                style={{
                  fontSize: 13,
                  color: "#667085",
                  lineHeight: 1.5,
                  margin: "0 0 16px 0",
                }}
              >
                {itg.desc}
              </p>
            </div>

            <div
              style={{
                borderTop: "1px solid #F2F4F7",
                paddingTop: 12,
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#667085",
                  marginRight: 4,
                }}
              >
                Events:
              </span>
              {itg.events.map((ev) => (
                <span
                  key={ev}
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "#173B67",
                    backgroundColor: "#F0F4F8",
                    border: "1px solid #D0DCE8",
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {ev}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Webhook Dispatch Tester Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E4E7EC",
          borderRadius: 12,
          padding: 28,
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
          maxWidth: 900,
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: "#F0F4F8",
                border: "1px solid #D0DCE8",
                color: "#173B67",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <KeyRound size={16} />
            </div>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 700,
                margin: 0,
                color: "#17202A",
              }}
            >
              Live Webhook Simulator &amp; Delivery Test
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "#667085", margin: 0, lineHeight: 1.5 }}>
            Dispatch an authenticated JSON test payload to verify external listener reachability and HMAC SHA-256 signature validation.
          </p>
        </div>

        <form onSubmit={handleTest} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label
              htmlFor="endpointUrl"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "#344054",
                marginBottom: 6,
              }}
            >
              Endpoint Destination URL <span style={{ color: "#D92D20" }}>*</span>
            </label>
            <input
              id="endpointUrl"
              type="url"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="https://your-domain.edu/api/webhook"
              required
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 6,
                border: "1px solid #D0D5DD",
                fontSize: 13,
                color: "#17202A",
                backgroundColor: "#FFFFFF",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <label
                htmlFor="eventType"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#344054",
                  marginBottom: 6,
                }}
              >
                Simulated Event Type
              </label>
              <select
                id="eventType"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 6,
                  border: "1px solid #D0D5DD",
                  fontSize: 13,
                  color: "#17202A",
                  backgroundColor: "#FFFFFF",
                  boxSizing: "border-box",
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

            <div>
              <label
                htmlFor="secretToken"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#344054",
                  marginBottom: 6,
                }}
              >
                HMAC Signing Secret <span style={{ color: "#667085", fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                id="secretToken"
                type="text"
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
                placeholder="Leave blank for unsigned dispatch"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 6,
                  border: "1px solid #D0D5DD",
                  fontSize: 13,
                  color: "#17202A",
                  backgroundColor: "#FFFFFF",
                  boxSizing: "border-box",
                  outline: "none",
                  fontFamily: "var(--font-mono)",
                }}
              />
              <span style={{ fontSize: 11, color: "#667085", marginTop: 4, display: "block" }}>
                When provided, signs the exact body using HMAC-SHA256 into <code>X-Hub-Signature-256</code> and <code>X-FC-Signature</code> headers.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
            <button
              type="submit"
              disabled={isPending}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "#FFFFFF",
                backgroundColor: isPending ? "#475467" : "#173B67",
                border: "none",
                cursor: isPending ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
              }}
            >
              {isPending ? (
                <>
                  <RefreshCw size={14} className="spin" />
                  <span>Dispatching Test Payload...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Send Test Webhook</span>
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
              backgroundColor: result.success
                ? "rgba(25, 135, 84, 0.02)"
                : "rgba(192, 57, 43, 0.02)",
              border: `1px solid ${
                result.success ? "#BBF7D0" : "rgba(192, 57, 43, 0.25)"
              }`,
              borderLeft: `3px solid ${result.success ? "#198754" : "#C0392B"}`,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {result.success ? (
                  <CheckCircle2 size={18} color="#198754" />
                ) : (
                  <AlertCircle size={18} color="#C0392B" />
                )}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#17202A",
                  }}
                >
                  {result.statusCode ? `HTTP ${result.statusCode}` : "Dispatch Outcome"}
                </span>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 4,
                    backgroundColor: result.hasSignature ? "#EFF8FF" : "#F2F4F7",
                    color: result.hasSignature ? "#175CD3" : "#475467",
                    border: `1px solid ${result.hasSignature ? "#B2DDFF" : "#E4E7EC"}`,
                  }}
                >
                  {result.hasSignature ? "HMAC-SHA256 Signed" : "Unsigned test dispatch"}
                </span>

                {typeof result.durationMs === "number" && (
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "#667085",
                      backgroundColor: "#F2F4F7",
                      padding: "1px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {result.durationMs}ms
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  color: "#667085",
                }}
              >
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: "#344054", lineHeight: 1.45 }}>
              {result.message}
            </p>

            {/* Request Headers Sent (Secret is NEVER shown) */}
            {result.headersSent && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowHeaders(!showHeaders)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#2F6FED",
                    backgroundColor: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  {showHeaders ? (
                    <>
                      <ChevronUp size={13} />
                      <span>Hide Request Headers Sent</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={13} />
                      <span>View Request Headers Sent ({Object.keys(result.headersSent).length})</span>
                    </>
                  )}
                </button>

                {showHeaders && (
                  <pre
                    style={{
                      marginTop: 8,
                      backgroundColor: "#F7F8FA",
                      border: "1px solid #E4E7EC",
                      padding: "12px 14px",
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontFamily: "var(--font-mono)",
                      color: "#17202A",
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(result.headersSent, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Transmitted JSON Payload */}
            {result.payload && (
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "#667085",
                    marginBottom: 4,
                  }}
                >
                  Transmitted JSON Payload:
                </span>
                <pre
                  style={{
                    backgroundColor: "#F7F8FA",
                    border: "1px solid #E4E7EC",
                    padding: "12px 14px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontFamily: "var(--font-mono)",
                    color: "#17202A",
                    overflowX: "auto",
                    margin: 0,
                  }}
                >
                  {JSON.stringify(result.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
