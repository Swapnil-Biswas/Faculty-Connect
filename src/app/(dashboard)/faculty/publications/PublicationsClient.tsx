"use client";

import { useState, useTransition } from "react";
import {
  BookOpen, Plus, ExternalLink, Trash2, Search, Filter,
  Award, FileText, CheckCircle2, X, Star, Sparkles
} from "lucide-react";
import { createPublication, deletePublication } from "@/actions/publications";

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

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  JOURNAL: { label: "Journal Article", color: "hsl(var(--color-primary))" },
  CONFERENCE: { label: "Conference Paper", color: "hsl(var(--color-info))" },
  BOOK_CHAPTER: { label: "Book Chapter", color: "#8B5CF6" },
  PATENT: { label: "Patent", color: "#F59E0B" },
  OTHER: { label: "Other Publication", color: "hsl(var(--text-muted))" },
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
  const totalStars = journalCount * 15 + confCount * 10 + patentCount * 25;

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
      {/* Metric Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-primary) / 0.12)", color: "hsl(var(--color-primary))" }}>
            <BookOpen size={22} />
          </div>
          <div className="stat-card-value">{publications.length}</div>
          <div className="stat-card-label">Total Publications</div>
          <div className="stat-card-trend trend-up">Indexed academic records</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "hsl(var(--color-info) / 0.12)", color: "hsl(var(--color-info))" }}>
            <FileText size={22} />
          </div>
          <div className="stat-card-value">{journalCount}</div>
          <div className="stat-card-label">Peer-Reviewed Journals</div>
          <div className="stat-card-trend" style={{ color: "hsl(var(--text-secondary))" }}>
            15 stars per publication
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}>
            <Award size={22} />
          </div>
          <div className="stat-card-value">{patentCount}</div>
          <div className="stat-card-label">Granted / Filed Patents</div>
          <div className="stat-card-trend" style={{ color: "hsl(var(--text-secondary))" }}>
            25 stars per patent
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}>
            <Star size={22} />
          </div>
          <div className="stat-card-value">★ {totalStars}</div>
          <div className="stat-card-label">Research Recognition Stars</div>
          <div className="stat-card-trend trend-up">Added directly to leaderboard</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: 260, flex: 1, maxWidth: 400 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "hsl(var(--text-muted))",
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by title, journal, or DOI…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => {
            setFormError("");
            setShowAddModal(true);
          }}
          className="btn-gradient"
          style={{ fontSize: 13, gap: 6 }}
        >
          <Plus size={16} />
          Add Publication
        </button>
      </div>

      {/* Type Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid hsl(var(--border))",
          marginBottom: 20,
          overflowX: "auto",
        }}
      >
        {[
          { key: "ALL", label: "All Items" },
          { key: "JOURNAL", label: "Journals" },
          { key: "CONFERENCE", label: "Conferences" },
          { key: "PATENT", label: "Patents" },
          { key: "BOOK_CHAPTER", label: "Book Chapters" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid hsl(var(--color-primary))" : "2px solid transparent",
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "hsl(var(--color-primary))" : "hsl(var(--text-secondary))",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Publications List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "56px 20px" }}>
          <BookOpen size={36} style={{ opacity: 0.3, margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No Publications Found</h3>
          <p style={{ color: "hsl(var(--text-muted))", fontSize: 13, maxWidth: 360, margin: "0 auto 16px" }}>
            {searchQuery
              ? "No items match your search query."
              : "You haven't recorded any publications in this category yet."}
          </p>
          <button onClick={() => setShowAddModal(true)} className="btn-outline" style={{ fontSize: 13 }}>
            Add Your First Publication
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((pub) => {
            const meta = TYPE_LABELS[pub.type] ?? {
              label: pub.type,
              color: "hsl(var(--color-primary))",
            };

            return (
              <div
                key={pub.id}
                className="card"
                style={{
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  borderLeft: `3px solid ${meta.color}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: `${meta.color}15`,
                        color: meta.color,
                      }}
                    >
                      {meta.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))" }}>
                      Published {pub.year}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 6 }}>
                    {pub.title}
                  </h3>

                  <div style={{ fontSize: 13, color: "hsl(var(--text-secondary))", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {pub.journal && (
                      <span><strong>Journal:</strong> {pub.journal}</span>
                    )}
                    {pub.conference && (
                      <span><strong>Conference:</strong> {pub.conference}</span>
                    )}
                    {pub.doi && (
                      <span><strong>DOI:</strong> <code>{pub.doi}</code></span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {pub.doi && (
                    <a
                      href={pub.doi.startsWith("http") ? pub.doi : `https://doi.org/${pub.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline"
                      style={{ fontSize: 12, padding: "6px 12px", gap: 6, textDecoration: "none" }}
                    >
                      <span>View DOI</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <button
                    onClick={() => handleDelete(pub.id)}
                    className="btn-ghost"
                    title="Delete publication"
                    aria-label="Delete publication"
                    style={{ padding: 8, color: "hsl(var(--color-danger))" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Publication Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div className="card" style={{ maxWidth: 500, width: "100%", padding: 28, animation: "scaleUp 0.15s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Add Academic Publication</h2>
              <button onClick={() => setShowAddModal(false)} className="btn-ghost" style={{ padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{ background: "hsl(0 84% 60% / 0.1)", color: "hsl(0 70% 50%)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Paper / Publication Title</label>
                <input id="title" name="title" className="form-input" placeholder="e.g. Distributed Deep Learning in Edge Computing" required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Publication Type</label>
                  <select id="type" name="type" className="form-input" defaultValue="JOURNAL" required>
                    <option value="JOURNAL">Journal Article (+15 Stars)</option>
                    <option value="CONFERENCE">Conference Proceedings (+10 Stars)</option>
                    <option value="PATENT">Patent (+25 Stars)</option>
                    <option value="BOOK_CHAPTER">Book Chapter (+10 Stars)</option>
                    <option value="OTHER">Other Academic Work</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="year">Year of Publication</label>
                  <input id="year" name="year" type="number" min={1950} max={new Date().getFullYear() + 1} defaultValue={new Date().getFullYear()} className="form-input" required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="journal">Journal Name (if applicable)</label>
                <input id="journal" name="journal" className="form-input" placeholder="e.g. IEEE Transactions on Computers" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="conference">Conference Name (if applicable)</label>
                <input id="conference" name="conference" className="form-input" placeholder="e.g. ACM SIGCOMM 2026" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="doi">DOI / Link (Digital Object Identifier)</label>
                <input id="doi" name="doi" className="form-input" placeholder="e.g. 10.1109/TC.2026.1234567" />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn-gradient">
                  {isPending ? "Adding…" : "Save Publication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
