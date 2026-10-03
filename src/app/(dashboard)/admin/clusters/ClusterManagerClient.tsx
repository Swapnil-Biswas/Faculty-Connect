"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, X, FolderGit2, AlertCircle, CheckCircle2, UserCheck } from "lucide-react";
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

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" cluster?`)) return;
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

  const modalInputStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E7EC",
    borderRadius: 6,
    padding: "9px 12px",
    color: "#17202A",
    fontSize: 13,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const modalLabelStyle: React.CSSProperties = {
    fontSize: 12.5,
    fontWeight: 600,
    color: "#17202A",
    marginBottom: 2,
    display: "block",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 13, color: "#667085" }}>
          Showing <strong>{clusters.length}</strong> active departmental clusters
        </div>

        <button
          onClick={() => {
            setErrorMessage("");
            setShowCreateModal(true);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            backgroundColor: "#173B67",
            color: "#FFFFFF",
            border: "none",
            borderRadius: 8,
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
          }}
        >
          <Plus size={16} />
          <span>Create New Cluster</span>
        </button>
      </div>

      {/* Grid of Clusters */}
      {clusters.length === 0 ? (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E4E7EC",
            borderRadius: 12,
            padding: "48px 24px",
            textAlign: "center",
            color: "#667085",
          }}
        >
          <FolderGit2 size={36} style={{ color: "#98A2B3", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "#17202A" }}>
            No Academic Clusters Created
          </div>
          <p style={{ fontSize: 13, color: "#667085", margin: "6px 0 16px" }}>
            Create clusters to organize academic groups and faculty task workflows.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: "#173B67",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Create First Cluster
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: 20,
          }}
        >
          {clusters.map((cluster) => {
            const completionPct =
              cluster.taskCount > 0
                ? Math.round((cluster.completedTaskCount / cluster.taskCount) * 100)
                : 0;

            return (
              <div
                key={cluster.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E4E7EC",
                  borderRadius: 12,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 16,
                  boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
                  transition: "border-color 0.15s ease",
                }}
              >
                <div>
                  {/* Card Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          backgroundColor: "#F2F4F7",
                          border: "1px solid #E4E7EC",
                          color: "#173B67",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FolderGit2 size={18} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#17202A", margin: 0 }}>
                          {cluster.name}
                        </h3>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#98A2B3",
                            fontFamily: "var(--font-mono)",
                            marginTop: 2,
                          }}
                        >
                          ID: {cluster.id.slice(0, 12)}…
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => {
                          setErrorMessage("");
                          setEditingCluster(cluster);
                        }}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          padding: 6,
                          borderRadius: 6,
                          color: "#667085",
                          cursor: "pointer",
                        }}
                        title="Edit cluster"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cluster.id, cluster.name)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          padding: 6,
                          borderRadius: 6,
                          color: "#C0392B",
                          cursor: "pointer",
                        }}
                        title="Delete cluster"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 13,
                      color: "#667085",
                      lineHeight: 1.5,
                      margin: "0 0 14px 0",
                      minHeight: 38,
                    }}
                  >
                    {cluster.description || "No specific domain description provided for this academic cluster."}
                  </p>

                  {/* Cluster Head Assignment Box */}
                  <div
                    style={{
                      backgroundColor: "#F7F8FA",
                      border: "1px solid #E4E7EC",
                      padding: "10px 14px",
                      borderRadius: 8,
                      marginBottom: 16,
                      fontSize: 12.5,
                    }}
                  >
                    <div
                      style={{
                        color: "#667085",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        marginBottom: 3,
                      }}
                    >
                      Cluster Leadership
                    </div>
                    {cluster.head ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <UserCheck size={14} color="#16A34A" />
                        <div>
                          <span style={{ fontWeight: 600, color: "#17202A" }}>{cluster.head.name}</span>
                          <span style={{ color: "#667085", fontSize: 11.5, marginLeft: 6 }}>
                            ({cluster.head.email})
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#C0392B", fontWeight: 500, fontSize: 12 }}>
                        ⚠️ Leadership Unassigned
                      </span>
                    )}
                  </div>

                  {/* Metrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    <div style={{ backgroundColor: "#F7F8FA", padding: "10px 12px", borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase" }}>
                        Faculty Roster
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#17202A", marginTop: 2 }}>
                        {cluster.memberCount} {cluster.memberCount === 1 ? "Member" : "Members"}
                      </div>
                    </div>
                    <div style={{ backgroundColor: "#F7F8FA", padding: "10px 12px", borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#667085", textTransform: "uppercase" }}>
                        Task Completion
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#17202A", marginTop: 2 }}>
                        {completionPct}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: 6,
                      backgroundColor: "#F2F4F7",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${completionPct}%`,
                        backgroundColor: completionPct === 100 ? "#16A34A" : "#173B67",
                        borderRadius: 3,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Card Footer */}
                <div
                  style={{
                    paddingTop: 12,
                    borderTop: "1px solid #F2F4F7",
                    fontSize: 11.5,
                    color: "#98A2B3",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>Formed {new Date(cluster.createdAt).toLocaleDateString()}</span>
                  <span>{cluster.taskCount} total {cluster.taskCount === 1 ? "task" : "tasks"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(16, 24, 40, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: 12,
              maxWidth: 480,
              width: "100%",
              padding: 28,
              boxShadow: "0 20px 40px -15px rgba(16, 24, 40, 0.15)",
              animation: "fadeIn 0.15s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 14,
                borderBottom: "1px solid #F2F4F7",
              }}
            >
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#17202A", margin: 0 }}>
                Create Academic Cluster
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  padding: 4,
                  borderRadius: 6,
                  color: "#667085",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  backgroundColor: "rgba(192, 57, 43, 0.08)",
                  border: "1px solid rgba(192, 57, 43, 0.25)",
                  color: "#C0392B",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Fix label overlap: clean vertical flow */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={modalLabelStyle} htmlFor="name">
                  Cluster Name <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  style={modalInputStyle}
                  placeholder="e.g. Artificial Intelligence & Machine Learning"
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={modalLabelStyle} htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  style={{ ...modalInputStyle, resize: "vertical" }}
                  placeholder="Academic domain focus, research areas, and specializations..."
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={modalLabelStyle} htmlFor="headId">
                  Appoint Cluster Head
                </label>
                <select
                  id="headId"
                  name="headId"
                  defaultValue="none"
                  style={{ ...modalInputStyle, cursor: "pointer" }}
                >
                  <option value="none">-- Unassigned (Select later) --</option>
                  {eligibleHeads.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.email}) [{h.role.replace("_", " ")}]
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 8,
                  paddingTop: 16,
                  borderTop: "1px solid #F2F4F7",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E4E7EC",
                    borderRadius: 6,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#667085",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    backgroundColor: "#173B67",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#FFFFFF",
                    cursor: isPending ? "not-allowed" : "pointer",
                  }}
                >
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
            backgroundColor: "rgba(16, 24, 40, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4E7EC",
              borderRadius: 12,
              maxWidth: 480,
              width: "100%",
              padding: 28,
              boxShadow: "0 20px 40px -15px rgba(16, 24, 40, 0.15)",
              animation: "fadeIn 0.15s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                paddingBottom: 14,
                borderBottom: "1px solid #F2F4F7",
              }}
            >
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#17202A", margin: 0 }}>
                Edit Cluster: {editingCluster.name}
              </h2>
              <button
                onClick={() => setEditingCluster(null)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  padding: 4,
                  borderRadius: 6,
                  color: "#667085",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  backgroundColor: "rgba(192, 57, 43, 0.08)",
                  border: "1px solid rgba(192, 57, 43, 0.25)",
                  color: "#C0392B",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input type="hidden" name="id" value={editingCluster.id} />

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={modalLabelStyle} htmlFor="edit-name">
                  Cluster Name <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  id="edit-name"
                  name="name"
                  style={modalInputStyle}
                  defaultValue={editingCluster.name}
                  required
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={modalLabelStyle} htmlFor="edit-desc">
                  Description
                </label>
                <textarea
                  id="edit-desc"
                  name="description"
                  rows={3}
                  style={{ ...modalInputStyle, resize: "vertical" }}
                  defaultValue={editingCluster.description ?? ""}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={modalLabelStyle} htmlFor="edit-head">
                  Appoint Cluster Head
                </label>
                <select
                  id="edit-head"
                  name="headId"
                  defaultValue={editingCluster.head?.id ?? "none"}
                  style={{ ...modalInputStyle, cursor: "pointer" }}
                >
                  <option value="none">-- Unassigned (No Cluster Head) --</option>
                  {eligibleHeads.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.email}) [{h.role.replace("_", " ")}]
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 8,
                  paddingTop: 16,
                  borderTop: "1px solid #F2F4F7",
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingCluster(null)}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E4E7EC",
                    borderRadius: 6,
                    padding: "8px 16px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#667085",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    backgroundColor: "#173B67",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#FFFFFF",
                    cursor: isPending ? "not-allowed" : "pointer",
                  }}
                >
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
