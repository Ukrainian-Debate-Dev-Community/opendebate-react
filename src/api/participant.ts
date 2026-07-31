import { apiClient } from "./axios";
import type {
  PaginatedParticipants,
  CreateParticipantPayload,
  CreatedParticipantResponse,
} from "../types/api";

export const fetchEventParticipants = async (
  eventId: number,
  page = 1,
  limit = 50,
): Promise<PaginatedParticipants> => {
  const response = await apiClient.get(
    `/events/${eventId}/participants?page=${page}&limit=${limit}`,
  );
  return response.data.data;
};
export const addParticipant = async (
  eventId: number,
  payload: CreateParticipantPayload,
): Promise<CreatedParticipantResponse> => {
  const response = await apiClient.post(
    `/events/${eventId}/participants`,
    payload,
  );
  return response.data.data;
};
export const removeParticipant = async (
  eventId: number,
  participantId: number,
): Promise<void> => {
  await apiClient.delete(`/events/${eventId}/participants/${participantId}`);
};
export const fetchEventOrganisers = async (
  eventId: number,
): Promise<{ user_id: number }[]> => {
  const response = await apiClient.get(`/events/${eventId}/organizers`);
  return response.data.data;
};

// user regitration
export const registerForEvent = async (
  eventId: number,
  payload: CreateParticipantPayload,
) => {
  const response = await apiClient.post(
    `/events/${eventId}/participants`,
    payload,
  );
  return response.data.data;
};
