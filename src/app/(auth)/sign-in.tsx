import { useRouter } from "expo-router";

import { PasswordSignInScreen } from "@/features/auth/password-sign-in-screen";

export default function SignInRoute() {
  const router = useRouter();
  return (
    <PasswordSignInScreen
      onOtpChallenge={(challengeId) =>
        router.push({ pathname: "/(auth)/otp", params: { challengeId } })
      }
    />
  );
}
