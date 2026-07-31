import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEventRounds,
  createRound,
  fetchRoundRooms,
  createRoom,
  deleteRoom,
} from "../../../../api/round";
import { fetchFormats } from "../../../../api/format";
import { fetchEventTeams } from "../../../../api/team";
import { fetchEventParticipants } from "../../../../api/participant";
import { RoomScoringForm } from "../../../scoring/components/RoomScoringForm";
import { RoomFeedbackForm } from "../../../scoring/components/RoomFeedbackForm";
import { extractErrorMessage } from "../../../../utils/errorHandler";
import type { CreateRoomPayload, Room } from "../../../../types/api";

export const RoundsTab: React.FC<{ eventId: number }> = ({ eventId }) => {
  const queryClient = useQueryClient();
  const [showAddRound, setShowAddRound] = useState(false);
  const [newRoundName, setNewRoundName] = useState("");
  const [newRoundSequence, setNewRoundSequence] = useState<number>(1);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [roomFormatId, setRoomFormatId] = useState("");
  const [chairId, setChairId] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<Record<number, string>>(
    {},
  );

  const [scoringRoom, setScoringRoom] = useState<Room | null>(null);
  const [feedbackRoom, setFeedbackRoom] = useState<Room | null>(null);

  const { data: rounds, isLoading: roundsLoading } = useQuery({
    queryKey: ["rounds", eventId],
    queryFn: () => fetchEventRounds(eventId),
  });
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["rooms", selectedRoundId],
    queryFn: () => fetchRoundRooms(selectedRoundId!),
    enabled: !!selectedRoundId,
  });
  const { data: formats } = useQuery({
    queryKey: ["formats"],
    queryFn: fetchFormats,
  });
  const { data: teamsData } = useQuery({
    queryKey: ["teams", eventId],
    queryFn: () => fetchEventTeams(eventId),
    enabled: showAddRoom,
  });
  const { data: participantsData } = useQuery({
    queryKey: ["participants", eventId, "all"],
    queryFn: () => fetchEventParticipants(eventId, 1, 1000),
    enabled: showAddRoom,
  });

  const addRoundMutation = useMutation({
    mutationFn: (payload: { name: string; sequence: number }) =>
      createRound(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rounds", eventId] });
      setNewRoundName("");
      setShowAddRound(false);
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to create round.")),
  });

  const addRoomMutation = useMutation({
    mutationFn: (payload: CreateRoomPayload) =>
      createRoom(selectedRoundId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", selectedRoundId] });
      setShowAddRoom(false);
      setRoomFormatId("");
      setChairId("");
      setSelectedTeams({});
    },
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to create room.")),
  });

  const removeRoomMutation = useMutation({
    mutationFn: (roomId: number) => deleteRoom(roomId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["rooms", selectedRoundId] }),
    onError: (error) =>
      alert(extractErrorMessage(error, "Failed to delete room.")),
  });

  const selectedFormatDef = formats?.find(
    (f) => f.id.toString() === roomFormatId,
  );
  const adjudicators =
    participantsData?.participants.filter(
      (p) => p.role === "adjudicator" && !p.is_eliminated,
    ) || [];
  const activeTeams = teamsData?.filter((t) => !t.is_eliminated) || [];

  const handleAddRoundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRoundMutation.mutate({ name: newRoundName, sequence: newRoundSequence });
  };

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormatDef || !chairId) return;
    const teamsPayload = [];
    for (let i = 1; i <= selectedFormatDef.teams_per_room; i++) {
      const teamId = selectedTeams[i];
      if (!teamId) return alert(`Please select a team for Position ${i}`);
      teamsPayload.push({ team_id: parseInt(teamId, 10), position: i });
    }
    addRoomMutation.mutate({
      format_id: parseInt(roomFormatId, 10),
      teams: teamsPayload,
      adjudicators: [{ participant_id: parseInt(chairId, 10), role: "chair" }],
    });
  };

  if (scoringRoom) {
    return (
      <div>
        <button
          onClick={() => setScoringRoom(null)}
          className="btn btn-outline-danger"
          style={{ marginBottom: "1rem" }}
        >
          &larr; Cancel Scoring & Return to Matrix
        </button>
        <RoomScoringForm
          room={scoringRoom}
          onSuccessCallback={() => {
            setScoringRoom(null);
            queryClient.invalidateQueries({
              queryKey: ["rooms", selectedRoundId],
            });
          }}
        />
      </div>
    );
  }

  if (feedbackRoom) {
    const chair = feedbackRoom.RoomAdjudicators?.find(
      (a) => a.role === "chair",
    );
    return (
      <div>
        <button
          onClick={() => setFeedbackRoom(null)}
          className="btn btn-outline-danger"
          style={{ marginBottom: "1rem" }}
        >
          &larr; Return to Matrix
        </button>
        {chair ? (
          <RoomFeedbackForm
            room={feedbackRoom}
            adjudicatorId={chair.EventParticipant.id}
            adjudicatorName={chair.EventParticipant.display_name}
            onSuccessCallback={() => setFeedbackRoom(null)}
          />
        ) : (
          <p>No Chair Adjudicator found in this room to evaluate.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2>Tournament Rounds</h2>
        <button
          onClick={() => setShowAddRound(!showAddRound)}
          className="btn btn-success"
        >
          {showAddRound ? "Cancel" : "+ Create Round"}
        </button>
      </div>

      {showAddRound && (
        <form
          onSubmit={handleAddRoundSubmit}
          className="form-grid panel"
          style={{ alignItems: "end" }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Round Name *</label>
            <input
              type="text"
              required
              value={newRoundName}
              onChange={(e) => setNewRoundName(e.target.value)}
              className="form-input"
              placeholder="e.g. Round 1"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Sequence (Chronological Order) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={newRoundSequence}
              onChange={(e) =>
                setNewRoundSequence(parseInt(e.target.value, 10))
              }
              className="form-input"
            />
          </div>
          <button
            type="submit"
            disabled={addRoundMutation.isPending}
            className="btn btn-primary"
            style={{ gridColumn: "span 2" }}
          >
            {addRoundMutation.isPending ? "Creating..." : "Create Round"}
          </button>
        </form>
      )}

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          overflowX: "auto",
          paddingBottom: "1rem",
        }}
      >
        {roundsLoading && <p>Loading rounds...</p>}
        {rounds?.map((round) => (
          <button
            key={round.id}
            onClick={() => {
              setSelectedRoundId(round.id);
              setShowAddRoom(false);
            }}
            className="card"
            style={{
              minWidth: "150px",
              cursor: "pointer",
              marginBottom: 0,
              border:
                selectedRoundId === round.id
                  ? "2px solid var(--primary)"
                  : "1px solid var(--border)",
              background:
                selectedRoundId === round.id ? "var(--bg)" : "var(--bg-light)",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--primary)" }}>
              {round.name}
            </h3>
            <span
              className={`badge ${round.status === "completed" ? "badge-success" : "badge-secondary"}`}
            >
              {round.status}
            </span>
          </button>
        ))}
      </div>

      {selectedRoundId && (
        <div
          style={{
            background: "var(--bg-light)",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid var(--border)",
              paddingBottom: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ margin: 0 }}>Pairing Matrix</h2>
            <button
              onClick={() => setShowAddRoom(!showAddRoom)}
              className="btn btn-info btn-sm"
            >
              {showAddRoom ? "Cancel Room" : "+ Build Room"}
            </button>
          </div>

          {showAddRoom && (
            <form
              onSubmit={handleAddRoomSubmit}
              className="panel"
              style={{ border: "1px dashed var(--info)" }}
            >
              <h3 style={{ marginTop: 0, color: "var(--info)" }}>
                Room Builder
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Format *</label>
                  <select
                    value={roomFormatId}
                    onChange={(e) => {
                      setRoomFormatId(e.target.value);
                      setSelectedTeams({});
                    }}
                    required
                    className="form-input"
                  >
                    <option value="" disabled>
                      -- Select Format --
                    </option>
                    {formats?.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Chair Adjudicator *</label>
                  <select
                    value={chairId}
                    onChange={(e) => setChairId(e.target.value)}
                    required
                    className="form-input"
                  >
                    <option value="" disabled>
                      -- Select Chair --
                    </option>
                    {adjudicators.map((adj) => (
                      <option key={adj.id} value={adj.id}>
                        {adj.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedFormatDef && (
                <div style={{ marginTop: "1rem" }}>
                  <h4 style={{ marginBottom: "0.5rem" }}>
                    Assign Teams to Positions
                  </h4>
                  <div className="form-grid">
                    {Array.from(
                      { length: selectedFormatDef.teams_per_room },
                      (_, i) => i + 1,
                    ).map((pos) => (
                      <div key={pos} className="form-group">
                        <label className="form-label">Position {pos} *</label>
                        <select
                          value={selectedTeams[pos] || ""}
                          onChange={(e) =>
                            setSelectedTeams({
                              ...selectedTeams,
                              [pos]: e.target.value,
                            })
                          }
                          required
                          className="form-input"
                        >
                          <option value="" disabled>
                            -- Select Team --
                          </option>
                          {activeTeams.map((team) => (
                            <option
                              key={team.id}
                              value={team.id}
                              disabled={
                                Object.values(selectedTeams).includes(
                                  team.id.toString(),
                                ) && selectedTeams[pos] !== team.id.toString()
                              }
                            >
                              {team.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={
                  addRoomMutation.isPending || !selectedFormatDef || !chairId
                }
                className="btn btn-primary"
                style={{ marginTop: "1rem" }}
              >
                {addRoomMutation.isPending ? "Creating..." : "Save Room"}
              </button>
            </form>
          )}

          {roomsLoading ? (
            <p>Loading rooms...</p>
          ) : rooms?.length === 0 ? (
            <p
              className="text-muted"
              style={{ textAlign: "center", padding: "2rem 0" }}
            >
              No rooms have been built for this round yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {rooms?.map((room) => (
                <div
                  key={room.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      background: "var(--bg-dark)",
                      padding: "1rem",
                      fontWeight: "bold",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      Room #{room.id} {room.Format && `(${room.Format.code})`}
                    </span>
                    <span
                      className={`badge ${room.status === "completed" ? "badge-success" : "badge-secondary"}`}
                    >
                      {room.status}
                    </span>
                  </div>
                  <div style={{ padding: "1rem", flex: 1 }}>
                    <h5
                      style={{
                        margin: "0 0 0.5rem 0",
                        color: "var(--secondary)",
                      }}
                    >
                      Chair Adjudicator:
                    </h5>
                    <p style={{ margin: "0 0 1rem 0" }}>
                      {room.RoomAdjudicators?.find((a) => a.role === "chair")
                        ?.EventParticipant?.display_name || "None assigned"}
                    </p>
                    <h5
                      style={{
                        margin: "0 0 0.5rem 0",
                        color: "var(--secondary)",
                      }}
                    >
                      Matchup:
                    </h5>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "1.2rem",
                        color: "var(--text)",
                      }}
                    >
                      {room.RoomTeams?.sort(
                        (a, b) => a.position - b.position,
                      ).map((rt) => (
                        <li key={rt.id} style={{ marginBottom: "0.25rem" }}>
                          <strong>Pos {rt.position}:</strong> {rt.Team?.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      borderTop: "1px solid var(--border)",
                      background: "var(--bg)",
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    {(room.status === "pending" ||
                      room.status === "judging") && (
                      <button
                        onClick={() => setScoringRoom(room)}
                        className="btn btn-success btn-sm"
                        style={{ flex: 1 }}
                      >
                        Enter Scores
                      </button>
                    )}
                    {room.status === "completed" && (
                      <button
                        onClick={() => setFeedbackRoom(room)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        Give Feedback
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this room?"))
                          removeRoomMutation.mutate(room.id);
                      }}
                      className="btn btn-outline-danger btn-sm"
                      style={{ flex: 1 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
