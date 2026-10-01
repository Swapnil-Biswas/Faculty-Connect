"use client";

import { useState, useTransition } from "react";
import {
  BookOpen,
  Plus,
  ExternalLink,
  Trash2,
  Search,
  Award,
  X,
  FileText,
} from "lucide-react";
import { createPublication, deletePublication } from "@/actions/publications";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { EmptyState } from "@/components/ui/EmptyState";

interface PublicationItem {
  id: string;
  title: string;
  type: string;
  journal: string | null;
  conference: string | null;
  year: number;
  doi: string | null;
  createdAt: string;
}

interface Props {
  initialPublications: PublicationItem[];
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string; glyph: string }> = {
  JOURNAL: { label: "Journal Article", bg: "rgba(14, 165, 233, 0.1)", color: "#38BDF8", border: "rgba(14, 165, 233, 0.3)", glyph: "◆" },
  CONFERENCE: { label: "Conference Paper", bg: "rgba(34, 197, 94, 0.1)", color: "#4ADE80", border: "rgba(34, 197, 94, 0.3)", glyph: "▣" },
  BOOK_CHAPTER: { label: "Book Chapter", bg: "rgba(245, 158, 11, 0.1)", color: "#FCD34D", border: "rgba(245, 158, 11, 0.3)", glyph: "◈" },
  PATENT: { label: "Patent", bg: "rgba(129, 140, 248, 0.1)", color: "#A78BFA", border: "rgba(129, 140, 248, 0.3)", glyph: "★" },
  OTHER: { label: "Other Publication", bg: "rgba(100, 116, 139, 0.1)", color: "#94A3B8", border: "rgba(100, 116, 139, 0.25)", glyph: "—" },
};

export function PublicationsClient({ initialPublications }: Props) {
  const [publications, setPublications] = useState(initialPublications);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const journalCount = publications.filter((p) => p.type === "JOURNAL").length;
  const confCount = publications.filter((p) => p.type === "CONFERENCE").length;
  const patentCount = publications.filter((p) => p.type === "PATENT").length;
  const bookCount = publications.filter((p) => p.type === "BOOK_CHAPTER").length;

  const filtered = publications.filter((p) => {
    if (activeTab !== "ALL" && p.type !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.journal && p.journal.toLowerCase().includes(q)) ||
        (p.conference && p.conference.toLowerCase().includes(q)) ||
        (p.doi && p.doi.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createPublication({ success: false }, formData);
      if (!res.success) {
        setFormError(res.error || "Failed to record publication");
      } else {
        setShowAddModal(false);
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this publication record?")) return;

    startTransition(async () => {
      const res = await deletePublication(id);
      if (!res.success) {
        alert(res.error || "Failed to delete");
      } else {
        setPublications((prev) => prev.filter((p) => p.id !== id));
      }
    });
  };

  return (
    <div>
      {/* 1. Research Summary Metric Blocks */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Total Publications"
          value={publications.length}
          context="Indexed academic items"
          trendType="neutral"
          icon={<BookOpen size={18} color="#FFD700" />}
        />
        <MetricBlock
          label="Journal Articles"
          value={journalCount}
          context="Peer-reviewed journals"
          trendType="positive"
          icon={<FileText size={18} color="#38BDF8" />}
        />
        <MetricBlock
          label="Conference Papers"
          value={confCount}
          context="Proceedings & symposia"
          trendType="neutral"
          icon={<Award size={18} color="#4ADE80" />}
        />
        <MetricBlock
          label="Patents & Chapters"
          value={patentCount + bookCount}
          context="IP & authored chapters"
          trendType="neutral"
          icon={<Award size={18} color="#A78BFA" />}
        />
      </div>

      {/* 2. Controls Toolbar: Search, Filter Tabs, Add Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "ALL", label: "ALL ITEMS", count: publications.length },
            { id: "JOURNAL", label: "JOURNALS", count: journalCount },
            { id: "CONFERENCE", label: "CONFERENCES", count: confCount },
            { id: "BOOK_CHAPTER", label: "CHAPTERS", count: bookCount },
            { id: "PATENT", label: "PATENTS", count: patentCount },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  height: 34,
                  padding: "0 12px",
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontFamily: "var(--font-mono)",
                  fontWeight: isActive ? 700 : 500,
                  border: isActive ? "1px solid #FFD700" : "1px solid rgba(255, 255, 255, 0.08)",
                  backgroundColor: isActive ? "rgba(255, 215, 0, 0.1)" : "rgba(255, 255, 255, 0.02)",
                  color: isActive ? "#FFD700" : "#94A3B8",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s ease",
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 5px",
                    borderRadius: 4,
                    backgroundColor: isActive ? "rgba(255, 215, 0, 0.2)" : "rgba(255, 255, 255, 0.06)",
                    color: isActive ? "#FFD700" : "#64748B",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Add Action */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search
              size={14}
              color="#64748B"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by title, venue, DOI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: 36,
                padding: "0 14px 0 34px",
                fontSize: 12.5,
                fontFamily: "var(--font-mono)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 6,
                backgroundColor: "#07090E",
                color: "#F8FAFC",
                width: 250,
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#FFD700";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ height: 36, padding: "0 14px", fontSize: 12.5, fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}
          >
            <Plus size={14} />
            + RECORD ITEM
          </button>
        </div>
      </div>

      {/* 3. Publications Registry Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="NO PUBLICATION RECORDS FOUND"
          description={
            searchQuery
              ? "No publication matches your query. Try a different search term or category filter."
              : "No research items recorded in this category. Click '+ Record Item' to register a new publication."
          }
          action={
            !searchQuery ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
                style={{ fontSize: 12.5, fontFamily: "var(--font-mono)" }}
              >
                <Plus size={14} /> + RECORD ITEM
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="tech-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "rgba(7, 9, 14, 0.7)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#64748B",
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  <th style={{ padding: "14px 22px", width: "45%" }}>Publication Title & Outlet</th>
                  <th style={{ padding: "14px 16px" }}>Category</th>
                  <th style={{ padding: "14px 16px" }}>Year</th>
                  <th style={{ padding: "14px 18px" }}>Digital Identifier (DOI)</th>
                  <th style={{ padding: "14px 22px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pub, idx) => {
                  const typeMeta = TYPE_CONFIG[pub.type] || TYPE_CONFIG.OTHER;
                  const venue = pub.journal || pub.conference || "Institutional Repository";

                  return (
                    <tr
                      key={pub.id}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? "1px solid rgba(255, 255, 255, 0.04)" : "none",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      {/* Title & Venue */}
                      <td style={{ padding: "16px 22px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "#F8FAFC", lineHeight: 1.35, marginBottom: 4 }}>
                          {pub.title}
                        </div>
                        <div style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#64748B" }}>
                          VENUE: <span style={{ color: "#94A3B8" }}>{venue}</span>
                        </div>
                      </td>

                      {/* Type Pill */}
                      <td style={{ padding: "16px 16px", verticalAlign: "top" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 10.5,
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            backgroundColor: typeMeta.bg,
                            color: typeMeta.color,
                            border: `1px solid ${typeMeta.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span>{typeMeta.glyph}</span>
                          <span>{typeMeta.label}</span>
                        </span>
                      </td>

                      {/* Year */}
                      <td style={{ padding: "16px 16px", verticalAlign: "top", color: "#F8FAFC", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        {pub.year}
                      </td>

                      {/* DOI */}
                      <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                        {pub.doi ? (
                          <a
                            href={pub.doi.startsWith("http") ? pub.doi : `https://doi.org/${pub.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 11.5,
                              color: "#38BDF8",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              maxWidth: 220,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span>{pub.doi}</span>
                            <ExternalLink size={11} style={{ flexShrink: 0 }} />
                          </a>
                        ) : (
                          <span style={{ fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#475569" }}>NOT_AVAILABLE</span>
                        )}
                      </td>

                      {/* Delete Action */}
                      <td style={{ padding: "16px 22px", verticalAlign: "top", textAlign: "right" }}>
                        <button
                          onClick={() => handleDelete(pub.id)}
                          title="Delete record"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#64748B",
                            cursor: "pointer",
                            padding: 6,
                            borderRadius: 4,
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#F43F5E";
                            e.currentTarget.style.backgroundColor = "rgba(244, 63, 94, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#64748B";
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Administrative Add Publication Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
        >
          <div
            style={{
              backgroundColor: "#0E121B",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.12)",
              width: "100%",
              maxWidth: 540,
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.08)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 22px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(7, 9, 14, 0.6)",
              }}
            >
              <div>
                <span className="hero-eyebrow" style={{ margin: 0 }}>
                  // REGISTER PUBLICATION
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "2px 0 0 0" }}>
                  Record Academic Publication
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddSubmit} style={{ padding: "22px" }}>
              {formError && (
                <div
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "rgba(244, 63, 94, 0.1)",
                    border: "1px solid rgba(244, 63, 94, 0.35)",
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: "var(--font-mono)",
                    color: "#FB7185",
                    marginBottom: 16,
                  }}
                >
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Title */}
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "#FFD700", marginBottom: 6 }}>
                    01 // PUBLICATION TITLE *
                  </label>
                  <input
                    name="title"
                    required
                    placeholder="Full title of the paper, patent, or chapter..."
                    style={{
                      width: "100%",
                      height: 38,
                      padding: "0 12px",
                      fontSize: 13,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 6,
                      backgroundColor: "#07090E",
                      color: "#F8FAFC",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#FFD700";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    }}
                  />
                </div>

                {/* Type & Year */}
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "#FFD700", marginBottom: 6 }}>
                      02 // CATEGORY *
                    </label>
                    <select
                      name="type"
                      required
                      style={{
                        width: "100%",
                        height: 38,
                        padding: "0 10px",
                        fontSize: 13,
                        fontFamily: "var(--font-mono)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: 6,
                        backgroundColor: "#07090E",
                        color: "#F8FAFC",
                        outline: "none",
                      }}
                    >
                      <option value="JOURNAL">Journal Article</option>
                      <option value="CONFERENCE">Conference Paper</option>
                      <option value="BOOK_CHAPTER">Book Chapter</option>
                      <option value="PATENT">Patent</option>
                      <option value="OTHER">Other Publication</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "#FFD700", marginBottom: 6 }}>
                      03 // YEAR *
                    </label>
                    <input
                      name="year"
                      type="number"
                      required
                      min={1950}
                      max={new Date().getFullYear() + 1}
                      defaultValue={new Date().getFullYear()}
                      style={{
                        width: "100%",
                        height: 38,
                        padding: "0 12px",
                        fontSize: 13,
                        fontFamily: "var(--font-mono)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: 6,
                        backgroundColor: "#07090E",
                        color: "#F8FAFC",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Journal / Conference Venue */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>
                      JOURNAL NAME
                    </label>
                    <input
                      name="journal"
                      placeholder="e.g. IEEE Trans. on AI"
                      style={{
                        width: "100%",
                        height: 38,
                        padding: "0 12px",
                        fontSize: 13,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: 6,
                        backgroundColor: "#07090E",
                        color: "#F8FAFC",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>
                      CONFERENCE NAME
                    </label>
                    <input
                      name="conference"
                      placeholder="e.g. ICML 2026"
                      style={{
                        width: "100%",
                        height: 38,
                        padding: "0 12px",
                        fontSize: 13,
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: 6,
                        backgroundColor: "#07090E",
                        color: "#F8FAFC",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* DOI */}
                <div>
                  <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, color: "#94A3B8", marginBottom: 6 }}>
                    DIGITAL IDENTIFIER (DOI)
                  </label>
                  <input
                    name="doi"
                    placeholder="e.g. 10.1109/TPAMI.2026.1234567"
                    style={{
                      width: "100%",
                      height: 38,
                      padding: "0 12px",
                      fontSize: 12.5,
                      fontFamily: "var(--font-mono)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: 6,
                      backgroundColor: "#07090E",
                      color: "#F8FAFC",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 24,
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  paddingTop: 16,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline"
                  style={{ height: 36, padding: "0 14px", fontSize: 12, fontFamily: "var(--font-mono)" }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                  style={{ height: 36, padding: "0 18px", fontSize: 12, fontFamily: "var(--font-mono)" }}
                >
                  {isPending ? "RECORDING..." : "SAVE RECORD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
