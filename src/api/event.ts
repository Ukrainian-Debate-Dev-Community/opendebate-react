import { apiClient } from "./axios";
import type { Event } from "../types/api";

export interface CreateEventPayload {
  name: string;
  start_date?: string;
  end_date?: string;
  is_ranked?: boolean;
}

export const fetchEventById = async (eventId: number): Promise<Event> => {
  const response = await apiClient.get(`/events/${eventId}`);
  return response.data.data;
};

export const fetchOrganisationEvents = async (
  organisationId: number,
): Promise<Event[]> => {
  const response = await apiClient.get(
    `/events/organisation/${organisationId}`,
  );
  return response.data.data;
};

export const createEvent = async (
  organisationId: number,
  payload: CreateEventPayload,
): Promise<Event> => {
  const response = await apiClient.post(`/events/${organisationId}`, payload);
  return response.data.data;
};

export const updateEvent = async (
  eventId: number,
  payload: any,
): Promise<Event> => {
  const response = await apiClient.put(`/events/${eventId}`, payload);
  return response.data.data;
};

export const deleteEvent = async (eventId: number): Promise<void> => {
  await apiClient.delete(`/events/${eventId}`);
};
