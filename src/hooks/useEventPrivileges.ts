import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { fetchEventOrganisers } from "../features/events/api/participantApi";

export const useEventPrivileges = (eventId: number) => {
  const currentUser = useAuthStore((state) => state.user);

  const { data: organisers, isLoading } = useQuery({
    queryKey: ["organisers", eventId],
    queryFn: () => fetchEventOrganisers(eventId),
    enabled: !!eventId && !!currentUser,
  });

  const isGlobalAdmin = !!currentUser?.isAdmin;
  const isOrganiser =
    organisers?.some((org) => org.user_id === currentUser?.id) ?? false;

  return {
    isPrivileged: isGlobalAdmin || isOrganiser,
    isGlobalAdmin,
    isOrganiser,
    isLoading,
  };
};
