import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../api/axios.ts";
import { extractErrorMessage } from "../../../utils/errorHandler";

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: () => apiClient.post("/users/login", { username, password }),
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.data);
      navigate("/");
    },
    onError: (err) =>
      setError(
        extractErrorMessage(
          err,
          "Login failed. Please check your credentials.",
        ),
      ),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate();
  };

  return (
    <div className="container-center">
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h2 className="page-title" style={{ marginTop: 0, border: "none" }}>
          Sign In
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
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="btn btn-primary btn-block"
        >
          {loginMutation.isPending ? "Authenticating..." : "Login"}
        </button>
        <div
          style={{ textAlign: "center", fontSize: "0.9rem", marginTop: "1rem" }}
        >
          <span className="text-muted">Don't have an account? </span>
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
