import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "@/platform/auth/session-provider";
import { queryClient } from "@/platform/query/query-client";

export function useHomeGateVisitor() {
  const { runAuthenticated, state } = useSession();
  const societyId = state.status === "authenticated" ? state.bootstrap.society.id : "unknown";

  const visitorsQuery = useQuery({
    enabled: state.status === "authenticated" && Boolean(runAuthenticated),
    queryKey: ["resident", societyId, "visitors"],
    queryFn: () => runAuthenticated!((api, token) => api.residentVisitors(token)),
    staleTime: 30 * 1000,
  });

  const approve = useMutation({
    mutationFn: (visitorId: string) => runAuthenticated!((api, token) => api.residentApproveVisitor(token, visitorId)),
    onSuccess: () => invalidate(societyId),
  });
  const reject = useMutation({
    mutationFn: (visitorId: string) => runAuthenticated!((api, token) => api.residentRejectVisitor(token, visitorId)),
    onSuccess: () => invalidate(societyId),
  });

  const pendingVisitor = visitorsQuery.data?.visitors.find((visitor) => visitor.status === "pending") ?? null;

  return {
    pendingVisitor,
    isLoading: visitorsQuery.isLoading,
    approve,
    reject,
  };
}

function invalidate(societyId: string) {
  void queryClient.invalidateQueries({ queryKey: ["resident", societyId, "visitors"] });
}
