"use client";

import { useState, useTransition } from "react";
import { Users, Plus, Pencil, Trash2, CheckCircle2, AlertCircle, X, Shield, FolderGit2 } from "lucide-react";
import { createCluster, updateCluster, deleteCluster } from "@/actions/clusters";

interface ClusterItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  head: { id: string; name: string; email: string } | null;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
}

interface EligibleHead {
  id: string;
  name: string;
  email: string;
  role: string;
  designation: string | null;
}

interface Props {
  initialClusters: ClusterItem[];
  eligibleHeads: EligibleHead[];
}

export function ClusterManagerClient({ initialClusters, eligibleHeads }: Props) {
  const [clusters, setClusters] = useState(initialClusters);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCluster, setEditingCluster] = useState<ClusterItem | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createCluster({ success: false }, formData);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to create cluster");
      } else {
        setShowCreateModal(false);
        window.location.reload();
      }
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await updateCluster({ success: false }, formData);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update cluster");
      } else {
        setEditingCluster(null);
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this cluster?")) return;
    setErrorMessage("");

    startTransition(async () => {
      const res = await deleteCluster(id);
      if (!res.success) {
        alert(res.error || "Failed to delete cluster");
      } else {
        setClusters((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  return (
    <div>
      {/* Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: "hsl(var(--text-secondary))" }}>
          Showing <strong>{clusters.length}</strong> active departmental clusters
        </div>

        <button
          onClick={() => {
            setErrorMessage("");
            setShowCreateModal(true);
          }}
          className="btn-gradient"
          style={{ fontSize: 13, gap: 6 }}
        >
          <Plus size={16} />
          Create New Cluster
        </button>
      </div>

      {/* Grid of Clusters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 18 }}>
        {clusters.map((cluster) => {
          const completionPct = cluster.taskCount > 0
            ? Math.round((cluster.completedTaskCount / cluster.taskCount) * 100)
            : 0;

          return (
            <div
              key={cluster.id}
              className="card"
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "hsl(var(--color-primary) / 0.12)",
                        color: "hsl(var(--color-primary))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FolderGit2 size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{cluster.name}</h3>
                      <div style={{ fontSize: 11.5, color: "hsl(var(--text-muted))" }}>ID: {cluster.id}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      onClick={() => {
                        setErrorMessage("");
                        setEditingCluster(cluster);
                      }}
                      className="btn-ghost"
                      title="Edit cluster"
                      style={{ padding: 6 }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cluster.id)}
                      className="btn-ghost"
                      title="Delete cluster"
                      style={{ padding: 6, color: "hsl(var(--color-danger))" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "hsl(var(--text-secondary))", lineHeight: 1.5, marginBottom: 16 }}>
                  {cluster.description || "No description provided for this cluster."}
                </p>

                {/* Head Info */}
                <div
                  style={{
                    background: "hsl(var(--bg-subtle))",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: 16,
                    fontSize: 12.5,
                  }}
                >
                  <div style={{ color: "hsl(var(--text-muted))", fontSize: 11, fontWeight: 600, marginBottom: 2 }}>
                    CLUSTER HEAD
                  </div>
                  {cluster.head ? (
                    <div style={{ fontWeight: 600, color: "hsl(var(--text-primary))" }}>
                      {cluster.head.name} ({cluster.head.email})
                    </div>
                  ) : (
                    <span style={{ color: "hsl(var(--color-danger))", fontWeight: 500 }}>
                      ⚠️ No Cluster Head Assigned
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: "hsl(var(--text-muted))" }}>Members</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{cluster.memberCount} faculty</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: "hsl(var(--text-muted))" }}>Task Progress</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{completionPct}% done</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  paddingTop: 12,
                  borderTop: "1px solid hsl(var(--border))",
                  fontSize: 11.5,
                  color: "hsl(var(--text-muted))",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Created {new Date(cluster.createdAt).toLocaleDateString()}</span>
                <span>{cluster.taskCount} total tasks</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
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
          <div className="card" style={{ maxWidth: 460, width: "100%", padding: 28, animation: "scaleUp 0.15s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Create New Cluster</h2>
              <button onClick={() => setShowCreateModal(false)} className="btn-ghost" style={{ padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div style={{ background: "hsl(0 84% 60% / 0.1)", color: "hsl(0 70% 50%)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">Cluster Name</label>
                <input id="name" name="name" className="form-input" placeholder="e.g. Artificial Intelligence & ML" required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea id="description" name="description" className="form-input" rows={3} placeholder="Domain focus, core faculty research areas, etc." />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="headId">Appoint Cluster Head</label>
                <select id="headId" name="headId" className="form-input" defaultValue="none">
                  <option value="none">-- Select Faculty / Cluster Head (Optional) --</option>
                  {eligibleHeads.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.email}) [{h.role}]
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn-gradient">
                  {isPending ? "Creating…" : "Create Cluster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCluster && (
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
          <div className="card" style={{ maxWidth: 460, width: "100%", padding: 28, animation: "scaleUp 0.15s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Edit Cluster: {editingCluster.name}</h2>
              <button onClick={() => setEditingCluster(null)} className="btn-ghost" style={{ padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div style={{ background: "hsl(0 84% 60% / 0.1)", color: "hsl(0 70% 50%)", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input type="hidden" name="id" value={editingCluster.id} />

              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">Cluster Name</label>
                <input id="edit-name" name="name" className="form-input" defaultValue={editingCluster.name} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-desc">Description</label>
                <textarea id="edit-desc" name="description" className="form-input" rows={3} defaultValue={editingCluster.description ?? ""} />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-head">Cluster Head</label>
                <select id="edit-head" name="headId" className="form-input" defaultValue={editingCluster.head?.id ?? "none"}>
                  <option value="none">-- No Cluster Head --</option>
                  {eligibleHeads.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.email}) [{h.role}]
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setEditingCluster(null)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn-gradient">
                  {isPending ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
