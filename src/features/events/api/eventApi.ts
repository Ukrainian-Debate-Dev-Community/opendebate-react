import { apiClient } from "../../../api/axios";
import type { TournamentEvent } from "../../../types/api";

export const fetchOrganisationEvents = async (
  organisationId: number,
): Promise<TournamentEvent[]> => {
  const response = await apiClient.get(
    `/events/organisation/${organisationId}`,
  );
  return response.data.data;
};
