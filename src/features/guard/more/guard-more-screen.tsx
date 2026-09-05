import { StyleSheet, View, ScrollView } from "react-native";
import { Text, Avatar } from "heroui-native";
import { useSession } from "@/platform/auth/session-provider";
import { colors } from "@/features/resident/shared/heroui-ui";
import { RoleSwitcher } from "@/features/session/role-switcher";
import { SessionLogoutButton } from "@/features/session/session-logout-button";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "G";
}

export function GuardMoreScreen() {
  const { state } = useSession();
  const bootstrap = state.status === "authenticated" ? state.bootstrap : null;
  const name = bootstrap?.user.name ?? "Guard";
  const initials = getInitials(name);
  const society = bootstrap?.society.name ?? "";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <Avatar size="xl" fallback={initials} style={styles.avatar} />
          <Text style={styles.name}>{name}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Security Guard</Text>
          </View>
          {society ? <Text style={styles.society}>{society}</Text> : null}
        </View>

        <View style={styles.actions}>
          <RoleSwitcher />
          <SessionLogoutButton />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, gap: 24 },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: { marginBottom: 4 },
  name: { fontSize: 22, fontWeight: "700", color: colors.text, textAlign: "center" },
  badge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, fontWeight: "600", color: colors.primary },
  society: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
  actions: { gap: 12 },
});
