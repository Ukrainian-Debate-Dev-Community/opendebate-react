// src/features/manage/components/ManageHub.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrganisationById,
  updateOrganisation,
  addOrganisationOwner,
  removeOrganisationOwner,
} from "../../../api/organisation";
import { fetchOrganisationEvents, createEvent } from "../../../api/event";
import { useAuthStore } from "../../../store/authStore";
import { extractErrorMessage } from "../../../utils/errorHandler";
import type { UpdateOrgPayload } from "../../../types/api";

export const ManageHub: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const { data: org, isLoading: orgLoading } = useQuery({
    queryKey: ["organisation", orgId],
    queryFn: () => fetchOrganisationById(orgId),
    enabled: !!orgId,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["organisationEvents", orgId],
    queryFn: () => fetchOrganisationEvents(orgId),
    enabled: !!orgId,
  });

  const [formData, setFormData] = useState<UpdateOrgPayload>({
    name: "",
    type: "academic",
    online: false,
    link: "",
  });
  const [newOwnerId, setNewOwnerId] = useState("");
  const [newEventForm, setNewEventForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    is_ranked: false,
  });

  useEffect(() => {
    if (org) {
      setFormData({
        name: org.name,
        type: org.type,
        online: org.online,
        link: org.link || "",
      });
    }
  }, [org]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateOrgPayload) =>
      updateOrganisation(orgId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation", orgId] });
      alert("Organisation updated.");
    },
    onError: (error) => alert(extractErrorMessage(error, "Update failed.")),
  });

  const addOwnerMutation = useMutation({
    mutationFn: (targetId: number) => addOrganisationOwner(orgId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation", orgId] });
      setNewOwnerId("");
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to add owner.")),
  });

  const removeOwnerMutation = useMutation({
    mutationFn: (ownerId: number) => removeOrganisationOwner(orgId, ownerId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["organisation", orgId] }),
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to remove owner.")),
  });

  const createEventMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      start_date?: string;
      end_date?: string;
      is_ranked: boolean;
    }) => createEvent(orgId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organisationEvents", orgId],
      });
      setNewEventForm({
        name: "",
        start_date: "",
        end_date: "",
        is_ranked: false,
      });
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to create event.")),
  });

  if (orgLoading || eventsLoading)
    return <div className="container">Loading Hub...</div>;
  if (!org)
    return (
      <div className="container" style={{ color: "var(--danger)" }}>
        Organisation not found.
      </div>
    );

  const isPrivileged =
    currentUser?.isAdmin ||
    org.Owners?.some(
      (owner: any) =>
        owner.id === currentUser?.id || owner.user_id === currentUser?.id,
    ) ||
    (currentUser?.id ? org.owner_ids?.includes(currentUser.id) : false);

  if (!isPrivileged) {
    return <Navigate to={`/organisations/${orgId}`} replace />;
  }

  return (
    <div className="container">
      <Link to="/manage/organisations" className="back-link">
        &larr; Back to Manage Directory
      </Link>
      <h1 className="page-title">
        {org.name} <span className="text-muted">(Admin Hub)</span>
      </h1>

      <div
        className="form-grid"
        style={{ gap: "2rem", marginTop: "2rem", alignItems: "start" }}
      >
        <div className="card">
          <h2 style={{ marginTop: 0, color: "var(--secondary)" }}>Settings</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate(formData);
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "academic" | "personal",
                  })
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
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                className="form-input"
              />
            </div>
            <label
              className="form-group"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="checkbox"
                checked={formData.online}
                onChange={(e) =>
                  setFormData({ ...formData, online: e.target.checked })
                }
              />{" "}
              Is Online?
            </label>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="btn btn-primary"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0, color: "var(--secondary)" }}>
            Access Management
          </h2>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem" }}>
            {org.Owners?.map((owner: any) => (
              <li
                key={owner.id}
                style={{
                  padding: "0.5rem",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {owner.username} (ID: {owner.id})
                </span>
                {currentUser?.id !== owner.id && (
                  <button
                    onClick={() => {
                      if (window.confirm("Remove owner?"))
                        removeOwnerMutation.mutate(owner.id);
                    }}
                    className="btn btn-danger btn-sm"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="number"
              placeholder="User ID to add"
              value={newOwnerId}
              onChange={(e) => setNewOwnerId(e.target.value)}
              className="form-input"
            />
            <button
              onClick={() => {
                addOwnerMutation.mutate(parseInt(newOwnerId));
                setNewOwnerId("");
              }}
              className="btn btn-info"
            >
              Add Owner
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h2
          style={{
            marginTop: 0,
            color: "var(--secondary)",
            marginBottom: "1.5rem",
          }}
        >
          Event Schedule
        </h2>

        <div
          className="panel"
          style={{
            marginBottom: "2rem",
            borderLeft: "4px solid var(--success)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Create New Event</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createEventMutation.mutate({
                ...newEventForm,
                start_date: newEventForm.start_date || undefined,
                end_date: newEventForm.end_date || undefined,
              });
            }}
            className="form-grid"
            style={{ gap: "1rem", alignItems: "end" }}
          >
            <div className="form-group">
              <label className="form-label">Event Name *</label>
              <input
                type="text"
                required
                value={newEventForm.name}
                onChange={(e) =>
                  setNewEventForm({ ...newEventForm, name: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={newEventForm.start_date}
                onChange={(e) =>
                  setNewEventForm({
                    ...newEventForm,
                    start_date: e.target.value,
                  })
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={newEventForm.end_date}
                onChange={(e) =>
                  setNewEventForm({ ...newEventForm, end_date: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div
              className="form-group"
              style={{
                display: "flex",
                alignItems: "center",
                paddingBottom: "0.5rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={newEventForm.is_ranked}
                  onChange={(e) =>
                    setNewEventForm({
                      ...newEventForm,
                      is_ranked: e.target.checked,
                    })
                  }
                />
                Ranked Event?
              </label>
            </div>

            <div className="form-group">
              <button
                type="submit"
                disabled={createEventMutation.isPending || !newEventForm.name}
                className="btn btn-success"
                style={{ width: "100%" }}
              >
                {createEventMutation.isPending
                  ? "Creating..."
                  : "+ Create Event"}
              </button>
            </div>
          </form>
        </div>

        {events?.length === 0 ? (
          <p className="text-muted">No events scheduled.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Event Name</th>
                <th>Status</th>
                <th>Ranked</th>
              </tr>
            </thead>
            <tbody>
              {events?.map((event) => (
                <tr key={event.id}>
                  <td>{event.id}</td>
                  <td style={{ fontWeight: "bold" }}>
                    <Link
                      to={`/manage/events/${event.id}`}
                      style={{ color: "var(--info)", textDecoration: "none" }}
                    >
                      {event.name}
                    </Link>
                  </td>
                  <td>
                    <span className="badge badge-secondary">
                      {event.status}
                    </span>
                  </td>
                  <td>{event.is_ranked ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
