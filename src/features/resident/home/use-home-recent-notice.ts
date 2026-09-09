import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "@/platform/auth/session-provider";

export function useHomeRecentNotice() {
  const { runAuthenticated, state } = useSession();
  return useQuery({
    enabled: state.status === "authenticated" && Boolean(runAuthenticated),
    queryKey: ["notices"],
    queryFn: () => runAuthenticated!((api, token) => api.listNotices(token)),
    staleTime: 60 * 1000,
    select: (data) => {
      const notice = data.notices?.[0];
      if (!notice) return null;
      return {
        id: notice.id,
        title: notice.title,
        detail: `${notice.postedBy} · ${formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}`,
      };
    },
  });
}
