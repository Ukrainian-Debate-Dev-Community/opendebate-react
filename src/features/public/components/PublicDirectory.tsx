import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchOrganisations } from "../../../api/organisation";

export const PublicDirectory: React.FC = () => {
  const {
    data: organisations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["organisations"],
    queryFn: fetchOrganisations,
  });

  if (isLoading)
    return <div className="container">Loading public directory...</div>;
  if (isError)
    return (
      <div className="container" style={{ color: "var(--danger)" }}>
        Failed to load directory.
      </div>
    );

  const publicOrgs =
    organisations?.filter((org) => org.status === "active") || [];

  return (
    <div className="container">
      <Link to="/" className="back-link">
        &larr; Back to Dashboard
      </Link>
      <h1 className="page-title">Tournament Directory</h1>
      <p className="text-muted" style={{ marginBottom: "2rem" }}>
        Browse active debate organisations and find upcoming tournaments.
      </p>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Organisation Name</th>
              <th>Type</th>
              <th>Format</th>
            </tr>
          </thead>
          <tbody>
            {publicOrgs.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>
                  No active organisations found.
                </td>
              </tr>
            )}
            {publicOrgs.map((org) => (
              <tr key={org.id}>
                <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  <Link
                    to={`/organisations/${org.id}`}
                    style={{ color: "var(--primary)", textDecoration: "none" }}
                  >
                    {org.name}
                  </Link>
                </td>
                <td style={{ textTransform: "capitalize" }}>{org.type}</td>
                <td>{org.online ? "Online" : "In-Person"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
