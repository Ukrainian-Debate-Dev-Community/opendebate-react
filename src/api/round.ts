import { apiClient } from "./axios";
import type { Round, Room, CreateRoomPayload } from "../types/api";

export const fetchEventRounds = async (eventId: number): Promise<Round[]> => {
  const response = await apiClient.get(`/events/${eventId}/rounds`);
  return response.data.data;
};
export const createRound = async (
  eventId: number,
  payload: { name: string; sequence: number },
): Promise<Round> => {
  const response = await apiClient.post(`/events/${eventId}/rounds`, payload);
  return response.data.data;
};
export const fetchRoundRooms = async (roundId: number): Promise<Room[]> => {
  const response = await apiClient.get(`/rounds/${roundId}/rooms`);
  return response.data.data;
};
export const createRoom = async (
  roundId: number,
  payload: CreateRoomPayload,
): Promise<void> => {
  await apiClient.post(`/rounds/${roundId}/rooms`, payload);
};
export const deleteRoom = async (roomId: number): Promise<void> => {
  await apiClient.delete(`/rooms/${roomId}`);
};
