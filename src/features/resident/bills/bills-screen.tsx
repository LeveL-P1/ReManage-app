import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuthenticatedApi } from "@/platform/auth/use-authenticated-api";

import { ScreenContainer, SafeScrollView, SectionHeader, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh } from "./heroui-ui";
import { Card, Text, View, Icon, Divider, Button, ListGroup, Surface, Avatar } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";

export function BillsScreen() {
  const router = useRouter();
  const runAuthenticated = useAuthenticatedApi();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const accessToken = await runAuthenticated(() => Promise.resolve(""));
      const result = await runAuthenticated((api) => api.listBills(accessToken));
      setBills(result.bills || []);
    } catch (err: any) {
      setError(err.message || "Failed to load bills");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleRefresh = () => fetchBills(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  const renderBill = (bill: any) => {
    const isPaid = bill.status === "paid";
    const isOverdue = bill.status === "overdue";
    const statusConfig = {
      paid: { color: "success", label: "Paid" },
      pending: { color: "warning", label: "Pending" },
      overdue: { color: "danger", label: "Overdue" },
      partial: { color: "primary", label: "Partial" },
    };
    const config = statusConfig[bill.status as keyof typeof statusConfig] || { color: "secondary", label: bill.status };

    return (
      <Card style={styles.billCard} onPress={() => router.push(`/bills/${bill.id}`)}>
        <View style={styles.billHeader}>
          <View style={styles.billTitleRow}>
            <View style={styles.billIcon}>
              <Icon name="receipt-outline" size={24} color={isPaid ? "#10B981" : isOverdue ? "#EF4444" : "#F59E0B"} />
            </View>
            <View style={styles.billTitleContent}>
              <Text style={styles.billTitle}>{bill.title || `Bill #${bill.id.slice(0, 8)}`}</Text>
              <Text style={styles.billPeriod}>{bill.period || bill.billingPeriod}</Text>
            </View>
          </View>
          <View style={styles.billAmountRow}>
            <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
            <StatusBadge status={bill.status as any} />
          </View>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.billDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "-"}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Status</Text>
            <StatusBadge status={bill.status as any} />
          </View>
          {bill.paidAmount && bill.paidAmount > 0 && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Paid</Text>
              <Text style={styles.detailValue}>{formatCurrency(bill.paidAmount)}</Text>
            </View>
          )}
        </View>
        {!isPaid && (
          <View style={styles.billAction}>
            <Button variant="primary" size="sm" onPress={() => router.push(`/bills/${bill.id}/pay`)}>
              {isOverdue ? "Pay Now (Overdue)" : "Pay Now"}
            </Button>
          </View>
        )}
      </Card>
    );
  };

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchBills} /></ScreenContainer>;

  const pendingBills = bills.filter(b => b.status !== "paid");
  const paidBills = bills.filter(b => b.status === "paid");

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.pageTitle}>Bills</Text>
            </View>
          </View>
          {bills.length === 0 ? (
            <EmptyState
              icon="card-outline"
              title="No bills"
              description="You don't have any bills at the moment."
            />
          ) : (
            <>
              {pendingBills.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Pending" />
                  <ListGroup style={styles.list}>
                    {pendingBills.map((bill) => (
                      <ListGroup.Item key={bill.id} style={styles.listItem}>
                        {renderBill(bill)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </View>
              )}
              {paidBills.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Paid" />
                  <ListGroup style={styles.list}>
                    {paidBills.map((bill) => (
                      <ListGroup.Item key={bill.id} style={styles.listItem}>
                        {renderBill(bill)}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </View>
              )}
            </>
          )}
        </SafeScrollView>
      </PullToRefresh>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#111827" },
  billCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  billHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  billTitleRow: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  billIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#FEF3C7", alignItems: "center", justifyContent: "center" },
  billTitleContent: { flex: 1 },
  billTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  billPeriod: { fontSize: 12, color: "#9CA3AF" },
  billAmountRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  billAmount: { fontSize: 20, fontWeight: "700", color: "#111827" },
  divider: { marginVertical: 8 },
  billDetails: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 8 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  detailLabel: { fontSize: 12, color: "#9CA3AF" },
  detailValue: { fontSize: 12, fontWeight: "500", color: "#111827" },
  billAction: { paddingTop: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  section: { marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
});