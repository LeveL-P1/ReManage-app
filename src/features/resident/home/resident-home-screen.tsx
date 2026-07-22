import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  filterResidentModules,
  type ResidentModuleDefinition,
  type ResidentModuleId,
} from "@/features/resident/catalog/resident-module-catalog";
import { useSession } from "@/platform/auth/session-provider";
import { residentTheme } from "@/platform/theme/tokens";
import { ResidentFeedbackSheet } from "@/features/resident/shared/resident-feedback-sheet";
import {
  ResidentActionGrid,
  ResidentActionTile,
  ResidentContentCard,
  ResidentSectionHeader,
  ResidentSocietyHeader,
  ResidentStatTile,
} from "@/features/resident/shared/resident-ui";
import { residentHomeFixture, type ResidentHomeViewModel } from "./resident-home-fixtures";

const quickActionIds: readonly ResidentModuleId[] = ["my-bills", "my-visitors", "helpdesk", "sos"];

const quickActionLabels = {
  "my-bills": "Pay bill",
  "my-visitors": "Approve visitor",
  helpdesk: "Raise complaint",
  sos: "Raise SOS",
} as const;

function showComingNext(title: string, message: string) {
  Alert.alert(title, message);
}

export function ResidentHomeScreen({
  viewModel = residentHomeFixture,
}: {
  viewModel?: ResidentHomeViewModel;
}) {
  const router = useRouter();
  const { state } = useSession();
  const [selectedModule, setSelectedModule] = useState<ResidentModuleDefinition | null>(null);
  const bootstrap = state.status === "authenticated" ? state.bootstrap : null;

  const quickActions = useMemo(
    () => filterResidentModules(bootstrap?.permissions ?? []).filter(({ id }) => quickActionIds.includes(id)),
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
          unit={viewModel.unit}
          societyName={bootstrap?.society.name ?? "Your society"}
          onSearch={() => showComingNext("Search", "Resident search is coming in the next ReManage phase.")}
          onNotifications={() => showComingNext("Notifications", "Resident notifications are coming in the next ReManage phase.")}
          onProfile={() => showComingNext("Profile", "Resident profile settings are coming in the next ReManage phase.")}
        />

        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.heroStatusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.heroStatus}>{viewModel.heroStatus}</Text>
            </View>
            <Text style={styles.heroTitle}>{viewModel.heroTitle}</Text>
            <Text style={styles.heroMessage}>{viewModel.heroMessage}</Text>
            <View style={styles.heroAccent} />
          </View>

          <ResidentSectionHeader title="Quick Actions" />
          <ResidentActionGrid>
            {quickActions.map((module) => (
              <ResidentActionTile
                columns={4}
                icon={module.icon}
                key={module.id}
                label={quickActionLabels[module.id as keyof typeof quickActionLabels]}
                onPress={() => openModule(module)}
              />
            ))}
          </ResidentActionGrid>

          <ResidentSectionHeader title="Today" />
          <ScrollView
            contentContainerStyle={styles.stats}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {viewModel.stats.map((stat) => <ResidentStatTile key={stat.id} {...stat} />)}
          </ScrollView>

          <View style={styles.cardGap}>
            <ResidentContentCard
              accent={residentTheme.accent}
              description={viewModel.dues.dueLabel}
              icon="bill"
              onPress={() => router.push("/(resident)/(tabs)/bills")}
              title={`${viewModel.dues.amount} outstanding`}
            />
          </View>

          <ResidentSectionHeader title="Recent activity" />
          <View style={styles.cardList}>
            {viewModel.activity.length ? viewModel.activity.map((activity) => (
              <ResidentContentCard
                accent={residentTheme.icon}
                description={activity.detail}
                icon={activity.icon}
                key={activity.id}
                title={activity.title}
              />
            )) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No recent activity yet.</Text>
              </View>
            )}
          </View>

          <ResidentSectionHeader
            actionLabel="View all"
            onAction={() => router.push("/(resident)/(tabs)/community")}
            title="From your community"
          />
          <ResidentContentCard
            accent={residentTheme.highlight}
            description={viewModel.community.detail}
            icon="event"
            onPress={() => router.push("/(resident)/(tabs)/community")}
            title={viewModel.community.title}
          />

          <View style={styles.notice}>
            <View style={styles.noticeEyebrowRow}>
              <View style={styles.noticeDot} />
              <Text style={styles.noticeEyebrow}>Latest notice</Text>
            </View>
            <Text style={styles.noticeTitle}>{viewModel.notice.title}</Text>
            <Text style={styles.noticeDetail}>{viewModel.notice.detail}</Text>
            <Text style={styles.noticeBody}>{viewModel.notice.body}</Text>
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
  hero: {
    minHeight: 174,
    borderRadius: 22,
    backgroundColor: residentTheme.ink,
    marginTop: 14,
    padding: 20,
    overflow: "hidden",
  },
  heroStatusRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: residentTheme.highlight },
  heroStatus: { color: residentTheme.highlight, fontSize: 13, lineHeight: 18, fontWeight: "700" },
  heroTitle: { color: residentTheme.surface, fontSize: 27, lineHeight: 33, fontWeight: "700", marginTop: 19, maxWidth: 285 },
  heroMessage: { color: residentTheme.header, fontSize: 15, lineHeight: 21, marginTop: 6 },
  heroAccent: {
    position: "absolute",
    right: -24,
    bottom: -42,
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 22,
    borderColor: residentTheme.accent,
    opacity: 0.9,
  },
  stats: { gap: 10, paddingRight: 16 },
  cardGap: { marginTop: 12 },
  cardList: { gap: 10 },
  emptyCard: { padding: 22, borderRadius: 18, alignItems: "center", backgroundColor: residentTheme.surface },
  emptyText: { color: residentTheme.muted, fontSize: 14 },
  notice: {
    marginTop: 14,
    padding: 18,
    borderRadius: 18,
    backgroundColor: residentTheme.surface,
    borderColor: residentTheme.border,
    borderWidth: StyleSheet.hairlineWidth,
  },
  noticeEyebrowRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  noticeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: residentTheme.accent },
  noticeEyebrow: { color: residentTheme.accent, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  noticeTitle: { color: residentTheme.ink, fontSize: 17, lineHeight: 22, fontWeight: "700", marginTop: 12 },
  noticeDetail: { color: residentTheme.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  noticeBody: { color: residentTheme.ink, fontSize: 14, lineHeight: 21, marginTop: 12 },
});
