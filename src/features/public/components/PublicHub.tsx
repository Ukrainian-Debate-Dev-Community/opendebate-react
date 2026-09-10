import React from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchOrganisationById } from "../../../api/organisation";
import { fetchOrganisationEvents } from "../../../api/event";

export const PublicHub: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = parseInt(id || "0", 10);

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

  if (orgLoading || eventsLoading)
    return <div className="container">Loading Organisation...</div>;
  if (!org)
    return (
      <div className="container" style={{ color: "var(--danger)" }}>
        Organisation not found.
      </div>
    );

  return (
    <div className="container">
      <Link to="/organisations" className="back-link">
        &larr; Back to Directory
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid var(--border)",
          marginBottom: "2rem",
          paddingBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>{org.name}</h1>
        {org.link && (
          <a
            href={org.link}
            target="_blank"
            rel="noreferrer"
            className="btn btn-info btn-sm"
            style={{ textDecoration: "none" }}
          >
            Visit Website
          </a>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            background: "var(--bg-dark)",
            padding: "1rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
            Public Event Schedule
          </h2>
        </div>

        {events?.length === 0 ? (
          <p className="text-muted" style={{ padding: "1.5rem" }}>
            No events scheduled at this time.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Status</th>
                <th>Ranked</th>
              </tr>
            </thead>
            <tbody>
              {events?.map((event) => (
                <tr key={event.id}>
                  <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    <Link
                      to={`/events/${event.id}`}
                      style={{
                        color: "var(--primary)",
                        textDecoration: "none",
                      }}
                    >
                      {event.name}
                    </Link>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        event.status === "scheduled"
                          ? "badge-info"
                          : event.status === "in_progress"
                            ? "badge-warning"
                            : "badge-success"
                      }`}
                    >
                      {event.status.replace("_", " ")}
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
