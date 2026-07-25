import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../api/axios";
import { extractErrorMessage } from "../../../utils/errorHandler";

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const registerMutation = useMutation({
    mutationFn: () => apiClient.post("/users/register", { username, password }),
    onSuccess: (response) => {
      setAuth(response.data.token, response.data.data);
      navigate("/");
    },
    onError: (err) =>
      setError(
        extractErrorMessage(err, "Registration failed. Please try again."),
      ),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    registerMutation.mutate();
  };

  return (
    <div className="container-center">
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h2 className="page-title" style={{ marginTop: 0, border: "none" }}>
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
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
          <label className="form-label">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="btn btn-primary btn-block"
          style={{ marginBottom: "1rem" }}
        >
          {registerMutation.isPending ? "Registering..." : "Register"}
        </button>
        <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
          <span className="text-muted">Already have an account? </span>
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
