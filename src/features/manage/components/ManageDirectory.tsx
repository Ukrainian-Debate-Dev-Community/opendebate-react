import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchOrganisations } from "../../../api/organisation";
import { useAuthStore } from "../../../store/authStore";

export const ManageDirectory: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const {
    data: organisations,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["organisations"],
    queryFn: fetchOrganisations,
  });

  if (isLoading) return <div className="container">Loading directory...</div>;
  if (isError)
    return (
      <div className="container" style={{ color: "var(--danger)" }}>
        Failed to load organisations.
      </div>
    );

  const managedOrgs = user?.isAdmin
    ? organisations
    : organisations?.filter((org: any) =>
        org.Owners?.some((owner: any) => owner.id === user?.id),
      );

  return (
    <div className="container">
      <Link to="/" className="back-link">
        &larr; Back to Dashboard
      </Link>
      <h1 className="page-title">
        Organiser Workspace{" "}
        <span className="text-muted">(My Organisations)</span>
      </h1>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Format</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {managedOrgs?.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  You do not manage any active organisations.
                </td>
              </tr>
            ) : (
              managedOrgs?.map((org) => (
                <tr key={org.id}>
                  <td>#{org.id}</td>
                  <td style={{ fontWeight: "bold" }}>
                    <Link
                      to={`/manage/organisations/${org.id}`}
                      style={{ color: "var(--info)", textDecoration: "none" }}
                    >
                      {org.name}
                    </Link>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{org.type}</td>
                  <td>{org.online ? "Online" : "In-Person"}</td>
                  <td>
                    <span
                      className={`badge ${org.status === "active" ? "badge-success" : "badge-secondary"}`}
                    >
                      {org.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
