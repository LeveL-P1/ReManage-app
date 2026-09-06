import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/platform/auth/session-provider";
import type { MobileEvent } from "@/platform/api/mobile-api-client";

function formatEventDetail(event: MobileEvent): string {
  const date = new Date(event.startDate);
  const dateLabel = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const timeLabel = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const venue = event.venue ? `${event.venue} · ` : "";
  return `${venue}${dateLabel}, ${timeLabel} · ${event.rsvpCount} interested`;
}

export function useUpcomingCommunityEvent() {
  const { runAuthenticated, state } = useSession();
  return useQuery({
    enabled: state.status === "authenticated" && Boolean(runAuthenticated),
    queryKey: ["events-community-upcoming"],
    queryFn: () => runAuthenticated!((api, token) => api.listEvents(token)),
    staleTime: 2 * 60 * 1000,
    select: (data) => {
      const upcoming = (data.events ?? []).find((event) => event.status === "upcoming");
      if (!upcoming) return null;
      return { title: upcoming.title, detail: formatEventDetail(upcoming) };
    },
  });
}

export function useCommunityDuesSummary() {
  const { runAuthenticated, state } = useSession();
  return useQuery({
    enabled: state.status === "authenticated" && Boolean(runAuthenticated),
    queryKey: ["bills-community-dues"],
    queryFn: () => runAuthenticated!((api, token) => api.listBills(token)),
    staleTime: 2 * 60 * 1000,
    select: (data) => {
      if (data.totalPending === 0) {
        return { amount: "All dues cleared", detail: "No pending payments" };
      }
      return {
        amount: `₹${data.totalAmount.toLocaleString("en-IN")} due`,
        detail: `${data.totalPending} pending bill${data.totalPending > 1 ? "s" : ""}`,
      };
    },
  });
}
