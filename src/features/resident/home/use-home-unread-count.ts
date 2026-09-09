import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/platform/auth/session-provider";

export function useHomeUnreadCount() {
  const { runAuthenticated, state } = useSession();
  return useQuery({
    enabled: state.status === "authenticated" && Boolean(runAuthenticated),
    queryKey: ["notifications", "unread-count"],
    queryFn: () => runAuthenticated!((api, token) => api.listNotifications(token)),
    staleTime: 30 * 1000,
    select: (data) => data.unreadCount ?? 0,
  });
}
