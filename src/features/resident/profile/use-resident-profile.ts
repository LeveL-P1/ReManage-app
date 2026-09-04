import { useQuery } from "@tanstack/react-query";

import { useSession } from "@/platform/auth/session-provider";

export function useResidentProfile() {
  const { runAuthenticated, state } = useSession();
  return useQuery({
    enabled: state.status === "authenticated" && Boolean(runAuthenticated),
    queryFn: () => runAuthenticated!((api, token) => api.getProfile(token)),
    queryKey: ["profile"],
    staleTime: 5 * 60 * 1000,
  });
}

export function useResidentUnit(): string {
  const { state } = useSession();
  const profileQuery = useResidentProfile();
  if (profileQuery.data?.flatNumber) return profileQuery.data.flatNumber;
  if (state.status === "authenticated") return state.bootstrap.user.name.split(" ")[0];
  return "—";
}

export function useResidentDisplayName(): string {
  const { state } = useSession();
  if (state.status === "authenticated") return state.bootstrap.user.name;
  return "Resident";
}

export function useResidentInitials(): string {
  const { state } = useSession();
  if (state.status !== "authenticated") return "R";
  return state.bootstrap.user.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "R";
}
