import { useRouter } from "expo-router";

import { PasswordSignInScreen } from "@/features/auth/password-sign-in-screen";
import { isDevelopmentWebPreview } from "@/platform/auth/development-demo-auth";
import { publicEnvironment } from "@/platform/config/env";

export default function SignInRoute() {
  const router = useRouter();
  return (
    <PasswordSignInScreen
      demoMode={isDevelopmentWebPreview() || publicEnvironment.demoMode}
      onOtpChallenge={(challengeId) =>
        router.push({ pathname: "/(auth)/otp", params: { challengeId } })
      }
    />
  );
}
