import { apiClient } from "./axios";

export const updateUsername = async (username: string) => {
  const response = await apiClient.put("/users/username", { username });
  return response.data;
};

export const updatePassword = async (payload: any) => {
  const response = await apiClient.put("/users/password", payload);
  return response.data;
};

export const fetchUserHistory = async () => {
  const response = await apiClient.get("/users/history");
  return response.data.data;
};

export const fetchUserSchedule = async () => {
  const response = await apiClient.get("/users/schedule");
  return response.data.data;
};

export const claimIdentity = async (
  participantId: number,
  claim_token: string,
) => {
  const response = await apiClient.post(
    `/users/claim-participant/${participantId}`,
    { claim_token },
  );
  return response.data;
};

export const fetchUserStats = async (userId: number) => {
  const response = await apiClient.get(`/users/${userId}/stats`);
  return response.data.data;
};
