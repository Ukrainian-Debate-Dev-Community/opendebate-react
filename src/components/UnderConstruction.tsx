import React from "react";
import { useNavigate, Navigate, Link } from "react-router";
import { useAuthStore } from "../store/authStore";

export const UnderConstruction: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!token || !user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container-center">
      <h1 style={{ color: "var(--primary)" }}>OpenDebate Dashboard</h1>

      <div className="card" style={{ minWidth: "350px", textAlign: "center" }}>
        <h2>Welcome back, {user.username}</h2>
        <p className="text-muted" style={{ marginBottom: "2rem" }}>
          User ID: {user.id}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {/* Everyone */}
          <Link to="/organisations" className="btn btn-primary">
            Browse Tournaments
          </Link>
          <Link to="/cabinet" className="btn btn-info">
            Personal Cabinet & Schedule
          </Link>

          {/* Organiser */}
          <Link
            to="/manage/organisations"
            className="btn btn-secondary"
            style={{ marginTop: "1rem" }}
          >
            Organiser Workspace
          </Link>

          {/* Global Admins Only */}
          {user?.isAdmin && (
            <Link
              to="/admin"
              className="btn btn-danger"
              style={{ marginTop: "1rem" }}
            >
              Global System Admin Panel
            </Link>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline-danger"
          style={{ width: "100%" }}
        >
          End Session
        </button>
      </div>
    </div>
  );
};
