import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  filterResidentModules,
  type ResidentModuleDefinition,
  type ResidentModuleId,
} from "@/features/resident/catalog/resident-module-catalog";
import { ResidentFeedbackSheet } from "@/features/resident/shared/resident-feedback-sheet";
import {
  ResidentActionGrid,
  ResidentActionTile,
  ResidentContentCard,
  ResidentSectionHeader,
  ResidentSocietyHeader,
  ResidentStatTile,
} from "@/features/resident/shared/resident-ui";
import { useSession } from "@/platform/auth/session-provider";
import { residentTheme } from "@/platform/theme/tokens";
import { residentCommunityFixture, type ResidentCommunityViewModel } from "./resident-community-fixtures";

const communityActionIds: readonly ResidentModuleId[] = [
  "helpdesk",
  "announcements",
  "forum",
  "events",
  "amenities",
  "directory",
  "staff",
  "marketplace",
  "parking",
];

const governanceHighlightIds: readonly ResidentModuleId[] = ["meetings", "polls", "documents"];

function showComingNext(title: string, message: string) {
  Alert.alert(title, message);
}

export function ResidentCommunityScreen({
  viewModel = residentCommunityFixture,
}: {
  viewModel?: ResidentCommunityViewModel;
}) {
  const router = useRouter();
  const { state } = useSession();
  const [selectedModule, setSelectedModule] = useState<ResidentModuleDefinition | null>(null);
  const bootstrap = state.status === "authenticated" ? state.bootstrap : null;
  const visibleModules = useMemo(
    () => filterResidentModules(bootstrap?.permissions ?? []),
    [bootstrap?.permissions],
  );
  const actions = useMemo(
    () => communityActionIds.flatMap((id) => visibleModules.filter((module) => module.id === id)),
    [visibleModules],
  );
  const governanceHighlights = useMemo(
    () => governanceHighlightIds.flatMap((id) => visibleModules.filter((module) => module.id === id)),
    [visibleModules],
  );
  const helpdesk = visibleModules.find(({ id }) => id === "helpdesk") ?? null;
  const sos = visibleModules.find(({ id }) => id === "sos") ?? null;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ResidentSocietyHeader
          unit={viewModel.unit}
          societyName={bootstrap?.society.name ?? "Your society"}
          onSearch={() => showComingNext("Search", "Resident search is coming in the next ReManage phase.")}
          onNotifications={() => showComingNext("Notifications", "Resident notifications are coming in the next ReManage phase.")}
          onProfile={() => showComingNext("Profile", "Resident profile settings are coming in the next ReManage phase.")}
        />

        <View style={styles.content}>
          <View style={styles.overview}>
            <View>
              <Text style={styles.eyebrow}>YOUR COMMUNITY</Text>
              <Text style={styles.overviewTitle}>Connected living,<Text style={styles.accent}> made simpler.</Text></Text>
            </View>
            <View style={styles.stats}>
              {viewModel.stats.map((stat) => <ResidentStatTile compact detail="Society-wide" key={stat.id} {...stat} />)}
            </View>
          </View>

          <ResidentSectionHeader title="Community Actions" />
          <ResidentActionGrid>
            {actions.map((module) => (
              <ResidentActionTile
                columns={5}
                icon={module.icon}
                key={module.id}
                label={module.label}
                onPress={() => setSelectedModule(module)}
              />
            ))}
            <ResidentActionTile
              columns={5}
              icon="more"
              label="More"
              onPress={() => router.push("/(resident)/(tabs)/more")}
            />
          </ResidentActionGrid>

          <ResidentSectionHeader title="Happening nearby" />
          <View style={styles.cardList}>
            <ResidentContentCard
              accent={residentTheme.highlight}
              description={viewModel.event.detail}
              icon="event"
              onPress={() => setSelectedModule(actions.find(({ id }) => id === "events") ?? null)}
              title={viewModel.event.title}
            />
            <ResidentContentCard
              accent={residentTheme.accent}
              description={viewModel.hostPrompt.detail}
              icon="forum"
              onPress={() => setSelectedModule(actions.find(({ id }) => id === "forum") ?? null)}
              title={viewModel.hostPrompt.title}
            />
          </View>

          <ResidentSectionHeader title="Find your circle" />
          <View style={styles.circleCard}>
            <View style={styles.avatarStack}>
              <View style={[styles.avatar, styles.avatarOne]}><Text style={styles.avatarText}>RS</Text></View>
              <View style={[styles.avatar, styles.avatarTwo]}><Text style={styles.avatarText}>AK</Text></View>
              <View style={[styles.avatar, styles.avatarThree]}><Text style={styles.avatarText}>+19</Text></View>
            </View>
            <View style={styles.circleCopy}>
              <Text style={styles.circleTitle}>Meet neighbours with shared interests</Text>
              <Text style={styles.circleDetail}>Explore residents, pets, hometowns, and daily help.</Text>
            </View>
          </View>

          <ResidentSectionHeader title="Safety & support" />
          <View style={styles.cardList}>
            {sos ? (
              <ResidentContentCard
                accent="#C62828"
                description={viewModel.safety.detail}
                icon="sos"
                onPress={() => setSelectedModule(sos)}
                title={viewModel.safety.title}
              />
            ) : null}
            {helpdesk ? (
              <ResidentContentCard
                accent={residentTheme.icon}
                description="For non-emergency safety and security support"
                icon="helpdesk"
                onPress={() => setSelectedModule(helpdesk)}
                title="Message society helpdesk"
              />
            ) : null}
          </View>

          <ResidentSectionHeader title="Governance highlights" />
          <View style={styles.cardList}>
            {governanceHighlights.map((module) => (
              <ResidentContentCard
                accent={residentTheme.icon}
                description={module.description}
                icon={module.icon}
                key={module.id}
                onPress={() => setSelectedModule(module)}
                title={module.label}
              />
            ))}
            <ResidentContentCard
              accent={residentTheme.accent}
              description={viewModel.dues.detail}
              icon="bill"
              onPress={() => router.push("/(resident)/(tabs)/bills")}
              title={viewModel.dues.amount}
            />
          </View>

          <View style={styles.tenureCard}>
            <Text style={styles.tenureHeart}>♥</Text>
            <Text style={styles.tenure}>{viewModel.tenure}</Text>
          </View>
        </View>
      </ScrollView>

      <ResidentFeedbackSheet module={selectedModule} onDismiss={() => setSelectedModule(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.canvas },
  scrollContent: { paddingBottom: 28 },
  content: { paddingHorizontal: 16 },
  overview: { marginTop: 14, padding: 18, borderRadius: 22, backgroundColor: residentTheme.surface },
  eyebrow: { color: residentTheme.accent, fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 1 },
  overviewTitle: { color: residentTheme.ink, fontSize: 25, lineHeight: 31, fontWeight: "700", marginTop: 5, maxWidth: 320 },
  accent: { color: residentTheme.accent },
  stats: { flexDirection: "row", gap: 8, marginTop: 17 },
  cardList: { gap: 10 },
  circleCard: {
    backgroundColor: residentTheme.surface,
    borderRadius: 18,
    padding: 17,
    borderColor: residentTheme.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatarStack: { flexDirection: "row", height: 40 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: residentTheme.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarOne: { backgroundColor: residentTheme.icon },
  avatarTwo: { backgroundColor: residentTheme.accent, marginLeft: -8 },
  avatarThree: { backgroundColor: residentTheme.highlight, marginLeft: -8 },
  avatarText: { color: residentTheme.surface, fontSize: 11, fontWeight: "700" },
  circleCopy: { marginTop: 12 },
  circleTitle: { color: residentTheme.ink, fontSize: 16, lineHeight: 21, fontWeight: "700" },
  circleDetail: { color: residentTheme.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  tenureCard: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 26, paddingHorizontal: 4 },
  tenureHeart: { color: residentTheme.accent, fontSize: 18 },
  tenure: { color: residentTheme.ink, fontSize: 16, lineHeight: 22, fontWeight: "600" },
});
