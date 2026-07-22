import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  filterResidentModules,
  groupResidentModules,
  type ResidentModuleDefinition,
} from "@/features/resident/catalog/resident-module-catalog";
import { ResidentFeedbackSheet } from "@/features/resident/shared/resident-feedback-sheet";
import {
  ResidentContentCard,
  ResidentSectionHeader,
  ResidentSocietyHeader,
} from "@/features/resident/shared/resident-ui";
import { RoleSwitcher } from "@/features/session/role-switcher";
import { useSession } from "@/platform/auth/session-provider";
import { residentTheme } from "@/platform/theme/tokens";

function showComingNext(title: string, message: string) {
  Alert.alert(title, message);
}

export function ResidentMoreScreen() {
  const router = useRouter();
  const { state } = useSession();
  const [selectedModule, setSelectedModule] = useState<ResidentModuleDefinition | null>(null);
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
    setSelectedModule(module);
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ResidentSocietyHeader
          unit="A-308"
          societyName={bootstrap?.society.name ?? "Your society"}
          onSearch={() => showComingNext("Search", "Resident search is coming in the next ReManage phase.")}
          onNotifications={() => showComingNext("Notifications", "Resident notifications are coming in the next ReManage phase.")}
          onProfile={() => showComingNext("Profile", "Resident profile settings are coming in the next ReManage phase.")}
        />

        <View style={styles.content}>
          <View style={styles.intro}>
            <Text accessibilityRole="header" style={styles.title}>All Resident services</Text>
            <Text style={styles.subtitle}>Everything available to your account, organised by what you need to do.</Text>
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

          <View style={styles.switcherSection}>
            <Text style={styles.switcherLabel}>Approved roles</Text>
            <RoleSwitcher />
          </View>
        </View>
      </ScrollView>

      <ResidentFeedbackSheet module={selectedModule} onDismiss={() => setSelectedModule(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.canvas },
  scrollContent: { paddingBottom: 34 },
  content: { paddingHorizontal: 16 },
  intro: { paddingTop: 22, paddingBottom: 2 },
  title: { color: residentTheme.ink, fontSize: 27, lineHeight: 34, fontWeight: "700" },
  subtitle: { color: residentTheme.muted, fontSize: 14, lineHeight: 21, marginTop: 6, maxWidth: 340 },
  cardList: { gap: 9 },
  emptyCard: { marginTop: 20, padding: 22, borderRadius: 18, backgroundColor: residentTheme.surface },
  emptyTitle: { color: residentTheme.ink, fontSize: 16, lineHeight: 22, fontWeight: "700" },
  emptyDetail: { color: residentTheme.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  switcherSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopColor: residentTheme.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  switcherLabel: { color: residentTheme.muted, fontSize: 12, lineHeight: 18, fontWeight: "700", textTransform: "uppercase", marginBottom: 9 },
});
