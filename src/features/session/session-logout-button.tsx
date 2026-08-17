import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { useSession } from "@/platform/auth/session-provider";
import { queryClient } from "@/platform/query/query-client";
import { colors } from "@/platform/theme/tokens";

export function SessionLogoutButton() {
  const { logout } = useSession();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) return;
    setPending(true);
    try {
      await logout();
      queryClient.clear();
      router.replace("/(auth)/sign-in");
    } finally {
      setPending(false);
    }
  }

  return (
    <Pressable
      accessibilityLabel="Log out"
      accessibilityRole="button"
      accessibilityState={{ disabled: pending }}
      disabled={pending}
      onPress={() => void handleLogout()}
      style={({ pressed }) => [styles.button, (pressed || pending) && styles.pressed]}
    >
      <Text style={styles.text}>{pending ? "Logging out..." : "Log out"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: "center", borderColor: colors.danger, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, minHeight: 48, justifyContent: "center", paddingHorizontal: 16 },
  pressed: { opacity: 0.65 },
  text: { color: colors.danger, fontSize: 16, fontWeight: "700" },
});
