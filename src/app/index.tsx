import { Redirect } from "expo-router";

import { useSession } from "@/platform/auth/session-provider";

export default function IndexRoute() {
  const { state } = useSession();
  if (state.status === "authenticated") {
    return <Redirect href={state.bootstrap.activeRole === "resident" ? "/(resident)/(tabs)" : "/(guard)/(tabs)"} />;
  }
  return <Redirect href="/(auth)/sign-in" />;
}
