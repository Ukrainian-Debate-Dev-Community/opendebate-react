import React, { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/authStore";
import { extractErrorMessage } from "../../../utils/errorHandler";
import {
  updateUsername,
  updatePassword,
  fetchUserSchedule,
  fetchUserHistory,
  fetchUserStats,
  claimIdentity,
} from "../../../api/user";
import { EventCard } from "../../../components/ui/EventCard";

type CabinetTab = "profile" | "schedule" | "history" | "stats" | "claim";

export const UserCabinet: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<CabinetTab>("profile");

  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [claimParticipantId, setClaimParticipantId] = useState("");
  const [claimToken, setClaimToken] = useState("");

  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ["userSchedule"],
    queryFn: fetchUserSchedule,
    enabled: activeTab === "schedule",
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["userHistory"],
    queryFn: fetchUserHistory,
    enabled: activeTab === "history",
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["userStats", user?.id],
    queryFn: () => fetchUserStats(user!.id),
    enabled: activeTab === "stats" && !!user?.id,
  });

  const usernameMutation = useMutation({
    mutationFn: (username: string) => updateUsername(username),
    onSuccess: () => {
      alert("Username updated. Please log in again.");
      logout();
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to update username.")),
  });

  const passwordMutation = useMutation({
    mutationFn: () => updatePassword({ oldPassword, newPassword }),
    onSuccess: () => {
      alert("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to update password.")),
  });

  const claimMutation = useMutation({
    mutationFn: () =>
      claimIdentity(parseInt(claimParticipantId, 10), claimToken),
    onSuccess: () => {
      alert("Identity claimed successfully! Statistics linked.");
      setClaimParticipantId("");
      setClaimToken("");
      queryClient.invalidateQueries({ queryKey: ["userSchedule"] });
      queryClient.invalidateQueries({ queryKey: ["userHistory"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to claim identity.")),
  });

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <Link to="/" className="back-link">
            &larr; Back to Dashboard
          </Link>
          <h1 className="page-title" style={{ border: "none", margin: 0 }}>
            My Cabinet
          </h1>
        </div>
      </div>

      <div className="tab-nav">
        <button
          onClick={() => setActiveTab("profile")}
          className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`tab-btn ${activeTab === "schedule" ? "active" : ""}`}
        >
          My Schedule
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
        >
          Tournament History
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
        >
          My Stats
        </button>
        <button
          onClick={() => setActiveTab("claim")}
          className={`tab-btn ${activeTab === "claim" ? "active" : ""}`}
        >
          Claim Identity
        </button>
      </div>

      <div className="card">
        {activeTab === "profile" && (
          <div
            className="form-grid"
            style={{ alignItems: "start", gap: "2rem" }}
          >
            <div className="panel">
              <h2 style={{ marginTop: 0 }}>Change Username</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  usernameMutation.mutate(newUsername);
                }}
              >
                <div className="form-group">
                  <label className="form-label">New Username</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    usernameMutation.isPending || newUsername === user?.username
                  }
                  className="btn btn-primary"
                >
                  {usernameMutation.isPending
                    ? "Updating..."
                    : "Update Username"}
                </button>
              </form>
            </div>

            <div className="panel">
              <h2 style={{ marginTop: 0 }}>Change Password</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  passwordMutation.mutate();
                }}
              >
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordMutation.isPending}
                  className="btn btn-warning"
                >
                  {passwordMutation.isPending
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div>
            <h2 style={{ marginTop: 0 }}>My Upcoming Tournaments</h2>
            {scheduleLoading ? (
              <p>Loading schedule...</p>
            ) : (
              <div className="form-grid" style={{ gap: "2rem" }}>
                <div>
                  <h3
                    style={{
                      borderBottom: "2px solid var(--border)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    As a Speaker
                  </h3>
                  {schedule?.as_player?.length === 0 ? (
                    <p className="text-muted">No upcoming events.</p>
                  ) : (
                    schedule?.as_player?.map((event: any) => (
                      <EventCard key={event.id} event={event} role="speaker" />
                    ))
                  )}
                </div>
                <div>
                  <h3
                    style={{
                      borderBottom: "2px solid var(--border)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    As an Adjudicator
                  </h3>
                  {schedule?.as_adjudicator?.length === 0 ? (
                    <p className="text-muted">No upcoming events.</p>
                  ) : (
                    schedule?.as_adjudicator?.map((event: any) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        role="adjudicator"
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h2 style={{ marginTop: 0 }}>Past Tournaments</h2>
            {historyLoading ? (
              <p>Loading history...</p>
            ) : (
              <div className="form-grid" style={{ gap: "2rem" }}>
                <div>
                  <h3
                    style={{
                      borderBottom: "2px solid var(--border)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    As a Speaker
                  </h3>
                  {history?.as_player?.length === 0 ? (
                    <p className="text-muted">No past events found.</p>
                  ) : (
                    history?.as_player?.map((event: any) => (
                      <EventCard key={event.id} event={event} role="speaker" />
                    ))
                  )}
                </div>
                <div>
                  <h3
                    style={{
                      borderBottom: "2px solid var(--border)",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    As an Adjudicator
                  </h3>
                  {history?.as_adjudicator?.length === 0 ? (
                    <p className="text-muted">No past events found.</p>
                  ) : (
                    history?.as_adjudicator?.map((event: any) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        role="adjudicator"
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "stats" && (
          <div>
            <h2 style={{ marginTop: 0 }}>Career Statistics</h2>
            {statsLoading ? (
              <p>Loading your debate history...</p>
            ) : !stats ? (
              <div className="panel">
                <p className="text-muted" style={{ margin: 0 }}>
                  This user has not participated as a speaker in any logged
                  debates.
                </p>
              </div>
            ) : (
              <div className="form-grid" style={{ gap: "2rem" }}>
                <div
                  className="panel"
                  style={{ borderLeft: "4px solid var(--primary)" }}
                >
                  <h3 style={{ marginTop: 0 }}>Speaker Record</h3>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      fontSize: "1.1rem",
                      lineHeight: "1.8",
                    }}
                  >
                    <li>
                      <strong>Total Ballots Received:</strong>{" "}
                      {stats.overview?.total_ballots_received}
                    </li>
                    <li>
                      <strong>Total Debates Ranked:</strong>{" "}
                      {stats.overview?.total_debates_ranked}
                    </li>
                    <li>
                      <strong>Average Score:</strong>{" "}
                      {stats.overview?.average_speaker_score}
                    </li>
                    <li>
                      <strong>Highest Score:</strong>{" "}
                      {stats.overview?.highest_score}
                    </li>
                    <li>
                      <strong>Lowest Score:</strong>{" "}
                      {stats.overview?.lowest_score}
                    </li>
                  </ul>
                </div>

                <div
                  className="panel"
                  style={{ borderLeft: "4px solid var(--success)" }}
                >
                  <h3 style={{ marginTop: 0 }}>Placements & Wins</h3>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      fontSize: "1.1rem",
                      lineHeight: "1.8",
                    }}
                  >
                    <li>
                      <strong>First Places (Wins):</strong>{" "}
                      {stats.placements?.first_places}
                    </li>
                    <li>
                      <strong>Overall Win Rate:</strong>{" "}
                      {stats.placements?.win_rate_percentage}%
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "claim" && (
          <div
            className="panel"
            style={{ maxWidth: "600px", margin: "0 auto" }}
          >
            <h2 style={{ marginTop: 0, color: "var(--info)" }}>
              Link Guest Statistics
            </h2>
            <p className="text-muted">
              If an organiser registered you as a guest, they can provide you
              with a Participant ID and a 16-character secure token. Enter them
              below to link your past debate history to this account.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                claimMutation.mutate();
              }}
            >
              <div className="form-group">
                <label className="form-label">Participant ID *</label>
                <input
                  type="number"
                  required
                  value={claimParticipantId}
                  onChange={(e) => setClaimParticipantId(e.target.value)}
                  className="form-input"
                  placeholder="e.g. 42"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Claim Token *</label>
                <input
                  type="text"
                  required
                  value={claimToken}
                  onChange={(e) => setClaimToken(e.target.value)}
                  className="form-input"
                  placeholder="Paste the hex token here..."
                  style={{ fontFamily: "monospace" }}
                />
              </div>
              <button
                type="submit"
                disabled={claimMutation.isPending}
                className="btn btn-info"
                style={{ width: "100%" }}
              >
                {claimMutation.isPending ? "Verifying..." : "Claim My Identity"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
