import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useSession } from "@/platform/auth/session-provider";
import { queryClient } from "@/platform/query/query-client";
import { colors } from "@/platform/theme/tokens";

export function RoleSwitcher() {
  const { state, switchRole } = useSession();
  const router = useRouter();
  const [pendingRole, setPendingRole] = useState<"resident" | "guard" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (state.status !== "authenticated" || state.bootstrap.approvedRoles.length < 2) return null;

  const targetRole = state.bootstrap.activeRole === "resident" ? "guard" : "resident";
  const label = targetRole === "guard" ? "Switch to Guard" : "Switch to Resident";

  async function selectRole() {
    if (pendingRole) return;
    setError(null);
    setPendingRole(targetRole);
    try {
      const bootstrap = await switchRole(targetRole);
      queryClient.clear();
      router.replace(bootstrap.activeRole === "resident" ? "/(resident)" : "/(guard)");
    } catch {
      setError("We could not switch roles. Please try again.");
    } finally {
      setPendingRole(null);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled: pendingRole !== null }}
        disabled={pendingRole !== null}
        onPress={() => void selectRole()}
        style={({ pressed }) => [styles.button, (pressed || pendingRole) && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>{pendingRole ? "Switching roles…" : label}</Text>
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  button: { alignItems: "center", backgroundColor: colors.orange, borderRadius: 8, minHeight: 48, justifyContent: "center", paddingHorizontal: 16 },
  buttonPressed: { opacity: 0.65 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  error: { color: colors.danger, fontSize: 14 },
});
