import React, { useState } from "react";
import { useParams, Link } from "react-router";
import { useEventPrivileges } from "../../../hooks/useEventPrivileges";

import { ParticipantsTab } from "./tabs/ParticipantsTab";
import { TeamsTab } from "./tabs/TeamsTab";
import { RoundsTab } from "./tabs/RoundsTab";
import { StandingsTab } from "./tabs/StandingsTab";
import { FeedbackTab } from "./tabs/FeedbackTab";

type Tab = "standings" | "participants" | "teams" | "rounds" | "feedback";
const CORE_TABS: Tab[] = ["standings", "participants", "teams", "rounds"];

export const EventDashboard: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const id = parseInt(eventId || "0", 10);
  const { isPrivileged } = useEventPrivileges(id);
  const [activeTab, setActiveTab] = useState<Tab>("participants");

  return (
    <div className="container">
      <div style={{ marginBottom: "2rem" }}>
        <Link to="/organisations" className="back-link">
          &larr; Back to Directory
        </Link>
        <h1 className="page-title" style={{ border: "none", margin: 0 }}>
          Event Control Panel <span className="text-muted">(Event #{id})</span>
        </h1>
      </div>

      <div className="tab-nav">
        {CORE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
        {isPrivileged && (
          <button
            className={`tab-btn ${activeTab === "feedback" ? "active" : ""}`}
            onClick={() => setActiveTab("feedback")}
          >
            Feedback
          </button>
        )}
      </div>

      <div className="card">
        {activeTab === "standings" && (
          <StandingsTab eventId={id} isPrivileged={isPrivileged} />
        )}
        {activeTab === "participants" && (
          <ParticipantsTab eventId={id} isPrivileged={isPrivileged} />
        )}
        {activeTab === "teams" && (
          <TeamsTab eventId={id} isPrivileged={isPrivileged} />
        )}
        {activeTab === "rounds" && (
          <RoundsTab eventId={id} isPrivileged={isPrivileged} />
        )}
        {activeTab === "feedback" && (
          <FeedbackTab eventId={id} isPrivileged={isPrivileged} />
        )}
      </div>
    </div>
  );
};
