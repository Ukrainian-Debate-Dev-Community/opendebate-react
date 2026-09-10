import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchEventRounds, fetchRoundRooms } from "../../../api/round";
import { fetchEventTeams } from "../../../api/team";
import {
  fetchCalculatedTeamStandings,
  fetchCalculatedSpeakerStandings,
} from "../../../api/standings";
import { registerForEvent } from "../../../api/participant";
import { useAuthStore } from "../../../store/authStore";
import { extractErrorMessage } from "../../../utils/errorHandler";

import { RoomScoringForm } from "../../scoring/components/RoomScoringForm";
import { RoomFeedbackForm } from "../../scoring/components/RoomFeedbackForm";
import type { Room } from "../../../types/api";

// Added speaker_standings to the tab types
type PublicTab = "draw" | "teams" | "team_standings" | "speaker_standings";

export const PublicEventDashboard: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const id = parseInt(eventId || "0", 10);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<PublicTab>("draw");
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

  const [scoringRoom, setScoringRoom] = useState<Room | null>(null);
  const [feedbackRoom, setFeedbackRoom] = useState<Room | null>(null);

  const [showRegistration, setShowRegistration] = useState(false);
  const [regDisplayName, setRegDisplayName] = useState(
    currentUser?.username || "",
  );
  const [regRole, setRegRole] = useState<"speaker" | "adjudicator">("speaker");

  const { data: rounds } = useQuery({
    queryKey: ["rounds", id],
    queryFn: () => fetchEventRounds(id),
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms", selectedRoundId],
    queryFn: () => fetchRoundRooms(selectedRoundId!),
    enabled: !!selectedRoundId,
  });

  const { data: teams } = useQuery({
    queryKey: ["teams", id],
    queryFn: () => fetchEventTeams(id),
    enabled: activeTab === "teams",
  });

  const { data: teamStandings } = useQuery({
    queryKey: ["standings", "teams", id],
    queryFn: () => fetchCalculatedTeamStandings(id),
    enabled: activeTab === "team_standings",
  });

  // NEW: Fetch Speaker Standings
  const { data: speakerStandings } = useQuery({
    queryKey: ["standings", "speakers", id],
    queryFn: () => fetchCalculatedSpeakerStandings(id),
    enabled: activeTab === "speaker_standings",
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      registerForEvent(id, { display_name: regDisplayName, role: regRole }),
    onSuccess: () => {
      alert("Successfully registered for the tournament!");
      setShowRegistration(false);
      queryClient.invalidateQueries({ queryKey: ["participants", id] });
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Registration failed.")),
  });

  useEffect(() => {
    if (rounds && rounds.length > 0 && !selectedRoundId) {
      const active =
        rounds.find((r) => r.status === "in_progress") ||
        rounds[rounds.length - 1];
      setSelectedRoundId(active.id);
    }
  }, [rounds, selectedRoundId]);

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
          <Link to="/organisations" className="back-link">
            &larr; Back to Directory
          </Link>
          <h1 className="page-title" style={{ border: "none", margin: 0 }}>
            Tournament Hub
          </h1>
        </div>

        {currentUser && !showRegistration && (
          <button
            onClick={() => setShowRegistration(true)}
            className="btn btn-success"
          >
            Register for Event
          </button>
        )}
      </div>

      {showRegistration && (
        <div
          className="card"
          style={{ border: "2px solid var(--success)", marginBottom: "2rem" }}
        >
          <h2 style={{ marginTop: 0, color: "var(--success)" }}>
            Join the Tournament
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              registerMutation.mutate();
            }}
          >
            <div className="form-group">
              <label className="form-label">Display Name *</label>
              <input
                type="text"
                required
                value={regDisplayName}
                onChange={(e) => setRegDisplayName(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                value={regRole}
                onChange={(e) =>
                  setRegRole(e.target.value as "speaker" | "adjudicator")
                }
                className="form-input"
              >
                <option value="speaker">
                  Register as Speaker (Independent)
                </option>
                <option value="adjudicator">Register as Adjudicator</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="btn btn-primary"
              >
                {registerMutation.isPending
                  ? "Registering..."
                  : "Confirm Registration"}
              </button>
              <button
                type="button"
                onClick={() => setShowRegistration(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="tab-nav">
        <button
          onClick={() => {
            setActiveTab("draw");
            setScoringRoom(null);
            setFeedbackRoom(null);
          }}
          className={`tab-btn ${activeTab === "draw" ? "active" : ""}`}
        >
          The Draw (Pairings)
        </button>
        <button
          onClick={() => {
            setActiveTab("teams");
            setScoringRoom(null);
            setFeedbackRoom(null);
          }}
          className={`tab-btn ${activeTab === "teams" ? "active" : ""}`}
        >
          Teams
        </button>
        <button
          onClick={() => {
            setActiveTab("team_standings");
            setScoringRoom(null);
            setFeedbackRoom(null);
          }}
          className={`tab-btn ${activeTab === "team_standings" ? "active" : ""}`}
        >
          Team Standings
        </button>
        <button
          onClick={() => {
            setActiveTab("speaker_standings");
            setScoringRoom(null);
            setFeedbackRoom(null);
          }}
          className={`tab-btn ${activeTab === "speaker_standings" ? "active" : ""}`}
        >
          Speaker Standings
        </button>
      </div>

      <div className="card">
        {/* --- TAB 1: THE DRAW --- */}
        {activeTab === "draw" && (
          <div>
            {scoringRoom ? (
              <div>
                <button
                  onClick={() => setScoringRoom(null)}
                  className="btn btn-outline-danger"
                  style={{ marginBottom: "1rem" }}
                >
                  &larr; Cancel Scoring & Return to Draw
                </button>
                <RoomScoringForm
                  room={scoringRoom}
                  onSuccessCallback={() => setScoringRoom(null)}
                />
              </div>
            ) : feedbackRoom ? (
              <div>
                <button
                  onClick={() => setFeedbackRoom(null)}
                  className="btn btn-outline-danger"
                  style={{ marginBottom: "1rem" }}
                >
                  &larr; Cancel & Return to Draw
                </button>
                <RoomFeedbackForm
                  room={feedbackRoom}
                  adjudicatorId={
                    feedbackRoom.RoomAdjudicators?.find(
                      (a: any) => a.role === "chair",
                    )?.EventParticipant?.id || 0
                  }
                  adjudicatorName={
                    feedbackRoom.RoomAdjudicators?.find(
                      (a: any) => a.role === "chair",
                    )?.EventParticipant?.display_name || "Unknown"
                  }
                  onSuccessCallback={() => setFeedbackRoom(null)}
                />
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1.5rem",
                    overflowX: "auto",
                    paddingBottom: "0.5rem",
                  }}
                >
                  {rounds?.length === 0 && (
                    <p className="text-muted">
                      No rounds have been generated yet.
                    </p>
                  )}
                  {rounds?.map((round) => (
                    <button
                      key={round.id}
                      onClick={() => setSelectedRoundId(round.id)}
                      className={`btn ${selectedRoundId === round.id ? "btn-primary" : ""}`}
                      style={{
                        border:
                          selectedRoundId !== round.id
                            ? "1px solid var(--border)"
                            : "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {round.name}
                    </button>
                  ))}
                </div>

                {selectedRoundId && (
                  <div>
                    {roomsLoading ? (
                      <p>Loading pairings...</p>
                    ) : rooms?.length === 0 ? (
                      <p
                        className="text-muted panel"
                        style={{ textAlign: "center" }}
                      >
                        The draw for this round has not been released yet.
                      </p>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(300px, 1fr))",
                          gap: "1rem",
                        }}
                      >
                        {rooms?.map((room) => (
                          <div
                            key={room.id}
                            style={{
                              border: "2px solid var(--border)",
                              borderRadius: "8px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                background: "var(--bg-dark)",
                                padding: "0.75rem 1rem",
                                fontWeight: "bold",
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <span>Room #{room.id}</span>
                              <span
                                className={`badge ${room.status === "completed" ? "badge-success" : "badge-secondary"}`}
                              >
                                {room.status}
                              </span>
                            </div>

                            <div style={{ padding: "1rem" }}>
                              <div style={{ marginBottom: "1rem" }}>
                                <span
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Chair Adjudicator
                                </span>
                                <div
                                  style={{
                                    fontSize: "1.1rem",
                                    color: "var(--primary)",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {room.RoomAdjudicators?.find(
                                    (a: any) => a.role === "chair",
                                  )?.EventParticipant?.display_name || "TBA"}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  color: "var(--text-muted)",
                                  textTransform: "uppercase",
                                  fontWeight: "bold",
                                }}
                              >
                                Matchup
                              </span>
                              <ul
                                style={{
                                  margin: "0.5rem 0 0 0",
                                  paddingLeft: "1.5rem",
                                }}
                              >
                                {room.RoomTeams?.sort(
                                  (a: any, b: any) => a.position - b.position,
                                ).map((rt: any) => (
                                  <li
                                    key={rt.id}
                                    style={{
                                      marginBottom: "0.5rem",
                                      fontSize: "1.05rem",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: "var(--secondary)",
                                        fontWeight: "bold",
                                        marginRight: "0.5rem",
                                      }}
                                    >
                                      Pos {rt.position}:
                                    </span>
                                    {rt.Team?.name}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* FRONTEND BYPASS: Show action buttons to any logged-in user if the room status allows it */}
                            {currentUser && (
                              <div
                                style={{
                                  padding: "1rem",
                                  borderTop: "1px solid var(--border)",
                                  background: "var(--bg)",
                                  display: "flex",
                                  gap: "0.5rem",
                                }}
                              >
                                {(() => {
                                  if (
                                    room.status === "pending" ||
                                    room.status === "judging"
                                  ) {
                                    return (
                                      <button
                                        onClick={() => setScoringRoom(room)}
                                        className="btn btn-success btn-sm"
                                        style={{ flex: 1 }}
                                      >
                                        Submit Official Ballot
                                      </button>
                                    );
                                  }
                                  return null;
                                })()}

                                {(() => {
                                  if (room.status === "completed") {
                                    return (
                                      <button
                                        onClick={() => setFeedbackRoom(room)}
                                        className="btn btn-primary btn-sm"
                                        style={{ flex: 1 }}
                                      >
                                        Evaluate Chair Adjudicator
                                      </button>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: TEAMS --- */}
        {activeTab === "teams" && (
          <div>
            <h2 style={{ marginTop: 0 }}>Registered Teams</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Speakers</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teams?.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      No teams registered yet.
                    </td>
                  </tr>
                )}
                {teams?.map((team) => (
                  <tr key={team.id}>
                    <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                      {team.name}
                    </td>
                    <td>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: "1.2rem",
                          color: "var(--text)",
                        }}
                      >
                        {team.speakers.map((sp) => (
                          <li key={sp.participant_id}>{sp.name}</li>
                        ))}
                      </ul>
                    </td>
                    <td>
                      {team.is_eliminated ? (
                        <span className="badge badge-danger">Eliminated</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TAB 3: TEAM STANDINGS --- */}
        {activeTab === "team_standings" && (
          <div>
            <h2 style={{ marginTop: 0 }}>Team Leaderboard</h2>
            <div
              className="panel"
              style={{ borderLeft: "4px solid var(--info)" }}
            >
              <p style={{ margin: 0 }}>
                Standings are calculated dynamically based on completed ballots.
              </p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "80px", textAlign: "center" }}>Rank</th>
                  <th>Team Name</th>
                  <th style={{ textAlign: "right" }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {teamStandings?.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      No standing data available yet.
                    </td>
                  </tr>
                )}
                {teamStandings?.map((team, index) => (
                  <tr key={team.id}>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                      {team.name}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontFamily: "monospace",
                        fontSize: "1.1rem",
                        color: "var(--primary)",
                      }}
                    >
                      {team.total_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* --- TAB 4: SPEAKER STANDINGS --- */}
        {activeTab === "speaker_standings" && (
          <div>
            <h2 style={{ marginTop: 0 }}>Speaker Leaderboard</h2>
            <div
              className="panel"
              style={{ borderLeft: "4px solid var(--info)" }}
            >
              <p style={{ margin: 0 }}>
                Individual speaker points are aggregated from all completed
                official ballots.
              </p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "80px", textAlign: "center" }}>Rank</th>
                  <th>Speaker Name</th>
                  <th style={{ textAlign: "right" }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {speakerStandings?.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center" }}>
                      No speaker data available yet.
                    </td>
                  </tr>
                )}
                {speakerStandings?.map((speaker, index) => (
                  <tr key={speaker.id}>
                    <td
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                      {speaker.name}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontFamily: "monospace",
                        fontSize: "1.1rem",
                        color: "var(--primary)",
                      }}
                    >
                      {speaker.total_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
