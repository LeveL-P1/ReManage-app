import { useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/platform/auth/session-provider";

import { ScreenContainer, SafeScrollView, EmptyState, LoadingState, ErrorState, StatusBadge, PullToRefresh, PressableCard, RNView, Divider } from "../shared/heroui-ui";
import { Card, Text, ListGroup } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { formatDistanceToNow } from "date-fns";
import type { MobileResidentPackage } from "@/platform/api/mobile-api-client";

const STATUS_CONFIG: Record<string, { status: "active" | "pending" | "completed" | "cancelled"; label: string }> = {
  received: { status: "pending", label: "At the gate" },
  notified: { status: "active", label: "Ready for pickup" },
  collected: { status: "completed", label: "Collected" },
  returned: { status: "cancelled", label: "Returned" },
  lost: { status: "cancelled", label: "Lost" },
};

export function ResidentParcelsScreen() {
  const runAuthenticated = useAuthenticatedApi();
  const [flatNumber, setFlatNumber] = useState<string | null>(null);
  const [packages, setPackages] = useState<MobileResidentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const result = await runAuthenticated((api, token) => api.residentPackages(token));
      setFlatNumber(result.flatNumber ?? null);
      setPackages(result.packages ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load parcels");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleRefresh = () => fetchPackages(true);

  const renderPackage = (item: MobileResidentPackage) => {
    const config = STATUS_CONFIG[item.status] ?? { status: "pending" as const, label: item.status };
    const canPickup = item.status === "received" || item.status === "notified";

    return (
      <PressableCard style={styles.card}>
        <Card>
          <RNView style={styles.headerRow}>
            <RNView style={styles.titleRow}>
              <Ionicons name="cube" size={20} color="#9CA3AF" />
              <Text style={styles.courier}>{item.courierName ?? "Delivery"}</Text>
            </RNView>
            <StatusBadge status={config.status} label={config.label} />
          </RNView>
          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
          <Divider style={styles.divider} />
          <RNView style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color="#9CA3AF" />
            <Text style={styles.metaText}>Arrived {formatDistanceToNow(new Date(item.receivedAt), { addSuffix: true })}</Text>
          </RNView>
          {canPickup && item.pickupOtp ? (
            <RNView style={styles.otpBox}>
              <Text style={styles.otpLabel}>Share this pickup code with whoever collects it</Text>
              <Text style={styles.otpValue}>{item.pickupOtp}</Text>
            </RNView>
          ) : null}
        </Card>
      </PressableCard>
    );
  };

  if (loading) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error) return <ScreenContainer><ErrorState message={error} onRetry={fetchPackages} /></ScreenContainer>;

  return (
    <ScreenContainer>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <SafeScrollView>
          <RNView style={styles.header}>
            <Text style={styles.pageTitle}>Parcel Desk</Text>
            {flatNumber ? <Text style={styles.flatText}>{flatNumber}</Text> : null}
          </RNView>
          {packages.length === 0 ? (
            <EmptyState
              icon="cube-outline"
              title="No parcels"
              description="Deliveries logged at the gate for your flat will show up here."
            />
          ) : (
            <ListGroup style={styles.list}>
              {packages.map((item) => (
                <ListGroup.Item key={item.id} style={styles.listItem}>
                  {renderPackage(item)}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </SafeScrollView>
      </PullToRefresh>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  pageTitle: { fontSize: 24, fontWeight: "700", color: "#111827" },
  flatText: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  card: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  courier: { fontSize: 16, fontWeight: "600", color: "#111827" },
  description: { fontSize: 14, color: "#6B7280", marginTop: 6 },
  divider: { marginVertical: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12, color: "#6B7280" },
  otpBox: { marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: "#FFF7ED", alignItems: "center" },
  otpLabel: { fontSize: 12, color: "#9A3412", marginBottom: 4, textAlign: "center" },
  otpValue: { fontSize: 22, fontWeight: "700", color: "#9A3412", letterSpacing: 4 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  listItem: { borderWidth: 0, backgroundColor: "transparent" },
});
