import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { ScreenContainer, SafeScrollView, EmptyState, LoadingState, ErrorState, PullToRefresh } from "@/features/resident/shared/heroui-ui";
import { colors, residentTheme } from "@/platform/theme/tokens";
import type { MobileBill } from "@/platform/api/mobile-api-client";
import {
  billTotal,
  formatDueLabel,
  primaryOutstandingBill,
  useResidentBills,
} from "./use-resident-bills";

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatPaidDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const BILL_TYPE_LABEL: Record<string, string> = {
  maintenance: "Maintenance",
  annual: "Annual charge",
  sinking: "Sinking fund",
  repair: "Repair charge",
  parking: "Parking",
  other: "Other charges",
};

export function BillsScreen() {
  const billsQuery = useResidentBills();

  if (billsQuery.isLoading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (billsQuery.error) {
    return (
      <ScreenContainer>
        <ErrorState message={(billsQuery.error as Error).message || "Failed to load bills"} onRetry={() => billsQuery.refetch()} />
      </ScreenContainer>
    );
  }

  const bills = billsQuery.data?.bills ?? [];
  const primaryBill = primaryOutstandingBill(bills);
  const paidBills = bills.filter((bill) => bill.status === "paid");

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={() => billsQuery.refetch()} refreshing={billsQuery.isRefetching}>
        <SafeScrollView>
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Bills</Text>
          </View>

          <View style={styles.content}>
            {bills.length === 0 ? (
              <EmptyState icon="card" title="No bills" description="You don't have any bills at the moment." />
            ) : (
              <>
                <LinearGradient
                  colors={primaryBill ? [colors.primary, colors.primaryGradientEnd] : [colors.success, colors.successGradientEnd]}
                  end={{ x: 1, y: 1 }}
                  start={{ x: 0, y: 0 }}
                  style={styles.hero}
                >
                  {primaryBill ? (
                    <>
                      <Text style={styles.heroLabel}>Total due · {primaryBill.flatNumber}</Text>
                      <Text style={styles.heroAmount}>{formatCurrency(billTotal(primaryBill))}</Text>
                      <View style={styles.heroPill}>
                        <Ionicons color={colors.white} name="time-outline" size={14} />
                        <Text style={styles.heroPillText}>{formatDueLabel(primaryBill.dueDate)}</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.heroSuccess}>
                      <View style={styles.heroSuccessIcon}>
                        <Ionicons color={colors.white} name="checkmark" size={30} />
                      </View>
                      <Text style={styles.heroSuccessTitle}>All dues cleared</Text>
                      <Text style={styles.heroSuccessSub}>No pending payments right now</Text>
                    </View>
                  )}
                </LinearGradient>

                {primaryBill ? (
                  <>
                    <Text style={styles.kicker}>This bill · {primaryBill.period}</Text>
                    <BillBreakdown bill={primaryBill} />
                  </>
                ) : null}

                {paidBills.length > 0 ? (
                  <>
                    <Text style={styles.kicker}>Paid</Text>
                    <View style={styles.paidList}>
                      {paidBills.map((bill) => (
                        <View key={bill.id} style={styles.paidRow}>
                          <View style={styles.paidIcon}>
                            <Ionicons color={colors.success} name="checkmark" size={19} />
                          </View>
                          <View style={styles.paidCopy}>
                            <Text style={styles.paidTitle}>{bill.period}</Text>
                            <Text style={styles.paidMeta}>
                              Paid {bill.paidAt ? formatPaidDate(bill.paidAt) : "—"}{bill.paidVia ? ` · ${bill.paidVia}` : ""}
                            </Text>
                          </View>
                          <Text style={styles.paidAmount}>{formatCurrency(bill.paidAmount ?? billTotal(bill))}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}
              </>
            )}
          </View>
        </SafeScrollView>
      </PullToRefresh>
    </ScreenContainer>
  );
}

function BillBreakdown({ bill }: { bill: MobileBill }) {
  const rows: { label: string; amount: number; danger?: boolean }[] = [
    { label: BILL_TYPE_LABEL[bill.billType] ?? "Maintenance", amount: bill.amount },
  ];
  if (bill.gstAmount > 0) rows.push({ label: "GST", amount: bill.gstAmount });
  if (bill.lateFee > 0) rows.push({ label: "Late fee", amount: bill.lateFee, danger: true });

  return (
    <View style={styles.breakdownCard}>
      {rows.map((row, index) => (
        <View
          key={row.label}
          style={[styles.breakdownRow, index < rows.length - 1 && styles.breakdownRowBorder]}
        >
          <Text style={[styles.breakdownLabel, row.danger && styles.breakdownDanger]}>{row.label}</Text>
          <Text style={[styles.breakdownAmount, row.danger && styles.breakdownDanger]}>{formatCurrency(row.amount)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  pageTitle: { fontSize: 23, fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },

  hero: { borderRadius: 24, padding: 22 },
  heroLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  heroAmount: { color: colors.white, fontSize: 44, fontWeight: "800", letterSpacing: -0.8, marginTop: 4 },
  heroPill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.2)" },
  heroPillText: { color: colors.white, fontSize: 12.5, fontWeight: "700" },
  heroSuccess: { alignItems: "center", paddingVertical: 6 },
  heroSuccessIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  heroSuccessTitle: { color: colors.white, fontSize: 20, fontWeight: "800" },
  heroSuccessSub: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 4 },

  kicker: { color: colors.muted, fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", marginTop: 20, marginBottom: 10, marginHorizontal: 4 },
  breakdownCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.hairline, borderRadius: 20, paddingHorizontal: 16 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 13 },
  breakdownRowBorder: { borderBottomWidth: 1, borderBottomColor: residentTheme.border },
  breakdownLabel: { fontSize: 14.5, color: "#4a453d" },
  breakdownAmount: { fontSize: 14.5, fontWeight: "700", color: colors.text },
  breakdownDanger: { color: colors.danger },

  paidList: { gap: 10 },
  paidRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.hairline, borderRadius: 18, padding: 13 },
  paidIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: colors.successSoft, alignItems: "center", justifyContent: "center" },
  paidCopy: { flex: 1 },
  paidTitle: { fontSize: 14.5, fontWeight: "700", color: colors.text },
  paidMeta: { fontSize: 12.5, color: colors.muted, marginTop: 1 },
  paidAmount: { fontSize: 14.5, fontWeight: "700", color: colors.text },
});
