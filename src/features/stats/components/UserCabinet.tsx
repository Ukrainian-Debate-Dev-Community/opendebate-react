import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../api/axios";
import { AxiosError } from "axios";

interface UserStats {
  overview: {
    total_ballots_received: number;
    total_debates_ranked: number;
    average_speaker_score: string;
  };
  placements: {
    first_places: number;
    win_rate_percentage: string;
  };
}

export const UserCabinet: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const [participantId, setParticipantId] = useState("");
  const [claimToken, setClaimToken] = useState("");
  const [claimStatus, setClaimStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const res = await apiClient.get<{ data: UserStats }>(
        `/users/${user.id}/stats`,
      );
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimStatus(null);
    setIsClaiming(true);

    try {
      await apiClient.post(`/users/claim-participant/${participantId}`, {
        claim_token: claimToken,
      });
      setClaimStatus({
        type: "success",
        msg: "Identity claimed successfully!",
      });
      setParticipantId("");
      setClaimToken("");
      fetchStats();
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setClaimStatus({
          type: "error",
          msg: err.response.data.message || "Invalid claim token.",
        });
      } else {
        setClaimStatus({
          type: "error",
          msg: "An error occurred during the claim process.",
        });
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--primary)" }}>User Cabinet</h1>

      <div
        style={{
          background: "var(--bg-light)",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginTop: 0, color: "var(--secondary)" }}>
          Your Analytics
        </h2>
        {isLoadingStats ? (
          <p>Loading statistics...</p>
        ) : stats ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <p>
                <strong>Total Ballots:</strong>{" "}
                {stats.overview.total_ballots_received}
              </p>
              <p>
                <strong>Debates Ranked:</strong>{" "}
                {stats.overview.total_debates_ranked}
              </p>
            </div>
            <div>
              <p>
                <strong>Average Score:</strong>{" "}
                {stats.overview.average_speaker_score}
              </p>
              <p>
                <strong>Win Rate:</strong>{" "}
                {stats.placements.win_rate_percentage}%
              </p>
              <p>
                <strong>First Places:</strong> {stats.placements.first_places}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)" }}>
            No statistics available. Have you claimed your participant
            identities?
          </p>
        )}
      </div>

      {/* Identity Claim Section */}
      <div
        style={{
          background: "var(--bg-light)",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid var(--border)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "var(--secondary)" }}>
          Claim Guest Identity
        </h2>
        {claimStatus && (
          <div
            style={{
              padding: "0.5rem",
              marginBottom: "1rem",
              borderRadius: "4px",
              color: "var(--bg-light)",
              background:
                claimStatus.type === "success"
                  ? "var(--success)"
                  : "var(--danger)",
            }}
          >
            {claimStatus.msg}
          </div>
        )}
        <form
          onSubmit={handleClaim}
          style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
        >
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Participant ID
            </label>
            <input
              type="number"
              required
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid var(--border)",
              }}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              Claim Token
            </label>
            <input
              type="text"
              required
              value={claimToken}
              onChange={(e) => setClaimToken(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid var(--border)",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isClaiming}
            style={{
              padding: "0.6rem 1.5rem",
              background: "var(--primary)",
              color: "var(--bg-light)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {isClaiming ? "Claiming..." : "Claim"}
          </button>
        </form>
      </div>
    </div>
  );
};
