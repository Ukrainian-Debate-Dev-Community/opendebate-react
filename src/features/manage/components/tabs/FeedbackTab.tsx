import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEventFeedback } from "../../../../api/score";

export const FeedbackTab: React.FC<{ eventId: number }> = ({ eventId }) => {
  const { data: feedbackRecords, isLoading } = useQuery({
    queryKey: ["feedback", eventId],
    queryFn: () => fetchEventFeedback(eventId),
  });

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
        <h2>Adjudicator Feedback</h2>
      </div>

      {isLoading ? (
        <p>Loading feedback records...</p>
      ) : feedbackRecords?.length === 0 ? (
        <p
          className="text-muted panel"
          style={{ textAlign: "center", padding: "2rem 0" }}
        >
          No feedback has been submitted yet.
        </p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Adjudicator</th>
              <th style={{ textAlign: "center" }}>Score</th>
              <th>Comment</th>
              <th>Issued By</th>
              <th>Round / Room</th>
            </tr>
          </thead>
          <tbody>
            {feedbackRecords?.map((record: any) => {
              const issuer = record.IssuerTeam
                ? `Team: ${record.IssuerTeam.name}`
                : record.IssuerParticipant
                  ? `Speaker: ${record.IssuerParticipant.display_name}`
                  : "Unknown";

              const scoreColor =
                record.score >= 8
                  ? "var(--success)"
                  : record.score <= 4
                    ? "var(--danger)"
                    : "var(--warning)";

              return (
                <tr key={record.id}>
                  <td style={{ fontWeight: "bold" }}>
                    {record.Adjudicator?.display_name}
                  </td>
                  <td
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      color: scoreColor,
                      fontSize: "1.1rem",
                    }}
                  >
                    {record.score} / 10
                  </td>
                  <td
                    style={{
                      fontStyle: record.comment ? "normal" : "italic",
                      color: record.comment ? "inherit" : "var(--text-muted)",
                    }}
                  >
                    {record.comment || "No comment provided"}
                  </td>
                  <td style={{ color: "var(--secondary)" }}>{issuer}</td>
                  <td style={{ fontSize: "0.9rem" }}>
                    {record.Room?.Round?.name} <br />
                    <span className="text-muted">(Room #{record.room_id})</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
