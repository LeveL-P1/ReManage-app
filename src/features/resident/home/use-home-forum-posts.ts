import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "@/platform/auth/session-provider";
import type { MobileForumThread } from "@/platform/api/mobile-api-client";

const CATEGORY_LABEL: Record<string, string> = {
  general: "General",
  maintenance: "Maintenance",
  security: "Security",
  events: "Events",
  "buy-sell": "Buy & Sell",
  "lost-found": "Lost & Found",
};

function threadToPost(thread: MobileForumThread) {
  const categoryLabel = CATEGORY_LABEL[thread.category] ?? thread.category;
  const initials = categoryLabel.slice(0, 2).toUpperCase();
  return {
    id: thread.id,
    author: categoryLabel,
    initials,
    unit: "Community Forum",
    when: formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true }),
    body: thread.title,
    views: thread.views.toString(),
    reactions: thread.replyCount.toString(),
    comments: [] as { id: string; author: string; initials: string; when: string; body: string; likes: string; replies?: { id: string; author: string; initials: string; when: string; body: string; likes: string }[] }[],
  };
}

export function useHomeForumPosts() {
  const { runAuthenticated, state } = useSession();
  return useQuery({
    enabled: state.status === "authenticated" && Boolean(runAuthenticated),
    queryKey: ["forum-threads-home"],
    queryFn: () => runAuthenticated!((api, token) => api.listForumThreads(token)),
    staleTime: 2 * 60 * 1000,
    select: (data) => (data.threads ?? []).slice(0, 3).map(threadToPost),
  });
}
