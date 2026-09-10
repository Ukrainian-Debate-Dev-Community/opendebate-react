import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCalculatedTeamStandings,
  fetchCalculatedSpeakerStandings,
  processEliminations,
} from "../../../../api/standings";
import { extractErrorMessage } from "../../../../utils/errorHandler";
import type { EliminationPayload } from "../../../../types/api";

export const StandingsTab: React.FC<{ eventId: number }> = ({ eventId }) => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"teams" | "speakers">("teams");
  const [eliminationThreshold, setEliminationThreshold] = useState<number | "">(
    "",
  );
  const [isEliminating, setIsEliminating] = useState<boolean>(true);

  const { data: teamStandings, isLoading: teamsLoading } = useQuery({
    queryKey: ["standings", "teams", eventId],
    queryFn: () => fetchCalculatedTeamStandings(eventId),
    enabled: view === "teams",
  });

  const { data: speakerStandings, isLoading: speakersLoading } = useQuery({
    queryKey: ["standings", "speakers", eventId],
    queryFn: () => fetchCalculatedSpeakerStandings(eventId),
    enabled: view === "speakers",
  });

  const eliminateMutation = useMutation({
    mutationFn: (payload: EliminationPayload) =>
      processEliminations(eventId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["standings"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["participants"] });
      alert(data?.message || "Eliminations processed successfully.");
      setEliminationThreshold("");
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to process eliminations.")),
  });

  const handleEliminate = (e: React.FormEvent) => {
    e.preventDefault();
    const threshold = Number(eliminationThreshold);
    if (!threshold || threshold < 1) return;

    const payload: EliminationPayload = { status: isEliminating };
    let count = 0;

    if (view === "teams") {
      if (!teamStandings) return;
      const idsToProcess = teamStandings.slice(threshold).map((t) => t.id);
      if (idsToProcess.length === 0)
        return alert("No teams fall below this threshold.");
      payload.team_ids = idsToProcess;
      count = idsToProcess.length;
    } else {
      if (!speakerStandings) return;
      const idsToProcess = speakerStandings.slice(threshold).map((s) => s.id);
      if (idsToProcess.length === 0)
        return alert("No speakers fall below this threshold.");
      payload.participant_ids = idsToProcess;
      count = idsToProcess.length;
    }

    const actionText = isEliminating ? "eliminate" : "RESTORE (un-eliminate)";
    const targetText = view === "teams" ? "teams" : "speakers";

    if (
      window.confirm(
        `Are you sure you want to ${actionText} the ${count} ${targetText} below rank ${threshold}?`,
      )
    ) {
      eliminateMutation.mutate(payload);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2>Tournament Standings</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setView("teams")}
            className={`btn ${view === "teams" ? "btn-primary" : ""}`}
            style={{
              border: view !== "teams" ? "1px solid var(--border)" : "none",
            }}
          >
            Team Leaderboard
          </button>
          <button
            onClick={() => setView("speakers")}
            className={`btn ${view === "speakers" ? "btn-primary" : ""}`}
            style={{
              border: view !== "speakers" ? "1px solid var(--border)" : "none",
            }}
          >
            Speaker Leaderboard
          </button>
        </div>
      </div>

      <div className="panel" style={{ border: "1px dashed var(--danger)" }}>
        <h3 style={{ marginTop: 0, color: "var(--danger)" }}>
          Break / Eliminations ({view === "teams" ? "Teams" : "Speakers"})
        </h3>
        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
          Enter the cut-off rank. The system will grab everyone from rank{" "}
          {Number(eliminationThreshold || 0) + 1} downwards and apply the
          update.
        </p>
        <form
          onSubmit={handleEliminate}
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="number"
            min="1"
            required
            value={eliminationThreshold}
            onChange={(e) =>
              setEliminationThreshold(parseInt(e.target.value, 10) || "")
            }
            className="form-input"
            placeholder="Cut-off rank (e.g., 8)"
            style={{ maxWidth: "200px", marginBottom: 0 }}
          />
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text)",
            }}
          >
            <input
              type="checkbox"
              checked={isEliminating}
              onChange={(e) => setIsEliminating(e.target.checked)}
            />
            Mark as Eliminated (Uncheck to Restore)
          </label>
          <button
            type="submit"
            disabled={eliminateMutation.isPending || !eliminationThreshold}
            className="btn btn-danger"
          >
            {eliminateMutation.isPending ? "Processing..." : "Execute Break"}
          </button>
        </form>
      </div>

      {view === "teams" && (
        <div>
          {teamsLoading ? (
            <p>Calculating team standings...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "80px", textAlign: "center" }}>Rank</th>
                  <th>Team Name</th>
                  <th style={{ textAlign: "right" }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {teamStandings?.map((team, index) => (
                  <tr key={team.id}>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ fontWeight: "bold" }}>{team.name}</td>
                    <td
                      style={{
                        textAlign: "right",
                        fontFamily: "monospace",
                        fontSize: "1.1rem",
                      }}
                    >
                      {team.total_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {view === "speakers" && (
        <div>
          {speakersLoading ? (
            <p>Calculating speaker standings...</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "80px", textAlign: "center" }}>Rank</th>
                  <th>Speaker Name</th>
                  <th style={{ textAlign: "right" }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {speakerStandings?.map((speaker, index) => (
                  <tr key={speaker.id}>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ fontWeight: "bold" }}>{speaker.name}</td>
                    <td
                      style={{
                        textAlign: "right",
                        fontFamily: "monospace",
                        fontSize: "1.1rem",
                      }}
                    >
                      {speaker.total_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
