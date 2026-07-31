import React, { useState } from "react";
import { Link } from "react-router";
import { apiClient } from "../../../api/axios";
import { useMutation } from "@tanstack/react-query";
import { extractErrorMessage } from "../../../utils/errorHandler";
import type { CreateOrgPayload } from "../../../types/api";

export const AdminPanel: React.FC = () => {
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState<"academic" | "personal">("academic");
  const [ownerId, setOwnerId] = useState("");

  const [format, setFormat] = useState({
    name: "",
    code: "",
    teams_per_room: 2,
    speakers_per_team: 2,
    score_min: 50,
    score_max: 100,
    has_reply: false,
  });

  const orgMutation = useMutation({
    mutationFn: (payload: CreateOrgPayload) =>
      apiClient.post("/organisations", payload),
    onSuccess: () => {
      setStatus({ type: "success", msg: "Organisation created successfully." });
      setOrgName("");
      setOwnerId("");
    },
    onError: (error) =>
      setStatus({ type: "error", msg: extractErrorMessage(error) }),
  });

  const formatMutation = useMutation({
    mutationFn: (payload: typeof format) => apiClient.post("/formats", payload),
    onSuccess: () => {
      setStatus({
        type: "success",
        msg: "Global format created successfully.",
      });
      setFormat({
        name: "",
        code: "",
        teams_per_room: 2,
        speakers_per_team: 2,
        score_min: 50,
        score_max: 100,
        has_reply: false,
      });
    },
    onError: (error) =>
      setStatus({ type: "error", msg: extractErrorMessage(error) }),
  });

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    orgMutation.mutate({
      name: orgName,
      type: orgType,
      online: false,
      owner_id: parseInt(ownerId, 10),
    });
  };

  const handleCreateFormat = (e: React.FormEvent) => {
    e.preventDefault();
    formatMutation.mutate(format);
  };

  return (
    <div className="container-sm">
      <Link to="/" className="back-link">
        &larr; Back to Dashboard
      </Link>
      <h1
        className="page-title"
        style={{ color: "var(--danger)", borderBottomColor: "var(--danger)" }}
      >
        System Administration
      </h1>

      {status && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1.5rem",
            borderRadius: "4px",
            color: "var(--bg-light)",
            background:
              status.type === "success" ? "var(--success)" : "var(--danger)",
          }}
        >
          {status.msg}
        </div>
      )}

      <div className="card">
        <h2 style={{ marginTop: 0, color: "var(--secondary)" }}>
          Create Organisation
        </h2>
        <form
          onSubmit={handleCreateOrg}
          className="form-grid"
          style={{ alignItems: "end" }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Organisation Name</label>
            <input
              type="text"
              placeholder="e.g. Ultimate Club"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Type</label>
            <select
              value={orgType}
              onChange={(e) =>
                setOrgType(e.target.value as "academic" | "personal")
              }
              required
              className="form-input"
            >
              <option value="academic">Academic</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Owner User ID</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={orgMutation.isPending}
            className="btn btn-danger"
          >
            {orgMutation.isPending ? "Creating..." : "Create Organisation"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, color: "var(--secondary)" }}>
          Create Global Format
        </h2>
        <form onSubmit={handleCreateFormat} className="form-grid">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Format Name</label>
            <input
              type="text"
              placeholder="e.g. British Parliamentary"
              value={format.name}
              onChange={(e) => setFormat({ ...format, name: e.target.value })}
              required
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Code</label>
            <input
              type="text"
              placeholder="e.g. BP"
              value={format.code}
              onChange={(e) => setFormat({ ...format, code: e.target.value })}
              required
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Teams per Room</label>
            <input
              type="number"
              min="2"
              value={format.teams_per_room}
              onChange={(e) =>
                setFormat({
                  ...format,
                  teams_per_room: parseInt(e.target.value),
                })
              }
              required
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Speakers per Team</label>
            <input
              type="number"
              min="1"
              value={format.speakers_per_team}
              onChange={(e) =>
                setFormat({
                  ...format,
                  speakers_per_team: parseInt(e.target.value),
                })
              }
              required
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Minimum Score</label>
            <input
              type="number"
              value={format.score_min}
              onChange={(e) =>
                setFormat({ ...format, score_min: parseInt(e.target.value) })
              }
              required
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Maximum Score</label>
            <input
              type="number"
              value={format.score_max}
              onChange={(e) =>
                setFormat({ ...format, score_max: parseInt(e.target.value) })
              }
              required
              className="form-input"
            />
          </div>

          <label
            className="form-group"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              gridColumn: "span 2",
              margin: "0.5rem 0",
            }}
          >
            <input
              type="checkbox"
              checked={format.has_reply}
              onChange={(e) =>
                setFormat({ ...format, has_reply: e.target.checked })
              }
            />
            Format includes reply speeches?
          </label>

          <button
            type="submit"
            disabled={formatMutation.isPending}
            className="btn btn-danger"
            style={{ gridColumn: "span 2" }}
          >
            {formatMutation.isPending ? "Creating..." : "Create Format"}
          </button>
        </form>
      </div>
    </div>
  );
};
