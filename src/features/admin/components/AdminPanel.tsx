import React, { useState } from "react";
import { apiClient } from "../../../api/axios";
import { AxiosError } from "axios";

export const AdminPanel: React.FC = () => {
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("academic");
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

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/organisations", {
        name: orgName,
        type: orgType,
        owner_id: parseInt(ownerId, 10),
      });
      setStatus({ type: "success", msg: "Organisation created successfully." });
      setOrgName("");
      setOwnerId("");
    } catch (err) {
      handleError(err);
    }
  };

  const handleCreateFormat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/formats", format);
      setStatus({
        type: "success",
        msg: "Global format created successfully.",
      });
    } catch (err) {
      handleError(err);
    }
  };

  const handleError = (err: unknown) => {
    if (err instanceof AxiosError && err.response) {
      setStatus({
        type: "error",
        msg: err.response.data.message || "Action failed.",
      });
    } else {
      setStatus({ type: "error", msg: "An unexpected error occurred." });
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--danger)" }}>System Administration</h1>

      {status && (
        <div
          style={{
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "4px",
            color: "var(--bg-light)",
            background:
              status.type === "success" ? "var(--success)" : "var(--danger)",
          }}
        >
          {status.msg}
        </div>
      )}

      <div
        style={{
          background: "var(--bg-light)",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Create Organisation</h2>
        <form
          onSubmit={handleCreateOrg}
          style={{ display: "grid", gap: "1rem" }}
        >
          <input
            type="text"
            placeholder="Organisation Name (e.g. Ultimate Club)"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
            style={{ padding: "0.5rem" }}
          />
          <input
            type="text"
            placeholder="Type (e.g. academic)"
            value={orgType}
            onChange={(e) => setOrgType(e.target.value)}
            required
            style={{ padding: "0.5rem" }}
          />
          <input
            type="number"
            placeholder="Owner User ID"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            required
            style={{ padding: "0.5rem" }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem",
              background: "var(--danger)",
              color: "var(--bg-light)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Create Organisation
          </button>
        </form>
      </div>

      <div
        style={{
          background: "var(--bg-light)",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--border)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Create Global Format</h2>
        <form
          onSubmit={handleCreateFormat}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <input
            type="text"
            placeholder="Format Name"
            value={format.name}
            onChange={(e) => setFormat({ ...format, name: e.target.value })}
            required
            style={{ padding: "0.5rem" }}
          />
          <input
            type="text"
            placeholder="Code (e.g. BP, STD2v2)"
            value={format.code}
            onChange={(e) => setFormat({ ...format, code: e.target.value })}
            required
            style={{ padding: "0.5rem" }}
          />
          <label>
            Teams per Room:{" "}
            <input
              type="number"
              value={format.teams_per_room}
              onChange={(e) =>
                setFormat({
                  ...format,
                  teams_per_room: parseInt(e.target.value),
                })
              }
              required
              style={{ width: "60px" }}
            />
          </label>
          <label>
            Speakers per Team:{" "}
            <input
              type="number"
              value={format.speakers_per_team}
              onChange={(e) =>
                setFormat({
                  ...format,
                  speakers_per_team: parseInt(e.target.value),
                })
              }
              required
              style={{ width: "60px" }}
            />
          </label>
          <label>
            Min Score:{" "}
            <input
              type="number"
              value={format.score_min}
              onChange={(e) =>
                setFormat({ ...format, score_min: parseInt(e.target.value) })
              }
              required
              style={{ width: "60px" }}
            />
          </label>
          <label>
            Max Score:{" "}
            <input
              type="number"
              value={format.score_max}
              onChange={(e) =>
                setFormat({ ...format, score_max: parseInt(e.target.value) })
              }
              required
              style={{ width: "60px" }}
            />
          </label>
          <label style={{ gridColumn: "span 2" }}>
            <input
              type="checkbox"
              checked={format.has_reply}
              onChange={(e) =>
                setFormat({ ...format, has_reply: e.target.checked })
              }
            />{" "}
            Has Reply Speeches?
          </label>
          <button
            type="submit"
            style={{
              gridColumn: "span 2",
              padding: "0.75rem",
              background: "var(--danger)",
              color: "var(--bg-light)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Create Format
          </button>
        </form>
      </div>
    </div>
  );
};
