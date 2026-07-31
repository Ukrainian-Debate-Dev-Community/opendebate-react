import React from "react";
import { Link } from "react-router";

export interface EventCardProps {
  event: any;
  role: "speaker" | "adjudicator";
}

export const EventCard: React.FC<EventCardProps> = ({ event, role }) => {
  const isSpeaker = role === "speaker";

  return (
    <div
      className="panel"
      style={{
        borderLeft: `4px solid var(--${isSpeaker ? "primary" : "info"})`,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4 style={{ margin: "0 0 0.5rem 0" }}>{event.name}</h4>
        <span
          className={`badge ${
            event.status === "in_progress"
              ? "badge-warning"
              : event.status === "completed"
                ? "badge-success"
                : "badge-secondary"
          }`}
        >
          {event.status.replace("_", " ")}
        </span>
      </div>
      <p
        className="text-muted"
        style={{ fontSize: "0.9rem", margin: "0 0 1rem 0" }}
      >
        Starts:{" "}
        {event.start_date
          ? new Date(event.start_date).toLocaleDateString()
          : "TBA"}
      </p>
      <Link
        to={`/events/${event.id}`}
        className={`btn btn-${isSpeaker ? "primary" : "info"} btn-sm`}
      >
        Go to Hub &rarr;
      </Link>
    </div>
  );
};
