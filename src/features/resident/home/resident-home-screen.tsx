import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useSession } from "@/platform/auth/session-provider";
import { colors, residentTheme } from "@/platform/theme/tokens";
import { useResidentDisplayName, useResidentUnit } from "@/features/resident/profile/use-resident-profile";
import { useHomeGateVisitor } from "./use-home-gate-visitor";
import { useHomeRecentNotice } from "./use-home-recent-notice";
import { useHomeUnreadCount } from "./use-home-unread-count";
import {
  billTotal,
  formatDueLabel,
  primaryOutstandingBill,
  useResidentBills,
} from "@/features/resident/bills/use-resident-bills";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  tileColor: string;
  route: string;
}

export function ResidentHomeScreen() {
  const router = useRouter();
  const { state } = useSession();
  const bootstrap = state.status === "authenticated" ? state.bootstrap : null;
  const unit = useResidentUnit();
  const displayName = useResidentDisplayName();
  const firstName = displayName.split(" ")[0];
  const greeting = greetingForHour(new Date().getHours());

  const unreadCountQuery = useHomeUnreadCount();
  const { pendingVisitor, approve, reject } = useHomeGateVisitor();
  const billsQuery = useResidentBills();
  const noticeQuery = useHomeRecentNotice();

  const primaryBill = billsQuery.data ? primaryOutstandingBill(billsQuery.data.bills) : null;

  const permissions = bootstrap?.permissions ?? [];
  const quickActions: QuickAction[] = [
    { id: "visitors", label: "Visitors", icon: "person-add-outline", iconColor: colors.info, tileColor: colors.infoSoft, route: "/(resident)/(tabs)/visitors" },
    { id: "bills", label: "Bills", icon: "card-outline", iconColor: colors.primary, tileColor: colors.primarySoft, route: "/(resident)/(tabs)/bills" },
    { id: "community", label: "Community", icon: "chatbubbles-outline", iconColor: "#d99a00", tileColor: colors.secondarySoft, route: "/(resident)/(tabs)/community" },
    ...(permissions.includes("operations:booking.manage")
      ? [{ id: "amenities", label: "Amenities", icon: "business-outline" as const, iconColor: colors.success, tileColor: colors.successSoft, route: "/(resident)/more/amenity-booking" }]
      : []),
    { id: "notices", label: "Notices", icon: "megaphone-outline", iconColor: colors.info, tileColor: colors.infoSoft, route: "/(resident)/(tabs)/notices" },
    ...(permissions.includes("operations:sos.raise")
      ? [{ id: "sos", label: "SOS", icon: "shield-outline" as const, iconColor: colors.danger, tileColor: colors.dangerSoft, route: "/(resident)/more/safety" }]
      : []),
  ];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.identity}>{firstName} · {unit}</Text>
        </View>
        <Pressable
          accessibilityLabel="Notifications"
          accessibilityRole="button"
          onPress={() => router.push("/(resident)/home/notifications" as never)}
          style={({ pressed }) => [styles.bellButton, pressed && styles.pressed]}
        >
          <Ionicons color={colors.text} name="notifications-outline" size={22} />
          {unreadCountQuery.data ? (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{unreadCountQuery.data > 9 ? "9+" : unreadCountQuery.data}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {pendingVisitor ? (
            <View style={styles.gateCard}>
              <View style={styles.gateCardHeader}>
                <View style={styles.gateDot} />
                <Text style={styles.gateCardHeaderText}>AT YOUR GATE · needs approval</Text>
              </View>
              <View style={styles.gateCardBody}>
                <View style={styles.gateVisitorRow}>
                  <View style={styles.gateVisitorIcon}>
                    <Ionicons color={colors.info} name="person-outline" size={23} />
                  </View>
                  <View style={styles.gateVisitorCopy}>
                    <Text style={styles.gateVisitorName}>{pendingVisitor.visitorName}</Text>
                    <Text style={styles.gateVisitorMeta}>{pendingVisitor.purpose}</Text>
                  </View>
                </View>
                <View style={styles.gateActions}>
                  <Pressable
                    accessibilityLabel={`Approve ${pendingVisitor.visitorName}`}
                    accessibilityRole="button"
                    disabled={approve.isPending || reject.isPending}
                    onPress={() => approve.mutate(pendingVisitor.id)}
                    style={({ pressed }) => [styles.approveButton, (pressed || approve.isPending) && styles.pressed]}
                  >
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Decline ${pendingVisitor.visitorName}`}
                    accessibilityRole="button"
                    disabled={approve.isPending || reject.isPending}
                    onPress={() => reject.mutate(pendingVisitor.id)}
                    style={({ pressed }) => [styles.declineButton, (pressed || reject.isPending) && styles.pressed]}
                  >
                    <Ionicons color={colors.danger} name="close" size={19} />
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityLabel="Open Bills"
            accessibilityRole="button"
            onPress={() => router.push("/(resident)/(tabs)/bills" as never)}
            style={({ pressed }) => [styles.duesWrap, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryGradientEnd]}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.duesCard}
            >
              {primaryBill ? (
                <>
                  <View style={styles.duesCopy}>
                    <Text style={styles.duesLabel}>{primaryBill.period} maintenance due</Text>
                    <Text style={styles.duesAmount}>{formatCurrency(billTotal(primaryBill))}</Text>
                    <Text style={styles.duesSub}>{formatDueLabel(primaryBill.dueDate)} · tap to pay</Text>
                  </View>
                  <Ionicons color={colors.white} name="arrow-forward" size={22} />
                </>
              ) : (
                <>
                  <View style={styles.duesCopy}>
                    <Text style={styles.duesLabel}>Society dues</Text>
                    <Text style={styles.duesAmount}>{billsQuery.isLoading ? "···" : "All settled"}</Text>
                    <Text style={styles.duesSub}>No pending payments · tap to view bills</Text>
                  </View>
                  <Ionicons color={colors.white} name="arrow-forward" size={22} />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <Text style={styles.kicker}>Quick actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action) => (
              <Pressable
                accessibilityLabel={action.label}
                accessibilityRole="button"
                key={action.id}
                onPress={() => router.push(action.route as never)}
                style={({ pressed }) => [styles.actionTile, pressed && styles.pressed]}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.tileColor }]}>
                  <Ionicons color={action.iconColor} name={action.icon} size={22} />
                </View>
                <Text style={[styles.actionLabel, action.id === "sos" && styles.actionLabelDanger]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.kicker}>Notices</Text>
          {noticeQuery.data ? (
            <Pressable
              accessibilityLabel="Open Notices"
              accessibilityRole="button"
              onPress={() => router.push("/(resident)/(tabs)/notices" as never)}
              style={({ pressed }) => [styles.noticeRow, pressed && styles.pressed]}
            >
              <View style={styles.noticeIcon}>
                <Ionicons color={colors.primary} name="shield-checkmark-outline" size={20} />
              </View>
              <View style={styles.noticeCopy}>
                <Text numberOfLines={1} style={styles.noticeTitle}>{noticeQuery.data.title}</Text>
                <Text style={styles.noticeMeta}>{noticeQuery.data.detail}</Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.noticeRow}>
              <Text style={styles.noticeMeta}>{noticeQuery.isLoading ? "Loading notices…" : "No notices yet."}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greeting: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  identity: { color: colors.text, fontSize: 23, fontWeight: "800", letterSpacing: -0.3, marginTop: 2 },
  bellButton: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: residentTheme.border, alignItems: "center", justifyContent: "center" },
  bellBadge: { position: "absolute", top: 7, right: 8, minWidth: 16, height: 16, paddingHorizontal: 4, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.white },
  bellBadgeText: { color: colors.white, fontSize: 10, fontWeight: "800" },
  scrollContent: { paddingBottom: 32 },
  content: { paddingHorizontal: 16 },
  pressed: { opacity: 0.78 },

  gateCard: { borderRadius: 20, borderWidth: 1, borderColor: colors.primarySoft, backgroundColor: "#fff5ef", overflow: "hidden", marginBottom: 14 },
  gateCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#ffe9dc" },
  gateDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  gateCardHeaderText: { color: "#c0430a", fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },
  gateCardBody: { padding: 16 },
  gateVisitorRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  gateVisitorIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.infoSoft, alignItems: "center", justifyContent: "center" },
  gateVisitorCopy: { flex: 1 },
  gateVisitorName: { color: colors.text, fontSize: 16, fontWeight: "800" },
  gateVisitorMeta: { color: colors.muted, fontSize: 12.5, marginTop: 2 },
  gateActions: { flexDirection: "row", gap: 9, marginTop: 13 },
  approveButton: { flex: 1, paddingVertical: 12, borderRadius: 13, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  approveButtonText: { color: colors.white, fontSize: 14.5, fontWeight: "800" },
  declineButton: { width: 50, borderRadius: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: "#e2ddd2", alignItems: "center", justifyContent: "center" },

  duesWrap: { marginBottom: 14 },
  duesCard: { borderRadius: 20, padding: 18, flexDirection: "row", alignItems: "center", gap: 14 },
  duesCopy: { flex: 1 },
  duesLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12.5, fontWeight: "600" },
  duesAmount: { color: colors.white, fontSize: 30, fontWeight: "800", letterSpacing: -0.5, marginTop: 2 },
  duesSub: { color: "rgba(255,255,255,0.9)", fontSize: 12, marginTop: 2 },

  kicker: { color: colors.muted, fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 6, marginBottom: 12, marginHorizontal: 4 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  actionTile: { width: "31%", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.hairline, borderRadius: 18, paddingVertical: 15, paddingHorizontal: 8, alignItems: "center", gap: 8 },
  actionIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  actionLabel: { color: colors.text, fontSize: 12, fontWeight: "700" },
  actionLabelDanger: { color: colors.danger, fontWeight: "800" },

  noticeRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.hairline, borderRadius: 18, padding: 14, minHeight: 56 },
  noticeIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff5ef", borderWidth: 1, borderColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: colors.text, fontSize: 14.5, fontWeight: "700" },
  noticeMeta: { color: colors.muted, fontSize: 12 },
});
