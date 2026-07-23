import { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  filterResidentModules,
  groupResidentModules,
  type ResidentModuleDefinition,
} from "@/features/resident/catalog/resident-module-catalog";
import {
  getResidentMoreFeature,
} from "@/features/resident/more/resident-more-feature-catalog";
import {
  ResidentContentCard,
  ResidentSectionHeader,
  ResidentSocietyHeader,
} from "@/features/resident/shared/resident-ui";
import { RoleSwitcher } from "@/features/session/role-switcher";
import { useSession } from "@/platform/auth/session-provider";
import { residentTheme } from "@/platform/theme/tokens";

export function ResidentMoreScreen() {
  const router = useRouter();
  const { state } = useSession();
  const bootstrap = state.status === "authenticated" ? state.bootstrap : null;
  const groups = useMemo(
    () => groupResidentModules(filterResidentModules(bootstrap?.permissions ?? [])),
    [bootstrap?.permissions],
  );

  function openModule(module: ResidentModuleDefinition) {
    if (module.mobileRoute) {
      router.push(module.mobileRoute);
      return;
    }

    const feature = getResidentMoreFeature(module.id);
    if (feature) router.push(feature.route);
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ResidentSocietyHeader
          unit="A-308"
          societyName={bootstrap?.society.name ?? "Your society"}
          onSearch={() => router.push("/(resident)/home/search")}
          onNotifications={() => router.push("/(resident)/home/notifications")}
          onProfile={() => router.push("/(resident)/home/profile")}
        />

        <View style={styles.content}>
          <View style={styles.intro}>
            <Text accessibilityRole="header" style={styles.title}>More</Text>
            <Text style={styles.subtitle}>Your home, account, and every available society service.</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.profileMark}><Text style={styles.profileInitial}>D</Text></View>
            <View style={styles.profileCopy}>
              <Text style={styles.profileTitle}>Your home in ReManage</Text>
              <Text style={styles.profileDetail}>A-308 · Resident account</Text>
            </View>
            <Ionicons color={residentTheme.icon} name="chevron-forward" size={21} />
          </View>

          {groups.length ? groups.map((group) => (
            <View key={group.id}>
              <ResidentSectionHeader title={group.label} />
              <View style={styles.cardList}>
                {group.modules.map((module) => (
                  <ResidentContentCard
                    description={module.description}
                    icon={module.icon}
                    key={module.id}
                    onPress={() => openModule(module)}
                    title={module.label}
                  />
                ))}
              </View>
            </View>
          )) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Resident services are available for this account.</Text>
              <Text style={styles.emptyDetail}>Contact your society administrator if you believe access is missing.</Text>
            </View>
          )}

          <View style={styles.accountSection}>
            <ResidentSectionHeader title="Account & access" />
            <View style={styles.accountCard}>
              <Text style={styles.accountCopy}>Switch only between roles that are approved for this account.</Text>
              <RoleSwitcher />
            </View>
          </View>

          <View style={styles.supportCard}>
            <View style={styles.supportIcon}><Ionicons color={residentTheme.icon} name="headset-outline" size={22} /></View>
            <View style={styles.supportCopy}>
              <Text style={styles.supportTitle}>Need help?</Text>
              <Text style={styles.supportDetail}>Use Helpdesk for society requests and service follow-ups.</Text>
            </View>
          </View>

          <Text style={styles.footer}>ReManage keeps your community essentials in one place.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.canvas },
  scrollContent: { paddingBottom: 34 },
  content: { paddingHorizontal: 16 },
  intro: { paddingTop: 22, paddingBottom: 12 },
  title: { color: residentTheme.ink, fontSize: 28, lineHeight: 34, fontWeight: "700" },
  subtitle: { color: residentTheme.muted, fontSize: 14, lineHeight: 21, marginTop: 5, maxWidth: 340 },
  profileCard: { alignItems: "center", backgroundColor: residentTheme.surface, borderColor: residentTheme.border, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, elevation: 1, flexDirection: "row", gap: 12, padding: 16 },
  profileMark: { alignItems: "center", backgroundColor: residentTheme.icon, borderRadius: 25, height: 50, justifyContent: "center", width: 50 },
  profileInitial: { color: residentTheme.surface, fontSize: 22, fontWeight: "700" },
  profileCopy: { flex: 1 },
  profileTitle: { color: residentTheme.ink, fontSize: 17, fontWeight: "700", lineHeight: 22 },
  profileDetail: { color: residentTheme.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  cardList: { gap: 9 },
  emptyCard: { backgroundColor: residentTheme.surface, borderRadius: 18, marginTop: 20, padding: 22 },
  emptyTitle: { color: residentTheme.ink, fontSize: 16, fontWeight: "700", lineHeight: 22 },
  emptyDetail: { color: residentTheme.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  accountSection: { marginTop: 2 },
  accountCard: { backgroundColor: residentTheme.surface, borderColor: residentTheme.border, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  accountCopy: { color: residentTheme.muted, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  supportCard: { alignItems: "center", backgroundColor: `${residentTheme.icon}0E`, borderRadius: 18, flexDirection: "row", gap: 12, marginTop: 22, padding: 16 },
  supportIcon: { alignItems: "center", backgroundColor: residentTheme.surface, borderRadius: 15, height: 46, justifyContent: "center", width: 46 },
  supportCopy: { flex: 1 },
  supportTitle: { color: residentTheme.ink, fontSize: 16, fontWeight: "700", lineHeight: 21 },
  supportDetail: { color: residentTheme.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  footer: { color: residentTheme.muted, fontSize: 12, lineHeight: 18, marginHorizontal: 18, marginTop: 26, textAlign: "center" },
});
