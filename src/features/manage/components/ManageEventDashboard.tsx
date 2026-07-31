import React, { useState } from "react";
import { useParams, Link, Navigate } from "react-router";
import { useEventPrivileges } from "../../../hooks/useEventPrivileges";

import { ParticipantsTab } from "./tabs/ParticipantsTab";
import { TeamsTab } from "./tabs/TeamsTab";
import { RoundsTab } from "./tabs/RoundsTab";
import { StandingsTab } from "./tabs/StandingsTab";
import { FeedbackTab } from "./tabs/FeedbackTab";

type Tab = "standings" | "participants" | "teams" | "rounds" | "feedback";
const ALL_TABS: Tab[] = [
  "standings",
  "participants",
  "teams",
  "rounds",
  "feedback",
];

export const ManageEventDashboard: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const id = parseInt(eventId || "0", 10);

  const { isPrivileged, isLoading } = useEventPrivileges(id);
  const [activeTab, setActiveTab] = useState<Tab>("participants");

  if (isLoading) return <div className="container">Loading workspace...</div>;
  if (!isPrivileged) return <Navigate to="/organisations" replace />;

  return (
    <div className="container">
      <div style={{ marginBottom: "2rem" }}>
        <Link to="/manage/organisations" className="back-link">
          &larr; Back to Manage Directory
        </Link>
        <h1 className="page-title" style={{ border: "none", margin: 0 }}>
          Event Control Panel <span className="text-muted">(Event #{id})</span>
        </h1>
      </div>

      <div className="tab-nav">
        {ALL_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="card">
        {activeTab === "standings" && <StandingsTab eventId={id} />}
        {activeTab === "participants" && <ParticipantsTab eventId={id} />}
        {activeTab === "teams" && <TeamsTab eventId={id} />}
        {activeTab === "rounds" && <RoundsTab eventId={id} />}
        {activeTab === "feedback" && <FeedbackTab eventId={id} />}
      </div>
    </div>
  );
};
