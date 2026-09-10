import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitRoomScores } from "../../../api/score";
import { extractErrorMessage } from "../../../utils/errorHandler";
import type { SubmitScoresPayload, Room } from "../../../types/api";

interface RoomScoringFormProps {
  room: Room;
  onSuccessCallback?: () => void;
}

export const RoomScoringForm: React.FC<RoomScoringFormProps> = ({
  room,
  onSuccessCallback,
}) => {
  const queryClient = useQueryClient();
  const [teamRanks, setTeamRanks] = useState<Record<number, number | "">>({});
  const [speakerScores, setSpeakerScores] = useState<
    Record<number, number | "">
  >({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const format = room.Format;

  const scoreMutation = useMutation({
    mutationFn: (payload: SubmitScoresPayload) =>
      submitRoomScores(room.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      alert("Scores submitted successfully! The room is now completed.");
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) =>
      setErrorMsg(extractErrorMessage(error, "Failed to submit scores.")),
  });

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const teamRankingsPayload = [];
    const speakerScoresPayload = [];
    const ranksUsed = new Set<number>();

    for (const rt of room.RoomTeams) {
      const rank = teamRanks[rt.id];
      if (rank === undefined || rank === "")
        return setErrorMsg(`Missing rank for team: ${rt.Team.name}`);

      const numRank = Number(rank);
      if (numRank < 1 || numRank > format.teams_per_room) {
        return setErrorMsg(
          `Rank for ${rt.Team.name} must be between 1 and ${format.teams_per_room}.`,
        );
      }
      if (ranksUsed.has(numRank))
        return setErrorMsg(
          `Duplicate rank detected: ${numRank}. Ranks must be unique.`,
        );

      ranksUsed.add(numRank);
      teamRankingsPayload.push({ room_team_id: rt.id, rank: numRank });
    }

    for (const rt of room.RoomTeams) {
      for (const rs of rt.RoomSpeakers) {
        const score = speakerScores[rs.id];
        if (score === undefined || score === "")
          return setErrorMsg(
            `Missing score for speaker: ${rs.EventParticipant.display_name}`,
          );

        const numScore = Number(score);
        if (numScore < format.score_min || numScore > format.score_max) {
          return setErrorMsg(
            `Score for ${rs.EventParticipant.display_name} is out of bounds (${format.score_min}-${format.score_max}).`,
          );
        }
        speakerScoresPayload.push({ room_speaker_id: rs.id, score: numScore });
      }
    }

    scoreMutation.mutate({
      teamRankings: teamRankingsPayload,
      speakerScores: speakerScoresPayload,
    });
  };

  return (
    <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2
        style={{
          marginTop: 0,
          color: "var(--primary)",
          borderBottom: "2px solid var(--border)",
          paddingBottom: "0.5rem",
        }}
      >
        Official Electronic Ballot
      </h2>

      <div className="panel">
        <strong>Format Rules ({format.code}):</strong> Ranks must be 1 to{" "}
        {format.teams_per_room}. Scores must be between {format.score_min} and{" "}
        {format.score_max}.
      </div>

      {errorMsg && (
        <div
          style={{
            background: "var(--danger)",
            color: "white",
            padding: "1rem",
            borderRadius: "4px",
            marginBottom: "1.5rem",
          }}
        >
          <strong>Error:</strong> {errorMsg}
        </div>
      )}

      <form onSubmit={validateAndSubmit}>
        {room.RoomTeams.sort((a, b) => a.position - b.position).map((rt) => (
          <div
            key={rt.id}
            style={{
              marginBottom: "2rem",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "var(--bg-light)",
                padding: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3 style={{ margin: 0 }}>
                Position {rt.position}: {rt.Team.name}
              </h3>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <label style={{ fontWeight: "bold" }}>Team Rank:</label>
                <input
                  type="number"
                  min="1"
                  max={format.teams_per_room}
                  required
                  value={teamRanks[rt.id] ?? ""}
                  onChange={(e) =>
                    setTeamRanks({
                      ...teamRanks,
                      [rt.id]:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  className="form-input"
                  style={{ width: "80px", marginBottom: 0 }}
                />
              </div>
            </div>
            <div style={{ padding: "1rem" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", paddingBottom: "0.5rem" }}>
                      Speaker Name
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        paddingBottom: "0.5rem",
                        width: "150px",
                      }}
                    >
                      Speaker Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rt.RoomSpeakers.map((rs) => (
                    <tr key={rs.id}>
                      <td
                        style={{
                          padding: "0.5rem 0",
                          borderTop: "1px dashed var(--border)",
                        }}
                      >
                        {rs.EventParticipant.display_name}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0",
                          borderTop: "1px dashed var(--border)",
                          textAlign: "right",
                        }}
                      >
                        <input
                          type="number"
                          min={format.score_min}
                          max={format.score_max}
                          step="0.5"
                          required
                          value={speakerScores[rs.id] ?? ""}
                          onChange={(e) =>
                            setSpeakerScores({
                              ...speakerScores,
                              [rs.id]:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                          className="form-input"
                          style={{
                            width: "100px",
                            marginBottom: 0,
                            display: "inline-block",
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        <button
          type="submit"
          disabled={scoreMutation.isPending}
          className="btn btn-primary"
          style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
        >
          {scoreMutation.isPending
            ? "Validating & Submitting..."
            : "Submit Official Ballot"}
        </button>
      </form>
    </div>
  );
};
