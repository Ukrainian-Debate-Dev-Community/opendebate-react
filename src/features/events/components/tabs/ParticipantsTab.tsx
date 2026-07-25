import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEventParticipants,
  addParticipant,
  removeParticipant,
} from "../../api/participantApi";
import { extractErrorMessage } from "../../../../utils/errorHandler";
import type { CreateParticipantPayload } from "../../../../types/api";

interface ParticipantsTabProps {
  eventId: number;
  isPrivileged: boolean;
}

export const ParticipantsTab: React.FC<ParticipantsTabProps> = ({
  eventId,
  isPrivileged,
}) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParticipant, setNewParticipant] =
    useState<CreateParticipantPayload>({ display_name: "", role: "speaker" });
  const [generatedToken, setGeneratedToken] = useState<{
    name: string;
    token: string;
  } | null>(null);

  const { data: participantData, isLoading } = useQuery({
    queryKey: ["participants", eventId, page],
    queryFn: () => fetchEventParticipants(eventId, page, 50),
  });

  const addMutation = useMutation({
    mutationFn: (payload: CreateParticipantPayload) =>
      addParticipant(eventId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] });
      setNewParticipant({ display_name: "", role: "speaker" });
      setShowAddForm(false);
      if (data.raw_claim_token) {
        setGeneratedToken({
          name: data.display_name,
          token: data.raw_claim_token,
        });
      }
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to add participant.")),
  });

  const removeMutation = useMutation({
    mutationFn: (participantId: number) =>
      removeParticipant(eventId, participantId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["participants", eventId] }),
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to remove participant.")),
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedToken(null);
    addMutation.mutate(newParticipant);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2>Participants</h2>
        {isPrivileged && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-success"
          >
            {showAddForm ? "Cancel" : "+ Add Participant"}
          </button>
        )}
      </div>

      {generatedToken && (
        <div
          className="panel"
          style={{ background: "var(--info)", color: "white" }}
        >
          <h3 style={{ marginTop: 0 }}>Guest Identity Created!</h3>
          <p>
            You have successfully registered{" "}
            <strong>{generatedToken.name}</strong>. Hand them this token:
          </p>
          <div
            style={{
              background: "rgba(0,0,0,0.2)",
              padding: "1rem",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "1.2rem",
              textAlign: "center",
            }}
          >
            {generatedToken.token}
          </div>
        </div>
      )}

      {showAddForm && isPrivileged && (
        <form onSubmit={handleAddSubmit} className="form-grid panel">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Display Name *</label>
            <input
              type="text"
              required
              value={newParticipant.display_name}
              onChange={(e) =>
                setNewParticipant({
                  ...newParticipant,
                  display_name: e.target.value,
                })
              }
              className="form-input"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Role *</label>
            <select
              value={newParticipant.role}
              onChange={(e) =>
                setNewParticipant({
                  ...newParticipant,
                  role: e.target.value as "speaker" | "adjudicator",
                })
              }
              className="form-input"
            >
              <option value="speaker">Speaker</option>
              <option value="adjudicator">Adjudicator</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="btn btn-primary"
            style={{ gridColumn: "span 2" }}
          >
            {addMutation.isPending ? "Creating..." : "Create Guest Participant"}
          </button>
        </form>
      )}

      {isLoading ? (
        <p>Loading participants...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              {isPrivileged && <th style={{ textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {participantData?.participants.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td style={{ fontWeight: "bold" }}>
                  {p.display_name}{" "}
                  {p.user_id && (
                    <span
                      style={{ fontSize: "0.8rem", color: "var(--success)" }}
                    >
                      (Claimed)
                    </span>
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${p.role === "adjudicator" ? "badge-info" : "badge-secondary"}`}
                  >
                    {p.role}
                  </span>
                </td>
                <td>{p.is_eliminated ? "Eliminated" : "Active"}</td>
                {isPrivileged && (
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => {
                        if (window.confirm("Remove this participant?"))
                          removeMutation.mutate(p.id);
                      }}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {participantData && participantData.total_pages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1.5rem",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn panel"
            style={{ padding: "0.5rem 1rem", marginBottom: 0 }}
          >
            Previous
          </button>
          <span className="text-muted">
            Page {page} of {participantData.total_pages}
          </span>
          <button
            disabled={page === participantData.total_pages}
            onClick={() => setPage((p) => p + 1)}
            className="btn panel"
            style={{ padding: "0.5rem 1rem", marginBottom: 0 }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
