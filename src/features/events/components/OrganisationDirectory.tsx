import React, { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrganisations,
  createOrganisation,
  deleteOrganisation,
} from "../api/organisationApi";
import { useAuthStore } from "../../../store/authStore";
import { extractErrorMessage } from "../../../utils/errorHandler";
import type { CreateOrgPayload } from "../../../types/api";

export const OrganisationDirectory: React.FC = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [name, setName] = useState("");
  const [type, setType] = useState<"academic" | "personal">("academic");
  const [online, setOnline] = useState(false);
  const [link, setLink] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    data: organisations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["organisations"],
    queryFn: fetchOrganisations,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateOrgPayload) => createOrganisation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisations"] });
      setName("");
      setLink("");
      setErrorMsg(null);
    },
    onError: (error) =>
      setErrorMsg(extractErrorMessage(error, "Failed to create organisation.")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrganisation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["organisations"] }),
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to delete organisation.")),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createMutation.mutate({
      name,
      type,
      online,
      link: link || undefined,
      owner_id: user.id,
    });
  };

  if (isLoading)
    return <div className="container">Loading organisations...</div>;
  if (isError)
    return (
      <div className="container" style={{ color: "var(--danger)" }}>
        Failed to load organisations.
      </div>
    );

  return (
    <div className="container">
      <Link to="/" className="back-link">
        &larr; Back to Dashboard
      </Link>
      <h1 className="page-title">Organisation Directory</h1>

      {user?.isAdmin && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Register New Organisation</h2>
          {errorMsg && (
            <div style={{ color: "var(--danger)", marginBottom: "1rem" }}>
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleCreate} className="form-grid">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "academic" | "personal")
                }
                className="form-input"
              >
                <option value="academic">Academic</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Website Link</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="form-input"
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                paddingBottom: "1.5rem",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={online}
                  onChange={(e) => setOnline(e.target.checked)}
                />{" "}
                Is Online?
              </label>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary"
              style={{ gridColumn: "span 2" }}
            >
              {createMutation.isPending ? "Creating..." : "Create Organisation"}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Format</th>
              <th>Status</th>
              {user?.isAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {organisations?.length === 0 && (
              <tr>
                <td
                  colSpan={user?.isAdmin ? 6 : 5}
                  style={{ textAlign: "center" }}
                >
                  No active organisations found.
                </td>
              </tr>
            )}
            {organisations?.map((org) => (
              <tr key={org.id}>
                <td>#{org.id}</td>
                <td style={{ fontWeight: "bold" }}>
                  <Link
                    to={`/organisations/${org.id}`}
                    style={{ color: "var(--info)", textDecoration: "none" }}
                  >
                    {org.name}
                  </Link>
                </td>
                <td style={{ textTransform: "capitalize" }}>{org.type}</td>
                <td>{org.online ? "Online" : "In-Person"}</td>
                <td>
                  <span
                    className={`badge ${org.status === "active" ? "badge-success" : "badge-secondary"}`}
                  >
                    {org.status}
                  </span>
                </td>
                {user?.isAdmin && (
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete?"))
                          deleteMutation.mutate(org.id);
                      }}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
