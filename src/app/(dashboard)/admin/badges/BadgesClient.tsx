"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  Flame,
  Star,
  Trophy,
  BookOpen,
  Award,
  Users,
  X,
  Clock,
  ExternalLink,
} from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

export interface BadgeRecipient {
  userId: string;
  awardedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BadgeItem {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  rule: Record<string, unknown>;
  createdAt: string;
  userBadges: BadgeRecipient[];
}

interface BadgesClientProps {
  badges: BadgeItem[];
}

function getBadgeIcon(name: string) {
  switch (name) {
    case "Early Bird":
      return Zap;
    case "Task Master":
      return CheckCircle2;
    case "Consistent Performer":
      return Flame;
    case "Perfect Score":
      return Star;
    case "Century Club":
      return Trophy;
    case "Research Star":
      return BookOpen;
    default:
      return Award;
  }
}

function formatRuleDescription(rule: Record<string, unknown>): string {
  const type = typeof rule.type === "string" ? rule.type : null;
  const threshold = typeof rule.threshold === "number" || typeof rule.threshold === "string" ? rule.threshold : null;

  if (type && threshold !== null) {
    const formattedType = type.replace(/_/g, " ").toLowerCase();
    return `Rule: ${formattedType} · Threshold: ${threshold}`;
  }

  if (type) {
    return `Rule: ${type.replace(/_/g, " ").toLowerCase()}`;
  }

  return "Criteria: Awarded automatically by the recognition engine.";
}

export function BadgesClient({ badges }: BadgesClientProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedBadge(null);
      }
    }
    if (selectedBadge) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedBadge]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          gap: 20,
        }}
      >
        {badges.map((badge) => {
          const IconComponent = getBadgeIcon(badge.name);
          const ruleText = formatRuleDescription(badge.rule);
          const hasEarners = badge.userBadges.length > 0;

          return (
            <div
              key={badge.id}
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
                transition: "border-color 0.15s ease",
              }}
            >
              {/* Badge Header & Icon */}
              <div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      backgroundColor: "#F0F4F8",
                      border: "1px solid #D0D7DE",
                      color: "#173B67",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconComponent size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: "#17202A",
                        lineHeight: 1.25,
                      }}
                    >
                      {badge.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "#667085",
                        marginTop: 4,
                        lineHeight: 1.45,
                      }}
                    >
                      {badge.description}
                    </div>
                  </div>
                </div>

                {/* Criteria Pill */}
                <div style={{ marginTop: 14 }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 11.5,
                      color: "#475467",
                      backgroundColor: "#F7F8FA",
                      border: "1px solid #E4E7EC",
                      borderRadius: 6,
                      padding: "4px 9px",
                      lineHeight: 1.4,
                    }}
                  >
                    {ruleText}
                  </span>
                </div>
              </div>

              {/* Conferred Count & Earner Preview */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 14,
                    borderTop: "1px solid #F2F4F7",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#17202A",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Award size={14} color="#667085" />
                    <span>
                      {badge.userBadges.length} {badge.userBadges.length === 1 ? "Award" : "Awards"} Conferred
                    </span>
                  </span>

                  {hasEarners && (
                    <button
                      type="button"
                      onClick={() => setSelectedBadge(badge)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#2F6FED",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span>View All ({badge.userBadges.length})</span>
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>

                {hasEarners ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {badge.userBadges.slice(0, 3).map((ub) => (
                      <div
                        key={ub.userId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "7px 10px",
                          backgroundColor: "#F7F8FA",
                          borderRadius: 6,
                          border: "1px solid #E4E7EC",
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: "#E4E7EC",
                            color: "#17202A",
                            fontSize: 10,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(ub.user.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#17202A",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {ub.user.name}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: "#667085",
                            flexShrink: 0,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {formatDate(ub.awardedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "16px 12px",
                      backgroundColor: "#F7F8FA",
                      borderRadius: 6,
                      border: "1px dashed #E4E7EC",
                      color: "#667085",
                      fontSize: 12,
                    }}
                  >
                    Not yet unlocked by any faculty member
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Recipient Roster Modal */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-badge-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBadge(null);
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              border: "1px solid #E4E7EC",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              width: "100%",
              maxWidth: 580,
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #E4E7EC",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#F7F8FA",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: "#F0F4F8",
                    border: "1px solid #D0D7DE",
                    color: "#173B67",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {(() => {
                    const ModalIcon = getBadgeIcon(selectedBadge.name);
                    return <ModalIcon size={18} />;
                  })()}
                </div>
                <div>
                  <h3
                    id="modal-badge-title"
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#17202A",
                      margin: 0,
                    }}
                  >
                    {selectedBadge.name}
                  </h3>
                  <p style={{ fontSize: 12, color: "#667085", margin: "2px 0 0 0" }}>
                    {selectedBadge.userBadges.length} total recipients on record
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                aria-label="Close modal"
                style={{
                  background: "none",
                  border: "1px solid #E4E7EC",
                  borderRadius: 6,
                  padding: "6px",
                  cursor: "pointer",
                  color: "#667085",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Recipient List */}
            <div
              style={{
                padding: "16px 24px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {selectedBadge.userBadges.map((ub, idx) => (
                <div
                  key={ub.userId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "1px solid #E4E7EC",
                    backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F7F8FA",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: "#E4E7EC",
                        color: "#17202A",
                        fontSize: 11,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(ub.user.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#17202A",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ub.user.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "#667085",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ub.user.email}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 11.5,
                      color: "#667085",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    <Clock size={12} color="#98A2B3" />
                    <span>{formatDate(ub.awardedAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #E4E7EC",
                display: "flex",
                justifyContent: "flex-end",
                backgroundColor: "#F7F8FA",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E4E7EC",
                  color: "#17202A",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
