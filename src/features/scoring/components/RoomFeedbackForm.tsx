import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitRoomFeedback } from "../../events/api/scoreApi";
import { extractErrorMessage } from "../../../utils/errorHandler";
import type { Room, SubmitFeedbackPayload } from "../../../types/api";

interface RoomFeedbackFormProps {
  room: Room;
  adjudicatorId: number;
  adjudicatorName: string;
  onSuccessCallback?: () => void;
}

export const RoomFeedbackForm: React.FC<RoomFeedbackFormProps> = ({
  room,
  adjudicatorId,
  adjudicatorName,
  onSuccessCallback,
}) => {
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [issuerType, setIssuerType] = useState<"team" | "speaker">("speaker");
  const [issuerId, setIssuerId] = useState<number | "">("");

  const feedbackMutation = useMutation({
    mutationFn: (payload: SubmitFeedbackPayload) =>
      submitRoomFeedback(room.id, payload),
    onSuccess: () => {
      alert("Feedback submitted successfully. Thank you!");
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to submit feedback.")),
  });

  const teamsInRoom = room.RoomTeams || [];
  const speakersInRoom = teamsInRoom.flatMap(
    (rt) =>
      rt.RoomSpeakers?.map((rs) => ({
        participant_id: rs.EventParticipant.id,
        name: rs.EventParticipant.display_name,
        teamName: rt.Team.name,
      })) || [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuerId)
      return alert("Please select who you are submitting this feedback as.");

    const payload: SubmitFeedbackPayload = {
      adjudicator_id: adjudicatorId,
      score: score,
      comment: comment || undefined,
    };

    if (issuerType === "team") {
      payload.issuer_team_id = Number(issuerId);
    } else {
      payload.issuer_participant_id = Number(issuerId);
    }

    feedbackMutation.mutate(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "var(--primary)",
          borderBottom: "2px solid var(--border)",
          paddingBottom: "0.5rem",
        }}
      >
        Submit Adjudicator Feedback
      </h2>

      <div className="panel" style={{ marginBottom: "1.5rem" }}>
        <p style={{ margin: 0 }}>
          You are evaluating Chair Adjudicator:{" "}
          <strong>{adjudicatorName}</strong>
        </p>
      </div>

      <div className="panel" style={{ border: "1px dashed var(--secondary)" }}>
        <h4 style={{ marginTop: 0, marginBottom: "1rem" }}>
          Who is submitting this feedback?
        </h4>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="radio"
              name="issuerType"
              checked={issuerType === "speaker"}
              onChange={() => {
                setIssuerType("speaker");
                setIssuerId("");
              }}
            />
            As an Individual Speaker
          </label>
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="radio"
              name="issuerType"
              checked={issuerType === "team"}
              onChange={() => {
                setIssuerType("team");
                setIssuerId("");
              }}
            />
            As a Collective Team
          </label>
        </div>

        <select
          value={issuerId}
          onChange={(e) => setIssuerId(Number(e.target.value))}
          required
          className="form-input"
          style={{ marginBottom: 0 }}
        >
          <option value="" disabled>
            -- Select your identity --
          </option>
          {issuerType === "team"
            ? teamsInRoom.map((rt) => (
                <option key={rt.Team.id} value={rt.Team.id}>
                  {rt.Team.name}
                </option>
              ))
            : speakersInRoom.map((sp) => (
                <option key={sp.participant_id} value={sp.participant_id}>
                  {sp.name} ({sp.teamName})
                </option>
              ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Score (1-10) *</label>
        <input
          type="number"
          min="1"
          max="10"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Constructive Comments</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="form-input"
          rows={4}
          placeholder="What did the adjudicator do well? What could they improve?"
        />
      </div>

      <button
        type="submit"
        disabled={feedbackMutation.isPending}
        className="btn btn-primary"
        style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
      >
        {feedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
};
