import { useLocalSearchParams, useRouter } from "expo-router";

import { OtpVerifyScreen } from "@/features/auth/otp-verify-screen";

export default function OtpRoute() {
  const router = useRouter();
  const { challengeId } = useLocalSearchParams<{ challengeId?: string }>();

  return <OtpVerifyScreen challengeId={challengeId ?? ""} onBack={() => router.replace("/(auth)/sign-in")} />;
}
