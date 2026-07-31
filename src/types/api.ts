export interface AuthUser {
  id: number;
  username: string;
  isAdmin?: boolean;
}

export interface OrganisationOwner {
  id: number;
  username: string;
}

export interface Organisation {
  id: number;
  name: string;
  type: "academic" | "personal";
  status: "active" | "inactive";
  online: boolean;
  link: string | null;
  Owners?: OrganisationOwner[];
  owner_ids?: number[];
}

export interface Event {
  id: number;
  organisation_id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  status: "scheduled" | "in_progress" | "completed";
  is_ranked: boolean;
}

export interface Format {
  id: number;
  name: string;
  code: string;
  teams_per_room: number;
  speakers_per_team: number;
  score_min: number;
  score_max: number;
}

export interface Round {
  id: number;
  name: string;
  sequence: number;
  status: "draft" | "in_progress" | "completed";
}

export interface EventParticipant {
  id: number;
  event_id: number;
  user_id: number | null;
  display_name: string;
  role: "speaker" | "adjudicator";
  is_eliminated: boolean;
}

export interface PaginatedParticipants {
  total_participants: number;
  total_pages: number;
  current_page: number;
  participants: EventParticipant[];
}

export interface TeamMember {
  participant_id: number;
  name: string;
  user_id: number | null;
}

export interface EventTeam {
  id: number;
  name: string;
  is_temporary: boolean;
  is_eliminated: boolean;
  speakers: TeamMember[];
}

export interface ProposedTeam {
  name: string;
  is_temporary: boolean;
  participant_ids: number[];
  participants: { id: number; display_name: string }[];
}

export interface RoomAdjudicator {
  id: number;
  role: "chair" | "panelist" | "trainee";
  EventParticipant: {
    id: number;
    display_name: string;
    user_id: number | null;
  };
}

export interface RoomSpeaker {
  id: number;
  rank: number | null;
  EventParticipant: {
    id: number;
    display_name: string;
  };
}

export interface RoomTeam {
  id: number;
  position: number;
  rank: number | null;
  Team: {
    id: number;
    name: string;
    is_temporary: boolean;
  };
  RoomSpeakers: RoomSpeaker[];
}

export interface Room {
  id: number;
  round_id: number;
  format_id: number;
  motion_id: number | null;
  status: "pending" | "judging" | "completed";
  Format: Format;
  RoomAdjudicators: RoomAdjudicator[];
  RoomTeams: RoomTeam[];
}

export interface CalculatedTeamStanding {
  id: number;
  name: string;
  total_points: number;
}

export interface CalculatedSpeakerStanding {
  id: number;
  name: string;
  total_points: number;
}

export interface CreateOrgPayload {
  name: string;
  type: "academic" | "personal";
  online: boolean;
  link?: string;
  owner_id: number;
}

export interface UpdateOrgPayload {
  name?: string;
  type?: "academic" | "personal";
  online?: boolean;
  link?: string;
  status?: "active" | "inactive";
}

export interface CreateParticipantPayload {
  display_name: string;
  role: "speaker" | "adjudicator";
  user_id?: number;
}

export interface CreatedParticipantResponse extends EventParticipant {
  raw_claim_token?: string;
}

export interface CreateTeamPayload {
  name: string;
  participant_ids: number[];
  is_temporary?: boolean;
}

export interface CreateRoomPayload {
  format_id: number;
  motion_id?: number;
  teams: { team_id: number; position: number }[];
  adjudicators: {
    participant_id: number;
    role: "chair" | "panelist" | "trainee";
  }[];
}

export interface SubmitScoresPayload {
  teamRankings: { room_team_id: number; rank: number }[];
  speakerScores: { room_speaker_id: number; score: number }[];
}

export interface SubmitFeedbackPayload {
  adjudicator_id: number;
  score: number;
  comment?: string;
  issuer_team_id?: number;
  issuer_participant_id?: number;
}

export interface EliminationPayload {
  status: boolean;
  team_ids?: number[];
  participant_ids?: number[];
}
