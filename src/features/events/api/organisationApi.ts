import { apiClient } from "../../../api/axios";
import type {
  Organisation,
  CreateOrgPayload,
  UpdateOrgPayload,
} from "../../../types/api";

export const fetchOrganisations = async (): Promise<Organisation[]> => {
  const response = await apiClient.get("/organisations");
  return response.data.data;
};
export const createOrganisation = async (
  payload: CreateOrgPayload,
): Promise<Organisation> => {
  const response = await apiClient.post("/organisations", payload);
  return response.data.data;
};
export const deleteOrganisation = async (id: number): Promise<void> => {
  await apiClient.delete(`/organisations/${id}`);
};
export const fetchOrganisationById = async (
  id: number,
): Promise<Organisation> => {
  const response = await apiClient.get(`/organisations/${id}`);
  return response.data.data;
};
export const updateOrganisation = async (
  id: number,
  payload: UpdateOrgPayload,
): Promise<Organisation> => {
  const response = await apiClient.put(`/organisations/${id}`, payload);
  return response.data.data;
};
export const addOrganisationOwner = async (
  orgId: number,
  targetUserId: number,
): Promise<void> => {
  await apiClient.post(`/organisations/${orgId}/owners`, { targetUserId });
};
export const removeOrganisationOwner = async (
  orgId: number,
  ownerId: number,
): Promise<void> => {
  await apiClient.delete(`/organisations/${orgId}/owners/${ownerId}`);
};
