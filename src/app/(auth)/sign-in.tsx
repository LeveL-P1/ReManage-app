import { useRouter } from "expo-router";

import { PasswordSignInScreen } from "@/features/auth/password-sign-in-screen";
import { isDevelopmentWebPreview } from "@/platform/auth/development-demo-auth";

export default function SignInRoute() {
  const router = useRouter();
  return (
    <PasswordSignInScreen
      demoMode={isDevelopmentWebPreview()}
      onOtpChallenge={(challengeId) =>
        router.push({ pathname: "/(auth)/otp", params: { challengeId } })
      }
    />
  );
}
