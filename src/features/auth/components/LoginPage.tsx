import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../api/axios.ts";
import { AxiosError } from "axios";

interface LoginResponse {
  status: string;
  message: string;
  token: string;
  data: {
    id: number;
    username: string;
  };
}

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post<LoginResponse>("/users/login", {
        username,
        password,
      });

      const { token, data } = response.data;
      setAuth(token, data);
      navigate("/");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(
          err.response.data.message ||
            "Login failed. Please check your credentials.",
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
        <h2 style={{ marginTop: 0, color: "var(--primary)" }}>Sign In</h2>

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

        <div style={{ marginBottom: "1.5rem" }}>
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
          }}
        >
          {isLoading ? "Authenticating..." : "Login"}
        </button>
        <div
          style={{ textAlign: "center", fontSize: "0.9rem", marginTop: "1rem" }}
        >
          <span style={{ color: "var(--text-muted)" }}>
            Don't have an account?{" "}
          </span>
          <Link
            to="/register"
            style={{
              color: "var(--secondary)",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Register
          </Link>
        </div>
      </form>
    </div>
  );
};
