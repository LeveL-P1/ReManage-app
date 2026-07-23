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
  getResidentBillsFeature,
  residentBillsQuickActionIds,
  type ResidentBillsFeatureId,
} from "./resident-bills-feature-catalog";
import { residentBillsFixture, type ResidentBillsViewModel } from "./resident-bills-fixtures";

function pushBillsFeature(router: ReturnType<typeof useRouter>, id: ResidentBillsFeatureId) {
  router.push(getResidentBillsFeature(id).route as never);
}

const quickLabels: Record<ResidentBillsFeatureId, string> = {
  "pay-now": "Pay dues",
  invoices: "Invoices",
  history: "History",
  help: "Payment Help",
};

export function ResidentBillsScreen({
  viewModel = residentBillsFixture,
}: {
  viewModel?: ResidentBillsViewModel;
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
            <Text accessibilityRole="header" style={styles.title}>My Bills</Text>
            <Pressable
              accessibilityLabel="View invoices"
              accessibilityRole="button"
              onPress={() => pushBillsFeature(router, "invoices")}
              style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
            >
              <Ionicons color={residentTheme.icon} name="document-text-outline" size={20} />
              <Text style={styles.headerActionText}>Invoices</Text>
            </Pressable>
          </View>

          <View style={styles.duesCard}>
            <View style={styles.duesTopRow}>
              <View style={styles.duesIcon}><ResidentIcon color={residentTheme.icon} name="bill" size={27} /></View>
              <View style={styles.duesCopy}>
                <Text style={styles.duesEyebrow}>CURRENT DUES</Text>
                <Text style={styles.duesTitle}>{viewModel.currentDues.label}</Text>
              </View>
            </View>
            <Text style={styles.dueAmount}>{viewModel.currentDues.amount}</Text>
            <Text style={styles.dueDate}>{viewModel.currentDues.dueDate}</Text>
            <Pressable
              accessibilityLabel="Pay now"
              accessibilityRole="button"
              onPress={() => pushBillsFeature(router, "pay-now")}
              style={({ pressed }) => [styles.payNowButton, pressed && styles.pressed]}
            >
              <Ionicons color={residentTheme.ink} name="receipt-outline" size={21} />
              <Text style={styles.payNowText}>Pay now</Text>
            </Pressable>
          </View>

          <ResidentSectionHeader title="Quick payment actions" />
          <ResidentActionGrid>
            {residentBillsQuickActionIds.map((id) => {
              const feature = getResidentBillsFeature(id);
              return (
                <ResidentActionTile
                  columns={4}
                  icon={feature.icon}
                  key={feature.id}
                  label={quickLabels[feature.id]}
                  onPress={() => pushBillsFeature(router, feature.id)}
                />
              );
            })}
          </ResidentActionGrid>

          <ResidentSectionHeader actionLabel="All invoices" onAction={() => pushBillsFeature(router, "invoices")} title="Latest invoice" />
          <Pressable
            accessibilityLabel="Open July 2026 invoice"
            accessibilityRole="button"
            onPress={() => router.push("/(resident)/bills/july-2026" as never)}
            style={({ pressed }) => [styles.invoiceCard, pressed && styles.pressed]}
          >
            <View style={styles.invoiceIcon}><ResidentIcon color={residentTheme.icon} name="document" size={24} /></View>
            <View style={styles.invoiceCopy}>
              <Text style={styles.invoiceTitle}>{viewModel.latestInvoice.title}</Text>
              <Text style={styles.invoicePeriod}>{viewModel.latestInvoice.period}</Text>
              <Text style={styles.invoiceDue}>{viewModel.latestInvoice.dueDate}</Text>
            </View>
            <View style={styles.invoiceSide}>
              <Text style={styles.invoiceAmount}>{viewModel.latestInvoice.amount}</Text>
              <View style={styles.statusPill}><Ionicons color={residentTheme.accent} name="time-outline" size={13} /><Text style={styles.statusText}>{viewModel.latestInvoice.status}</Text></View>
            </View>
          </Pressable>

          <ResidentSectionHeader actionLabel="View history" onAction={() => pushBillsFeature(router, "history")} title="Payment activity" />
          <View style={styles.activityCard}>
            {viewModel.activity.map((item, index) => (
              <View key={item.id}>
                <Pressable
                  accessibilityLabel={`Open ${item.title}`}
                  accessibilityRole="button"
                  onPress={() => pushBillsFeature(router, item.id === "receipt" ? "history" : "help")}
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

          <ResidentSectionHeader title="Payments made simpler" />
          <Pressable
            accessibilityLabel="Open Payment Help"
            accessibilityRole="button"
            onPress={() => pushBillsFeature(router, "help")}
            style={({ pressed }) => [styles.supportCard, pressed && styles.pressed]}
          >
            <View style={styles.supportIcon}><Ionicons color={residentTheme.icon} name="shield-checkmark-outline" size={25} /></View>
            <View style={styles.supportCopy}>
              <Text style={styles.supportTitle}>Keep every payment record together</Text>
              <Text style={styles.supportDescription}>Review invoices, payment references, and help options from one place.</Text>
            </View>
            <Ionicons color={residentTheme.icon} name="chevron-forward" size={20} />
          </Pressable>

          <View style={styles.caughtUp}>
            <View style={styles.caughtUpIcon}><Ionicons color={residentTheme.icon} name="checkmark" size={33} /></View>
            <Text style={styles.caughtUpTitle}>Your bill overview is ready</Text>
            <Text style={styles.caughtUpCopy}>We’ll keep upcoming dues and records easy to find here.</Text>
          </View>
        </View>
      </ScrollView>
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
  duesCard: { padding: 19, borderRadius: 23, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border },
  duesTopRow: { flexDirection: "row", alignItems: "center" },
  duesIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#E5F2F0", alignItems: "center", justifyContent: "center" },
  duesCopy: { marginLeft: 12 },
  duesEyebrow: { color: residentTheme.accent, fontSize: 10, lineHeight: 14, letterSpacing: 0.7, fontWeight: "800" },
  duesTitle: { color: residentTheme.ink, fontSize: 16, lineHeight: 21, fontWeight: "700", marginTop: 2 },
  dueAmount: { color: residentTheme.ink, fontSize: 34, lineHeight: 42, fontWeight: "800", marginTop: 21 },
  dueDate: { color: residentTheme.muted, fontSize: 14, lineHeight: 20, marginTop: 3 },
  payNowButton: { height: 54, marginTop: 20, borderRadius: 15, backgroundColor: residentTheme.highlight, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  payNowText: { color: residentTheme.ink, fontSize: 17, fontWeight: "800" },
  invoiceCard: { minHeight: 104, padding: 16, borderRadius: 21, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border, flexDirection: "row", alignItems: "center" },
  invoiceIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#E5F2F0", alignItems: "center", justifyContent: "center" },
  invoiceCopy: { flex: 1, marginLeft: 12, marginRight: 8 },
  invoiceTitle: { color: residentTheme.ink, fontSize: 16, lineHeight: 21, fontWeight: "700" },
  invoicePeriod: { color: residentTheme.muted, fontSize: 13, lineHeight: 18, marginTop: 1 },
  invoiceDue: { color: residentTheme.icon, fontSize: 12, lineHeight: 17, fontWeight: "600", marginTop: 2 },
  invoiceSide: { alignItems: "flex-end" },
  invoiceAmount: { color: residentTheme.ink, fontSize: 16, lineHeight: 21, fontWeight: "800" },
  statusPill: { marginTop: 6, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 11, backgroundColor: "#FFF0D6", flexDirection: "row", alignItems: "center", gap: 3 },
  statusText: { color: residentTheme.accent, fontSize: 10, lineHeight: 13, fontWeight: "700" },
  activityCard: { borderRadius: 21, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border, overflow: "hidden" },
  activityRow: { minHeight: 76, paddingHorizontal: 16, paddingVertical: 13, flexDirection: "row", alignItems: "center" },
  activityIcon: { width: 41, height: 41, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#E5F2F0" },
  activityCopy: { flex: 1, marginLeft: 11, marginRight: 8 },
  activityTitle: { color: residentTheme.ink, fontSize: 15, lineHeight: 20, fontWeight: "700" },
  activityDescription: { color: residentTheme.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  activityWhen: { color: residentTheme.muted, fontSize: 12, lineHeight: 17 },
  activityDivider: { height: StyleSheet.hairlineWidth, marginLeft: 68, backgroundColor: residentTheme.border },
  supportCard: { padding: 16, borderRadius: 21, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border, flexDirection: "row", alignItems: "center" },
  supportIcon: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#E5F2F0" },
  supportCopy: { flex: 1, marginHorizontal: 12 },
  supportTitle: { color: residentTheme.ink, fontSize: 15, lineHeight: 20, fontWeight: "700" },
  supportDescription: { color: residentTheme.muted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  caughtUp: { alignItems: "center", marginTop: 42, paddingBottom: 10 },
  caughtUpIcon: { width: 65, height: 65, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "#E5F2F0", borderWidth: 5, borderColor: residentTheme.surface },
  caughtUpTitle: { color: residentTheme.ink, fontSize: 20, lineHeight: 26, fontWeight: "700", marginTop: 14 },
  caughtUpCopy: { color: residentTheme.muted, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 4 },
  pressed: { opacity: 0.74 },
});
