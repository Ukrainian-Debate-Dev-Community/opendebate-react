import React, { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/authStore";
import { apiClient } from "../../../api/axios";
import { extractErrorMessage } from "../../../utils/errorHandler";

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
  const queryClient = useQueryClient();

  const [participantId, setParticipantId] = useState("");
  const [claimToken, setClaimToken] = useState("");
  const [claimStatus, setClaimStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Replaced manual useEffect fetching with useQuery
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["userStats", user?.id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: UserStats }>(
        `/users/${user?.id}/stats`,
      );
      return res.data.data;
    },
    enabled: !!user?.id,
  });

  // Replaced manual loading state with useMutation
  const claimMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/users/claim-participant/${participantId}`, {
        claim_token: claimToken,
      }),
    onSuccess: () => {
      setClaimStatus({
        type: "success",
        msg: "Identity claimed successfully!",
      });
      setParticipantId("");
      setClaimToken("");
      // Automatically refresh stats after a successful claim
      queryClient.invalidateQueries({ queryKey: ["userStats", user?.id] });
    },
    onError: (error) => {
      setClaimStatus({
        type: "error",
        msg: extractErrorMessage(error, "Invalid claim token."),
      });
    },
  });

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimStatus(null);
    claimMutation.mutate();
  };

  return (
    <div className="container-sm">
      <Link to="/" className="back-link">
        &larr; Back to Dashboard
      </Link>
      <h1 className="page-title">User Cabinet</h1>

      <div className="card">
        <h2 style={{ marginTop: 0, color: "var(--secondary)" }}>
          Your Analytics
        </h2>
        {isLoadingStats ? (
          <p>Loading statistics...</p>
        ) : stats ? (
          <div className="form-grid">
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
          <p className="text-muted">
            No statistics available. Have you claimed your participant
            identities?
          </p>
        )}
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, color: "var(--secondary)" }}>
          Claim Guest Identity
        </h2>
        {claimStatus && (
          <div
            style={{
              padding: "0.5rem",
              marginBottom: "1rem",
              borderRadius: "4px",
              color: "white",
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
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label className="form-label">Participant ID</label>
            <input
              type="number"
              required
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              className="form-input"
            />
          </div>
          <div style={{ flex: 2, minWidth: "200px" }}>
            <label className="form-label">Claim Token</label>
            <input
              type="text"
              required
              value={claimToken}
              onChange={(e) => setClaimToken(e.target.value)}
              className="form-input"
            />
          </div>
          <button
            type="submit"
            disabled={claimMutation.isPending}
            className="btn btn-primary"
          >
            {claimMutation.isPending ? "Claiming..." : "Claim"}
          </button>
        </form>
      </div>
    </div>
  );
};
