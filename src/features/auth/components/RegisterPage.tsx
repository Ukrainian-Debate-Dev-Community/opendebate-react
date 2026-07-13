import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../api/axios";
import { AxiosError } from "axios";

interface AuthResponse {
  status: string;
  message?: string;
  token: string;
  data: {
    id: number;
    username: string;
  };
}

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post<AuthResponse>("/users/register", {
        username,
        password,
      });

      const { token, data } = response.data;
      setAuth(token, data);
      navigate("/");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(
          err.response.data.message || "Registration failed. Please try again.",
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexGrow: 1,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--bg-light)",
          padding: "2rem",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "var(--primary)" }}>
          Create an Account
        </h2>

        {error && (
          <div
            style={{
              color: "var(--bg-light)",
              background: "var(--danger)",
              padding: "0.5rem",
              marginBottom: "1rem",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "var(--text-muted)",
            }}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              boxSizing: "border-box",
              border: "1px solid var(--border)",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "var(--text-muted)",
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              boxSizing: "border-box",
              border: "1px solid var(--border)",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              color: "var(--text-muted)",
            }}
          >
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              boxSizing: "border-box",
              border: "1px solid var(--border)",
              borderRadius: "4px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "var(--primary)",
            color: "var(--bg-light)",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>

        <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
          </span>
          <Link
            to="/login"
            style={{
              color: "var(--secondary)",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};
