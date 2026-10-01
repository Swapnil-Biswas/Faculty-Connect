"use client";

import { useState, useTransition } from "react";
import {
  BookOpen,
  Plus,
  ExternalLink,
  Trash2,
  Search,
  Award,
  Calendar,
  X,
  FileText,
} from "lucide-react";
import { createPublication, deletePublication } from "@/actions/publications";
import { MetricBlock } from "@/components/ui/MetricBlock";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

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

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  JOURNAL: { label: "Journal Article", bg: "#EFF6FF", color: "#173B67", border: "#BFDBFE" },
  CONFERENCE: { label: "Conference Paper", bg: "#F0FDF4", color: "#198754", border: "#BBF7D0" },
  BOOK_CHAPTER: { label: "Book Chapter", bg: "#FEFCE8", color: "#B7791F", border: "#FEF08A" },
  PATENT: { label: "Patent", bg: "#F3E8FF", color: "#7E22CE", border: "#E9D5FF" },
  OTHER: { label: "Other Publication", bg: "#F2F4F7", color: "#667085", border: "#E4E7EC" },
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
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MetricBlock
          label="Total Publications"
          value={publications.length}
          context="Indexed academic items"
          trendType="neutral"
          icon={<BookOpen size={18} />}
        />
        <MetricBlock
          label="Journal Articles"
          value={journalCount}
          context="Peer-reviewed journals"
          trendType="positive"
          icon={<FileText size={18} />}
        />
        <MetricBlock
          label="Conference Papers"
          value={confCount}
          context="Proceedings & symposia"
          trendType="neutral"
          icon={<Award size={18} />}
        />
        <MetricBlock
          label="Patents & Chapters"
          value={patentCount + bookCount}
          context="IP & authored chapters"
          trendType="neutral"
          icon={<Award size={18} />}
        />
      </div>

      {/* 2. Controls Toolbar: Search, Filter Tabs, Add Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "ALL", label: "All Items", count: publications.length },
            { id: "JOURNAL", label: "Journals", count: journalCount },
            { id: "CONFERENCE", label: "Conferences", count: confCount },
            { id: "BOOK_CHAPTER", label: "Chapters", count: bookCount },
            { id: "PATENT", label: "Patents", count: patentCount },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  height: 32,
                  padding: "0 12px",
                  borderRadius: 4,
                  fontSize: 12.5,
                  fontWeight: isActive ? 600 : 500,
                  border: isActive ? "1px solid #173B67" : "1px solid #E4E7EC",
                  backgroundColor: isActive ? "#173B67" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#667085",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: "0 5px",
                    borderRadius: 10,
                    backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : "#F2F4F7",
                    color: isActive ? "#FFFFFF" : "#667085",
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
              color="#667085"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by title, venue, DOI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: 34,
                padding: "0 12px 0 32px",
                fontSize: 13,
                border: "1px solid #E4E7EC",
                borderRadius: 4,
                backgroundColor: "#FFFFFF",
                color: "#17202A",
                width: 240,
              }}
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ height: 34, padding: "0 14px", fontSize: 13, whiteSpace: "nowrap" }}
          >
            <Plus size={15} />
            Record Publication
          </button>
        </div>
      </div>

      {/* 3. Publications Registry Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No publication records found"
          description={
            searchQuery
              ? "No publication matches your search criteria. Try a different query."
              : "No research items recorded in this category. Click 'Record Publication' to add an entry."
          }
          action={
            !searchQuery ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary"
                style={{ fontSize: 13 }}
              >
                <Plus size={15} /> Record Publication
              </button>
            ) : undefined
          }
        />
      ) : (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0 1px 2px 0 rgba(16, 24, 40, 0.04)",
          }}
        >
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
                    backgroundColor: "#F7F8FA",
                    borderBottom: "1px solid #E4E7EC",
                    color: "#667085",
                    fontSize: 11.5,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  <th style={{ padding: "12px 18px", width: "45%" }}>Publication Title & Outlet</th>
                  <th style={{ padding: "12px 14px" }}>Category</th>
                  <th style={{ padding: "12px 14px" }}>Year</th>
                  <th style={{ padding: "12px 16px" }}>Digital Object Identifier (DOI)</th>
                  <th style={{ padding: "12px 18px", textAlign: "right" }}>Actions</th>
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
                        borderBottom: idx < filtered.length - 1 ? "1px solid #F2F4F7" : "none",
                      }}
                    >
                      {/* Title & Venue */}
                      <td style={{ padding: "14px 18px", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "#17202A", lineHeight: 1.35, marginBottom: 4 }}>
                          {pub.title}
                        </div>
                        <div style={{ fontSize: 12, color: "#667085" }}>
                          Published in: <span style={{ fontWeight: 500, color: "#17202A" }}>{venue}</span>
                        </div>
                      </td>

                      {/* Type Pill */}
                      <td style={{ padding: "14px 14px", verticalAlign: "top" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            backgroundColor: typeMeta.bg,
                            color: typeMeta.color,
                            border: `1px solid ${typeMeta.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {typeMeta.label}
                        </span>
                      </td>

                      {/* Year */}
                      <td style={{ padding: "14px 14px", verticalAlign: "top", color: "#17202A", fontWeight: 500 }}>
                        {pub.year}
                      </td>

                      {/* DOI (Technical Monospace) */}
                      <td style={{ padding: "14px 16px", verticalAlign: "top" }}>
                        {pub.doi ? (
                          <a
                            href={pub.doi.startsWith("http") ? pub.doi : `https://doi.org/${pub.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: "ui-monospace, monospace",
                              fontSize: 12,
                              color: "#2F6FED",
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
                          <span style={{ fontSize: 12, color: "#98A2B3" }}>Not available</span>
                        )}
                      </td>

                      {/* Delete Action */}
                      <td style={{ padding: "14px 18px", verticalAlign: "top", textAlign: "right" }}>
                        <button
                          onClick={() => handleDelete(pub.id)}
                          title="Delete record"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#667085",
                            cursor: "pointer",
                            padding: 4,
                            borderRadius: 4,
                          }}
                          className="hover:text-red-600"
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
            backgroundColor: "rgba(16, 24, 40, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              border: "1px solid #E4E7EC",
              width: "100%",
              maxWidth: 540,
              boxShadow: "0 12px 24px -4px rgba(16, 24, 40, 0.12)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #E4E7EC",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#17202A", margin: 0 }}>
                  Record Academic Publication
                </h3>
                <p style={{ fontSize: 12, color: "#667085", margin: "2px 0 0 0" }}>
                  Add bibliographic details for institutional NBA/NAAC verification
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#667085",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleAddSubmit} style={{ padding: "20px" }}>
              {formError && (
                <div
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECDCA",
                    borderRadius: 4,
                    fontSize: 12,
                    color: "#C0392B",
                    marginBottom: 16,
                  }}
                >
                  {formError}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Title */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#17202A", marginBottom: 6 }}>
                    Publication Title *
                  </label>
                  <input
                    name="title"
                    required
                    placeholder="Full title of the paper or work..."
                    style={{
                      width: "100%",
                      height: 36,
                      padding: "6px 12px",
                      fontSize: 13,
                      border: "1px solid #E4E7EC",
                      borderRadius: 4,
                      backgroundColor: "#FFFFFF",
                      color: "#17202A",
                    }}
                  />
                </div>

                {/* Type & Year */}
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#17202A", marginBottom: 6 }}>
                      Category *
                    </label>
                    <select
                      name="type"
                      required
                      style={{
                        width: "100%",
                        height: 36,
                        padding: "6px 10px",
                        fontSize: 13,
                        border: "1px solid #E4E7EC",
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
                        color: "#17202A",
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
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#17202A", marginBottom: 6 }}>
                      Publication Year *
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
                        height: 36,
                        padding: "6px 12px",
                        fontSize: 13,
                        border: "1px solid #E4E7EC",
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
                        color: "#17202A",
                      }}
                    />
                  </div>
                </div>

                {/* Journal / Conference Venue */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#17202A", marginBottom: 6 }}>
                      Journal Name
                    </label>
                    <input
                      name="journal"
                      placeholder="e.g. IEEE Transactions on AI"
                      style={{
                        width: "100%",
                        height: 36,
                        padding: "6px 12px",
                        fontSize: 13,
                        border: "1px solid #E4E7EC",
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
                        color: "#17202A",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#17202A", marginBottom: 6 }}>
                      Conference Name
                    </label>
                    <input
                      name="conference"
                      placeholder="e.g. ICML 2026"
                      style={{
                        width: "100%",
                        height: 36,
                        padding: "6px 12px",
                        fontSize: 13,
                        border: "1px solid #E4E7EC",
                        borderRadius: 4,
                        backgroundColor: "#FFFFFF",
                        color: "#17202A",
                      }}
                    />
                  </div>
                </div>

                {/* DOI */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#17202A", marginBottom: 6 }}>
                    Digital Object Identifier (DOI)
                  </label>
                  <input
                    name="doi"
                    placeholder="e.g. 10.1109/TPAMI.2026.1234567"
                    style={{
                      width: "100%",
                      height: 36,
                      padding: "6px 12px",
                      fontSize: 13,
                      fontFamily: "ui-monospace, monospace",
                      border: "1px solid #E4E7EC",
                      borderRadius: 4,
                      backgroundColor: "#FFFFFF",
                      color: "#17202A",
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 24,
                  borderTop: "1px solid #E4E7EC",
                  paddingTop: 16,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline"
                  style={{ height: 34, padding: "0 14px", fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary"
                  style={{ height: 34, padding: "0 16px", fontSize: 13 }}
                >
                  {isPending ? "Recording..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
