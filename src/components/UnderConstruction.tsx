import React from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const UnderConstruction: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1 style={{ color: "var(--secondary)" }}>🚧 Under Construction 🚧</h1>
      <div
        style={{
          background: "var(--bg-light)",
          border: `2px dashed var(--warning)`,
          padding: "2rem",
          borderRadius: "8px",
          display: "inline-block",
          marginTop: "2rem",
          minWidth: "300px",
        }}
      >
        <h2>Session Active</h2>
        <p>
          <strong>Welcome back,</strong> {user.username}
        </p>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            marginBottom: "2rem",
          }}
        >
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
          <Link
            to="/cabinet"
            style={{
              padding: "0.75rem",
              background: "var(--info)",
              color: "var(--bg-light)",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            Go to User Cabinet
          </Link>
          <Link
            to="/admin"
            style={{
              padding: "0.75rem",
              background: "var(--danger)",
              color: "var(--bg-light)",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            Go to Admin Panel
          </Link>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "0.5rem 1rem",
            background: "transparent",
            color: "var(--danger)",
            border: "1px solid var(--danger)",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          End Session
        </button>
      </div>
    </div>
  );
};
