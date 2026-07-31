import { apiClient } from "./axios";
import type { SubmitScoresPayload, SubmitFeedbackPayload } from "../types/api";

export const submitRoomScores = async (
  roomId: number,
  payload: SubmitScoresPayload,
): Promise<void> => {
  await apiClient.post(`/rooms/${roomId}/scores`, payload);
};
export const submitRoomFeedback = async (
  roomId: number,
  payload: SubmitFeedbackPayload,
): Promise<void> => {
  await apiClient.post(`/rooms/${roomId}/feedback`, payload);
};
export const fetchEventFeedback = async (eventId: number) => {
  const response = await apiClient.get(`/events/${eventId}/feedback`);
  return response.data.data;
};
