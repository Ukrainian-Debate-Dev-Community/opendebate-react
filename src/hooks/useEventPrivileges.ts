import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api/axios";

const checkAccess = async (eventId: number) => {
  const response = await apiClient.get(`/events/${eventId}/access`);
  return response.data.data.isPrivileged;
};

export const useEventPrivileges = (eventId: number) => {
  const { data: isPrivileged, isLoading } = useQuery({
    queryKey: ["eventAccess", eventId],
    queryFn: () => checkAccess(eventId),
    retry: false,
  });

  return {
    isPrivileged: !!isPrivileged,
    isLoading,
  };
};
