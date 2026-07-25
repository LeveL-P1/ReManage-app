import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import {
  filterResidentModules,
  type ResidentModuleDefinition,
  type ResidentModuleId,
} from "@/features/resident/catalog/resident-module-catalog";
import { getResidentMoreFeature } from "@/features/resident/more/resident-more-feature-catalog";
import { ResidentCenteredModal } from "@/features/resident/shared/resident-overlays";
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

function pushHomePopOut(router: ReturnType<typeof useRouter>, route: string) {
  router.push(route as never);
}

function openModule(router: ReturnType<typeof useRouter>, module: ResidentModuleDefinition) {
  if (module.mobileRoute) {
    router.push(module.mobileRoute);
    return;
  }
  const feature = getResidentMoreFeature(module.id);
  if (feature) router.push(feature.route);
}

export function ResidentCommunityScreen({
  viewModel = residentCommunityFixture,
}: {
  viewModel?: ResidentCommunityViewModel;
}) {
  const router = useRouter();
  const { state } = useSession();
  const [tribePreview, setTribePreview] = useState<string | null>(null);
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
  const directory = visibleModules.find(({ id }) => id === "directory") ?? null;
  const staff = visibleModules.find(({ id }) => id === "staff") ?? null;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ResidentSocietyHeader
          unit={viewModel.unit}
          societyName={bootstrap?.society.name ?? "Your society"}
          onNotifications={() => pushHomePopOut(router, "/(resident)/home/notifications")}
          onProfile={() => pushHomePopOut(router, "/(resident)/home/profile")}
          onSearch={() => pushHomePopOut(router, "/(resident)/home/search")}
        />

        <View style={styles.content}>
          <View style={styles.hostBanner}>
            <View style={styles.hostIllustration}>
              <Ionicons color={residentTheme.icon} name="people-outline" size={56} />
            </View>
            <Pressable
              accessibilityLabel="Host a Class"
              accessibilityRole="button"
              onPress={() => router.push("/(resident)/more/events-calendar")}
              style={({ pressed }) => [styles.hostButton, pressed && styles.pressed]}
            >
              <Text style={styles.hostButtonText}>+ Host a Class</Text>
            </Pressable>
          </View>

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
                onPress={() => openModule(router, module)}
              />
            ))}
            <ResidentActionTile
              columns={5}
              icon="more"
              label="More"
              onPress={() => router.push("/(resident)/(tabs)/more")}
            />
          </ResidentActionGrid>

          <View style={styles.tribeIntro}>
            <Text style={styles.tribeTitle}>Find Your Tribe</Text>
            <Text style={styles.tribeSubtitle}>Discover residents who share your interests and background</Text>
          </View>
          <View style={styles.tribeGrid}>
            {viewModel.tribeCategories.map((category) => (
              <View key={category.id} style={styles.tribeCard}>
                <Text style={styles.tribeCategoryTitle}>{category.title}</Text>
                <View style={styles.tribeAvatar}><Text style={styles.tribeInitial}>{category.initial}</Text></View>
                <Pressable
                  accessibilityLabel={category.actionLabel}
                  accessibilityRole="button"
                  onPress={() => setTribePreview(category.title)}
                  style={({ pressed }) => [styles.tribeAction, pressed && styles.pressed]}
                >
                  <View style={styles.tribePlus}><Ionicons color={residentTheme.ink} name="add" size={16} /></View>
                  <Text style={styles.tribeActionText}>{category.actionLabel}</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityLabel="Resident Directory"
            accessibilityRole="button"
            onPress={() => directory && openModule(router, directory)}
            style={({ pressed }) => [styles.directoryCard, pressed && styles.pressed]}
          >
            <View style={styles.directoryCopy}>
              <Text style={styles.directoryTitle}>Resident Directory</Text>
              <Text style={styles.directoryDetail}>Discover, connect, and engage</Text>
            </View>
            <View style={styles.avatarStack}>
              <View style={[styles.avatar, styles.avatarOne]}><Text style={styles.avatarText}>RS</Text></View>
              <View style={[styles.avatar, styles.avatarTwo]}><Text style={styles.avatarText}>AK</Text></View>
              <View style={[styles.avatar, styles.avatarThree]}><Text style={styles.avatarText}>+19</Text></View>
            </View>
          </Pressable>

          <ResidentSectionHeader actionLabel="See all" onAction={() => staff && openModule(router, staff)} title="Find Daily Help" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.helpRow}>
            {viewModel.dailyHelp.map((helper) => (
              <Pressable
                accessibilityLabel={`Open ${helper.name}`}
                accessibilityRole="button"
                key={helper.id}
                onPress={() => staff && openModule(router, staff)}
                style={({ pressed }) => [styles.helpCard, pressed && styles.pressed]}
              >
                <View style={styles.helpAvatarWrap}>
                  <View style={styles.helpAvatar}><Text style={styles.helpInitial}>{helper.initials}</Text></View>
                  {helper.online ? <View style={styles.onlineDot} /> : null}
                </View>
                <Text style={styles.helpName}>{helper.name}</Text>
                <Text style={styles.helpRole}>{helper.role}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <ResidentSectionHeader title="Happening nearby" />
          <View style={styles.cardList}>
            <ResidentContentCard
              accent={residentTheme.highlight}
              description={viewModel.event.detail}
              icon="event"
              onPress={() => {
                const events = actions.find(({ id }) => id === "events");
                if (events) openModule(router, events);
              }}
              title={viewModel.event.title}
            />
            <ResidentContentCard
              accent={residentTheme.accent}
              description={viewModel.hostPrompt.detail}
              icon="forum"
              onPress={() => router.push("/(resident)/more/events-calendar")}
              title={viewModel.hostPrompt.title}
            />
          </View>

          <ResidentSectionHeader title="Safety & support" />
          <View style={styles.cardList}>
            {sos ? (
              <ResidentContentCard
                accent="#C62828"
                description={viewModel.safety.detail}
                icon="sos"
                onPress={() => router.push("/(resident)/more/safety")}
                title={viewModel.safety.title}
              />
            ) : null}
            {helpdesk ? (
              <ResidentContentCard
                accent={residentTheme.icon}
                description="For non-emergency safety and security support"
                icon="helpdesk"
                onPress={() => openModule(router, helpdesk)}
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
                onPress={() => openModule(router, module)}
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

      <ResidentCenteredModal
        message={`Adding your ${tribePreview ?? "interest"} profile is a mobile preview only.`}
        onDismiss={() => setTribePreview(null)}
        onPrimary={() => setTribePreview(null)}
        primaryLabel="Got it"
        title={tribePreview ? `Add ${tribePreview}` : "Preview"}
        visible={tribePreview !== null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.canvas },
  scrollContent: { paddingBottom: 28 },
  content: { paddingHorizontal: 16 },
  hostBanner: {
    marginTop: 14,
    padding: 20,
    borderRadius: 22,
    backgroundColor: residentTheme.surface,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: residentTheme.border,
  },
  hostIllustration: {
    width: 120,
    height: 96,
    borderRadius: 20,
    backgroundColor: "#E8F0EE",
    alignItems: "center",
    justifyContent: "center",
  },
  hostButton: {
    marginTop: 16,
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: residentTheme.icon,
    alignItems: "center",
    justifyContent: "center",
  },
  hostButtonText: { color: residentTheme.icon, fontSize: 16, fontWeight: "700" },
  overview: { marginTop: 16, padding: 18, borderRadius: 22, backgroundColor: residentTheme.surface },
  eyebrow: { color: residentTheme.accent, fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 1 },
  overviewTitle: { color: residentTheme.ink, fontSize: 25, lineHeight: 31, fontWeight: "700", marginTop: 5, maxWidth: 320 },
  accent: { color: residentTheme.accent },
  stats: { flexDirection: "row", gap: 8, marginTop: 17 },
  tribeIntro: { marginTop: 24, marginBottom: 12 },
  tribeTitle: { color: residentTheme.ink, fontSize: 22, fontWeight: "700", lineHeight: 28 },
  tribeSubtitle: { color: residentTheme.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  tribeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  tribeCard: {
    width: "48%",
    minHeight: 156,
    padding: 14,
    borderRadius: 18,
    backgroundColor: residentTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: residentTheme.border,
  },
  tribeCategoryTitle: { color: residentTheme.ink, fontSize: 15, fontWeight: "700" },
  tribeAvatar: {
    alignSelf: "center",
    width: 52,
    height: 52,
    borderRadius: 26,
    marginTop: 14,
    backgroundColor: "#E7DDC9",
    alignItems: "center",
    justifyContent: "center",
  },
  tribeInitial: { color: residentTheme.icon, fontSize: 18, fontWeight: "800" },
  tribeAction: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
  tribePlus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: residentTheme.highlight,
    alignItems: "center",
    justifyContent: "center",
  },
  tribeActionText: { color: residentTheme.ink, fontSize: 11, fontWeight: "700", flex: 1 },
  directoryCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: residentTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: residentTheme.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  directoryCopy: { flex: 1, paddingRight: 12 },
  directoryTitle: { color: residentTheme.ink, fontSize: 16, fontWeight: "700" },
  directoryDetail: { color: residentTheme.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
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
  helpRow: { gap: 12, paddingBottom: 4 },
  helpCard: {
    width: 112,
    padding: 12,
    borderRadius: 18,
    backgroundColor: residentTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: residentTheme.border,
    alignItems: "center",
  },
  helpAvatarWrap: { position: "relative" },
  helpAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E7DDC9",
    alignItems: "center",
    justifyContent: "center",
  },
  helpInitial: { color: residentTheme.icon, fontSize: 18, fontWeight: "800" },
  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2E9E44",
    borderWidth: 2,
    borderColor: residentTheme.surface,
  },
  helpName: { color: residentTheme.ink, fontSize: 14, fontWeight: "700", marginTop: 10 },
  helpRole: { color: residentTheme.muted, fontSize: 12, lineHeight: 16, marginTop: 2, textAlign: "center" },
  cardList: { gap: 10 },
  tenureCard: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 26, paddingHorizontal: 4 },
  tenureHeart: { color: residentTheme.accent, fontSize: 18 },
  tenure: { color: residentTheme.ink, fontSize: 16, lineHeight: 22, fontWeight: "600" },
  pressed: { opacity: 0.74 },
});
