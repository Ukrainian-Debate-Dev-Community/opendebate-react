import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitRoomFeedback } from "../../../api/score";
import { extractErrorMessage } from "../../../utils/errorHandler";
import type { Room } from "../../../types/api";

export interface RoomFeedbackFormProps {
  room: Room;
  adjudicatorId: number;
  adjudicatorName: string;
  onSuccessCallback: () => void;
}

export const RoomFeedbackForm: React.FC<RoomFeedbackFormProps> = ({
  room,
  adjudicatorId,
  adjudicatorName,
  onSuccessCallback,
}) => {
  const queryClient = useQueryClient();
  const [issuerMode, setIssuerMode] = useState<"individual" | "team">(
    "individual",
  );
  const [issuerId, setIssuerId] = useState<string>("");
  const [score, setScore] = useState<number | "">("");
  const [comment, setComment] = useState("");

  const individualOptions = Array.from(
    new Map(
      room.RoomTeams?.flatMap((rt) =>
        rt.RoomSpeakers?.map((rs) => [
          rs.EventParticipant?.id,
          {
            id: rs.EventParticipant?.id,
            label: `${rs.EventParticipant?.display_name} (${rt.Team?.name})`,
          },
        ]),
      ),
    ).values(),
  ).filter(Boolean);

  const teamOptions = Array.from(
    new Map(
      room.RoomTeams?.map((rt) => [
        rt.Team?.id,
        {
          id: rt.Team?.id,
          label: rt.Team?.name,
        },
      ]),
    ).values(),
  ).filter(Boolean);

  const feedbackMutation = useMutation({
    mutationFn: () => {
      if (!issuerId || score === "")
        throw new Error("Please fill out all required fields.");

      return submitRoomFeedback(room.id, {
        adjudicator_id: adjudicatorId,
        score: Number(score),
        comment: comment || undefined,
        issuer_team_id: issuerMode === "team" ? Number(issuerId) : undefined,
        issuer_participant_id:
          issuerMode === "individual" ? Number(issuerId) : undefined,
      });
    },
    onSuccess: () => {
      alert("Feedback submitted successfully.");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      onSuccessCallback();
    },
    onError: (error: any) =>
      alert(extractErrorMessage(error, "Failed to submit feedback.")),
  });

  return (
    <div
      className="panel"
      style={{ borderLeft: "4px solid var(--primary)", marginBottom: "1.5rem" }}
    >
      <h3 style={{ marginTop: 0 }}>Evaluate Chair: {adjudicatorName}</h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          feedbackMutation.mutate();
        }}
      >
        <div
          className="form-group"
          style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}
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
              type="radio"
              checked={issuerMode === "individual"}
              onChange={() => {
                setIssuerMode("individual");
                setIssuerId("");
              }}
            />
            As an Individual Speaker
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              checked={issuerMode === "team"}
              onChange={() => {
                setIssuerMode("team");
                setIssuerId("");
              }}
            />
            As a Collective Team
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Select your identity *</label>
          <select
            value={issuerId}
            onChange={(e) => setIssuerId(e.target.value)}
            required
            className="form-input"
          >
            <option value="" disabled>
              -- Select your identity --
            </option>
            {issuerMode === "individual"
              ? individualOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))
              : teamOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
          </select>
        </div>

        <div className="form-grid" style={{ gap: "1rem", alignItems: "start" }}>
          <div className="form-group">
            <label className="form-label">Score (e.g. 1-10) *</label>
            <input
              type="number"
              required
              value={score}
              onChange={(e) =>
                setScore(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Feedback Comments</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-input"
              rows={3}
              placeholder="Provide constructive feedback..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={feedbackMutation.isPending || !issuerId || score === ""}
          className="btn btn-primary"
        >
          {feedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </div>
  );
};
