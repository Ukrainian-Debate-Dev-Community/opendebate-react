import { apiClient } from "./axios";
import type {
  CalculatedTeamStanding,
  CalculatedSpeakerStanding,
  EliminationPayload,
} from "../types/api";

export const fetchCalculatedTeamStandings = async (
  eventId: number,
): Promise<CalculatedTeamStanding[]> => {
  const response = await apiClient.get(
    `/events/${eventId}/standings/calculated/teams`,
  );
  return response.data.data;
};
export const fetchCalculatedSpeakerStandings = async (
  eventId: number,
): Promise<CalculatedSpeakerStanding[]> => {
  const response = await apiClient.get(
    `/events/${eventId}/standings/calculated/speakers`,
  );
  return response.data.data;
};
export const processEliminations = async (
  eventId: number,
  payload: EliminationPayload,
) => {
  const response = await apiClient.patch(
    `/events/${eventId}/eliminations`,
    payload,
  );
  return response.data;
};
