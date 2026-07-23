import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ResidentIcon } from "@/features/resident/shared/resident-icon";
import {
  ResidentActionGrid,
  ResidentActionTile,
  ResidentSectionHeader,
  ResidentSocietyHeader,
} from "@/features/resident/shared/resident-ui";
import { useSession } from "@/platform/auth/session-provider";
import { residentTheme } from "@/platform/theme/tokens";
import {
  getResidentVisitorFeature,
  residentVisitorQuickActionIds,
  type ResidentVisitorFeatureId,
} from "./resident-visitors-feature-catalog";
import { residentVisitorsFixture, type ResidentVisitorsViewModel } from "./resident-visitors-fixtures";

function pushVisitorFeature(router: ReturnType<typeof useRouter>, id: ResidentVisitorFeatureId) {
  router.push(getResidentVisitorFeature(id).route as never);
}

export function ResidentVisitorsScreen({
  viewModel = residentVisitorsFixture,
}: {
  viewModel?: ResidentVisitorsViewModel;
}) {
  const router = useRouter();
  const { state } = useSession();
  const societyName = state.status === "authenticated" ? state.bootstrap.society.name : "Your society";

  return (
    <View style={styles.screen}>
      <ResidentSocietyHeader
        unit={viewModel.unit}
        societyName={societyName}
        onSearch={() => router.push("/(resident)/home/search" as never)}
        onNotifications={() => router.push("/(resident)/home/notifications" as never)}
        onProfile={() => router.push("/(resident)/home/profile" as never)}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.pageHeading}>
            <Text accessibilityRole="header" style={styles.title}>Visitors</Text>
            <Pressable
              accessibilityLabel="Pre-Approve visitor"
              accessibilityRole="button"
              onPress={() => pushVisitorFeature(router, "pre-approve")}
              style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
            >
              <Ionicons color={residentTheme.icon} name="person-add-outline" size={20} />
              <Text style={styles.headerActionText}>Pre-Approve</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel="View all visitor updates"
            accessibilityRole="button"
            onPress={() => pushVisitorFeature(router, "updates")}
            style={({ pressed }) => [styles.summaryCard, pressed && styles.pressed]}
          >
            <View style={styles.summaryTopRow}>
              <View style={styles.summaryIcon}><ResidentIcon color={residentTheme.icon} name="visitor" size={27} /></View>
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryTitle}>Today’s visitor updates</Text>
                <Text style={styles.summaryDescription}>A clear view of arrivals at your residence.</Text>
              </View>
              <Ionicons color={residentTheme.icon} name="chevron-forward" size={20} />
            </View>
            <View style={styles.summaryMetrics}>
              <Metric label="Expected" value={viewModel.summary.expectedCount} />
              <View style={styles.metricDivider} />
              <Metric label="Pending" value={viewModel.summary.pendingCount} />
              <View style={styles.metricDivider} />
              <Metric label="Updates" value={viewModel.summary.activityCount} />
            </View>
          </Pressable>

          <ResidentSectionHeader title="Quick visitor actions" />
          <ResidentActionGrid>
            {residentVisitorQuickActionIds.map((id) => {
              const feature = getResidentVisitorFeature(id);
              return (
                <ResidentActionTile
                  columns={4}
                  icon={feature.icon}
                  key={feature.id}
                  label={feature.title === "Pre-Approve Visitor" ? "Pre-Approve" : feature.title}
                  onPress={() => pushVisitorFeature(router, feature.id)}
                />
              );
            })}
          </ResidentActionGrid>

          <ResidentSectionHeader actionLabel="View all" onAction={() => pushVisitorFeature(router, "updates")} title="Expected today" />
          <View style={styles.visitorList}>
            {viewModel.expectedVisitors.map((visitor) => (
              <Pressable
                accessibilityLabel={`Open ${visitor.name} visitor details`}
                accessibilityRole="button"
                key={visitor.id}
                onPress={() => router.push(`/(resident)/visitors/${visitor.id}` as never)}
                style={({ pressed }) => [styles.visitorCard, pressed && styles.pressed]}
              >
                <View style={styles.visitorAvatar}><Text style={styles.visitorInitials}>{visitor.initials}</Text></View>
                <View style={styles.visitorCopy}>
                  <Text style={styles.visitorName}>{visitor.name}</Text>
                  <Text style={styles.visitorContext}>{visitor.context}</Text>
                  <Text style={styles.visitorTime}>{visitor.expectedAt}</Text>
                </View>
                <View style={[styles.statusPill, visitor.status === "Pre-approved" ? styles.statusApproved : styles.statusExpected]}>
                  <Ionicons color={visitor.status === "Pre-approved" ? residentTheme.icon : residentTheme.accent} name={visitor.status === "Pre-approved" ? "checkmark-circle" : "time-outline"} size={14} />
                  <Text style={[styles.statusText, visitor.status === "Pre-approved" ? styles.statusApprovedText : styles.statusExpectedText]}>{visitor.status}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <ResidentSectionHeader actionLabel="History" onAction={() => pushVisitorFeature(router, "history")} title="Recent activity" />
          <View style={styles.activityCard}>
            {viewModel.activity.map((item, index) => (
              <View key={item.id}>
                <Pressable
                  accessibilityLabel={`Open ${item.title}`}
                  accessibilityRole="button"
                  onPress={() => pushVisitorFeature(router, item.id === "daily-help" ? "daily-help" : "history")}
                  style={({ pressed }) => [styles.activityRow, pressed && styles.pressed]}
                >
                  <View style={styles.activityIcon}><ResidentIcon color={residentTheme.icon} name={item.icon} size={21} /></View>
                  <View style={styles.activityCopy}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityDescription}>{item.detail}</Text>
                  </View>
                  <Text style={styles.activityWhen}>{item.when}</Text>
                </Pressable>
                {index < viewModel.activity.length - 1 ? <View style={styles.activityDivider} /> : null}
              </View>
            ))}
          </View>

          <View style={styles.caughtUp}>
            <View style={styles.caughtUpIcon}><Ionicons color={residentTheme.icon} name="checkmark" size={33} /></View>
            <Text style={styles.caughtUpTitle}>You’re up to date</Text>
            <Text style={styles.caughtUpCopy}>We’ll keep your visitor updates together here.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.canvas },
  scrollContent: { paddingBottom: 112 },
  content: { paddingHorizontal: 16 },
  pageHeading: { minHeight: 72, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: residentTheme.ink, fontSize: 25, lineHeight: 31, fontWeight: "700" },
  headerAction: { height: 42, paddingHorizontal: 14, borderRadius: 21, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border, flexDirection: "row", alignItems: "center", gap: 7 },
  headerActionText: { color: residentTheme.icon, fontSize: 14, fontWeight: "700" },
  summaryCard: { padding: 18, borderRadius: 22, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border },
  summaryTopRow: { flexDirection: "row", alignItems: "center" },
  summaryIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#E5F2F0", alignItems: "center", justifyContent: "center" },
  summaryCopy: { flex: 1, marginLeft: 12, marginRight: 8 },
  summaryTitle: { color: residentTheme.ink, fontSize: 18, lineHeight: 24, fontWeight: "700" },
  summaryDescription: { color: residentTheme.muted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  summaryMetrics: { flexDirection: "row", marginTop: 19, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: residentTheme.border },
  metric: { flex: 1, alignItems: "center" },
  metricValue: { color: residentTheme.ink, fontSize: 22, lineHeight: 27, fontWeight: "700" },
  metricLabel: { color: residentTheme.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  metricDivider: { width: StyleSheet.hairlineWidth, height: 31, alignSelf: "center", backgroundColor: residentTheme.border },
  visitorList: { gap: 11 },
  visitorCard: { minHeight: 94, padding: 15, borderRadius: 20, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border, flexDirection: "row", alignItems: "center" },
  visitorAvatar: { width: 49, height: 49, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#E7DDC9" },
  visitorInitials: { color: residentTheme.icon, fontSize: 14, fontWeight: "800" },
  visitorCopy: { flex: 1, marginLeft: 12, marginRight: 8 },
  visitorName: { color: residentTheme.ink, fontSize: 16, lineHeight: 21, fontWeight: "700" },
  visitorContext: { color: residentTheme.muted, fontSize: 13, lineHeight: 18, marginTop: 1 },
  visitorTime: { color: residentTheme.icon, fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 2 },
  statusPill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 4 },
  statusApproved: { backgroundColor: "#E5F2F0" },
  statusExpected: { backgroundColor: "#FFF0D6" },
  statusText: { fontSize: 10, lineHeight: 13, fontWeight: "700" },
  statusApprovedText: { color: residentTheme.icon },
  statusExpectedText: { color: residentTheme.accent },
  activityCard: { borderRadius: 21, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border, overflow: "hidden" },
  activityRow: { minHeight: 76, paddingHorizontal: 16, paddingVertical: 13, flexDirection: "row", alignItems: "center" },
  activityIcon: { width: 41, height: 41, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#E5F2F0" },
  activityCopy: { flex: 1, marginLeft: 11, marginRight: 8 },
  activityTitle: { color: residentTheme.ink, fontSize: 15, lineHeight: 20, fontWeight: "700" },
  activityDescription: { color: residentTheme.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  activityWhen: { color: residentTheme.muted, fontSize: 12, lineHeight: 17 },
  activityDivider: { height: StyleSheet.hairlineWidth, marginLeft: 68, backgroundColor: residentTheme.border },
  caughtUp: { alignItems: "center", marginTop: 42, paddingBottom: 10 },
  caughtUpIcon: { width: 65, height: 65, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "#E5F2F0", borderWidth: 5, borderColor: residentTheme.surface },
  caughtUpTitle: { color: residentTheme.ink, fontSize: 20, lineHeight: 26, fontWeight: "700", marginTop: 14 },
  caughtUpCopy: { color: residentTheme.muted, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 4 },
  pressed: { opacity: 0.74 },
});
