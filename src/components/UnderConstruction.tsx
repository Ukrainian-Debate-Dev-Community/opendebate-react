import React from "react";
import { useNavigate, Navigate } from "react-router-dom";
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
      <h1 style={{ color: "var(--secondary)" }}> Under Construction </h1>
      <div
        style={{
          background: "var(--bg-light)",
          border: `2px dashed var(--warning)`,
          padding: "2rem",
          borderRadius: "8px",
          display: "inline-block",
          marginTop: "2rem",
        }}
      >
        <h2>Session Active</h2>
        <p>
          <strong>Welcome back,</strong> {user.username}
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          User ID: {user.id}
        </p>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            background: "var(--danger)",
            color: "var(--bg-light)",
            border: "none",
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
