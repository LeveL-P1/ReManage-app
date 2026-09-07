import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { MobileGuardPackage } from "@/platform/api/mobile-api-client";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { queryClient } from "@/platform/query/query-client";
import { colors, guardTheme } from "@/platform/theme/tokens";

type PackageStatusFilter = "all" | "received" | "notified" | "collected";

const statusFilters: readonly PackageStatusFilter[] = ["all", "received", "notified", "collected"];

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "The parcel request could not be completed.";
}

export function GuardParcelsScreen() {
  const { state } = useSession();
  const runAuthenticated = useAuthenticatedApi();
  const societyId = state.status === "authenticated" ? state.bootstrap.society.id : "unknown";
  const [status, setStatus] = useState<PackageStatusFilter>("all");
  const [flatQuery, setFlatQuery] = useState("");
  const [courierName, setCourierName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<MobileGuardPackage | null>(null);
  const [providedOtp, setProvidedOtp] = useState("");
  const [collectedBy, setCollectedBy] = useState("");

  const packagesQuery = useQuery({
    queryKey: ["guard", societyId, "packages", status],
    queryFn: () => runAuthenticated((api, token) => api.guardListPackages(token, status === "all" ? undefined : status)),
  });

  function invalidatePackages() {
    void queryClient.invalidateQueries({ queryKey: ["guard", societyId, "packages"] });
    void queryClient.invalidateQueries({ queryKey: ["guard", societyId, "overview"] });
  }

  const intakePackage = useMutation({
    mutationFn: () => runAuthenticated((api, token) => api.guardIntakePackage(token, {
      flatQuery,
      courierName: courierName.trim() || undefined,
      description: description.trim() || undefined,
    })),
    onSuccess: (created) => {
      setFlatQuery("");
      setCourierName("");
      setDescription("");
      setSelected(created);
      invalidatePackages();
    },
  });
  const notifyPackage = useMutation({
    mutationFn: (packageId: string) => runAuthenticated((api, token) => api.guardNotifyPackage(token, packageId)),
    onSuccess: (updated) => {
      setSelected(updated);
      invalidatePackages();
    },
  });
  const collectPackage = useMutation({
    mutationFn: (packageId: string) => runAuthenticated((api, token) => api.guardCollectPackage(token, packageId, {
      providedOtp,
      collectedBy: collectedBy.trim() || undefined,
    })),
    onSuccess: (updated) => {
      setSelected(updated);
      setProvidedOtp("");
      setCollectedBy("");
      invalidatePackages();
    },
  });
  const transitionPackage = useMutation({
    mutationFn: (input: { packageId: string; action: "return" | "mark_lost" }) =>
      runAuthenticated((api, token) => api.guardTransitionPackage(token, input.packageId, input.action)),
    onSuccess: (updated) => {
      setSelected(updated);
      invalidatePackages();
    },
  });

  const actionError = intakePackage.error ?? notifyPackage.error ?? collectPackage.error ?? transitionPackage.error;
  const canIntake = flatQuery.trim().length > 0;
  const canCollect = /^\d{4,8}$/.test(providedOtp);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Parcels</Text>
        <Text style={styles.subtitle}>Log deliveries, notify residents, and hand over parcels.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Log a new parcel</Text>
        <TextInput accessibilityLabel="Flat or unit" onChangeText={setFlatQuery} placeholder="Flat or unit" placeholderTextColor="#9B9B8D" style={styles.input} value={flatQuery} />
        <TextInput accessibilityLabel="Courier" onChangeText={setCourierName} placeholder="Courier (Amazon, Flipkart...)" placeholderTextColor="#9B9B8D" style={styles.input} value={courierName} />
        <TextInput accessibilityLabel="Description" onChangeText={setDescription} placeholder="Description (optional)" placeholderTextColor="#9B9B8D" style={styles.input} value={description} />
        <PrimaryButton
          disabled={!canIntake || intakePackage.isPending}
          label={intakePackage.isPending ? "Logging..." : "Log parcel"}
          onPress={() => intakePackage.mutate()}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Parcels</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Refresh parcels" onPress={() => void packagesQuery.refetch()} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>
        <View style={styles.filters}>
          {statusFilters.map((item) => (
            <Pressable accessibilityRole="button" accessibilityLabel={`Show ${item} parcels`} key={item} onPress={() => setStatus(item)} style={[styles.filter, status === item && styles.filterActive]}>
              <Text style={[styles.filterText, status === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        {packagesQuery.isLoading ? <ActivityIndicator color={guardTheme.highlight} /> : null}
        {packagesQuery.error ? <ErrorCard message={errorMessage(packagesQuery.error)} onRetry={() => void packagesQuery.refetch()} /> : null}
        {packagesQuery.data?.length === 0 ? <Text style={styles.empty}>No parcels in this view.</Text> : null}
        {packagesQuery.data?.map((item) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`Open parcel for ${item.flatNumber}`} key={item.id} onPress={() => setSelected(item)} style={styles.packageRow}>
            <View style={styles.packageCopy}>
              <Text style={styles.packageFlat}>{item.flatNumber}</Text>
              <Text style={styles.packageDetail}>{item.courierName ?? "Delivery"}{item.description ? ` · ${item.description}` : ""}</Text>
            </View>
            <Text style={styles.statusBadge}>{item.status}</Text>
          </Pressable>
        ))}
      </View>

      {selected ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Selected parcel</Text>
          <Text style={styles.packageFlat}>{selected.flatNumber}</Text>
          <Text style={styles.packageDetail}>{selected.courierName ?? "Delivery"} · {selected.status}</Text>
          {selected.pickupOtp ? <Text style={styles.helperText}>Pickup code: {selected.pickupOtp}</Text> : null}

          {selected.status === "received" ? (
            <PrimaryButton disabled={notifyPackage.isPending} label={notifyPackage.isPending ? "Notifying..." : "Notify resident"} onPress={() => notifyPackage.mutate(selected.id)} />
          ) : null}

          {(selected.status === "received" || selected.status === "notified") ? (
            <>
              <TextInput accessibilityLabel="Pickup code" keyboardType="number-pad" onChangeText={setProvidedOtp} placeholder="Pickup code" placeholderTextColor="#9B9B8D" style={styles.input} value={providedOtp} />
              <TextInput accessibilityLabel="Collected by" onChangeText={setCollectedBy} placeholder="Collected by (optional)" placeholderTextColor="#9B9B8D" style={styles.input} value={collectedBy} />
              <PrimaryButton disabled={!canCollect || collectPackage.isPending} label={collectPackage.isPending ? "Handing over..." : "Hand over parcel"} onPress={() => collectPackage.mutate(selected.id)} />
              <View style={styles.actionRow}>
                <SecondaryButton disabled={transitionPackage.isPending} label="Mark returned" onPress={() => transitionPackage.mutate({ packageId: selected.id, action: "return" })} />
                <SecondaryButton disabled={transitionPackage.isPending} label="Mark lost" onPress={() => transitionPackage.mutate({ packageId: selected.id, action: "mark_lost" })} />
              </View>
            </>
          ) : null}
        </View>
      ) : null}

      {actionError ? <ErrorCard message={errorMessage(actionError)} /> : null}
    </ScrollView>
  );
}

function PrimaryButton({ disabled, label, onPress }: { disabled?: boolean; label: string; onPress(): void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: Boolean(disabled) }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, (pressed || disabled) && styles.disabledButton]}>
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ disabled, label, onPress }: { disabled?: boolean; label: string; onPress(): void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: Boolean(disabled) }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.secondaryButton, (pressed || disabled) && styles.disabledButton]}>
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry?(): void }) {
  return (
    <View accessibilityRole="alert" style={styles.errorCard}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? <SecondaryButton label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: guardTheme.background, flex: 1 },
  content: { gap: 16, padding: 18, paddingBottom: 34 },
  header: { paddingTop: 8 },
  title: { color: guardTheme.text, fontSize: 30, fontWeight: "800" },
  subtitle: { color: "#D8D5BD", fontSize: 14, lineHeight: 20, marginTop: 5 },
  card: { backgroundColor: guardTheme.surface, borderRadius: 22, gap: 12, padding: 16 },
  sectionTitle: { color: guardTheme.text, fontSize: 18, fontWeight: "800" },
  input: { backgroundColor: "#333333", borderColor: "#464646", borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, color: guardTheme.text, minHeight: 46, paddingHorizontal: 12 },
  helperText: { color: "#C8C3A8", fontSize: 13, lineHeight: 18 },
  primaryButton: { alignItems: "center", backgroundColor: guardTheme.highlight, borderRadius: 12, minHeight: 48, justifyContent: "center", paddingHorizontal: 14 },
  primaryText: { color: colors.text, fontSize: 15, fontWeight: "800" },
  secondaryButton: { alignItems: "center", borderColor: guardTheme.highlight, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, minHeight: 48, justifyContent: "center", paddingHorizontal: 14, flex: 1 },
  secondaryText: { color: guardTheme.highlight, fontSize: 15, fontWeight: "800" },
  disabledButton: { opacity: 0.48 },
  listHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  refreshButton: { padding: 8 },
  refreshText: { color: guardTheme.highlight, fontWeight: "700" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filter: { borderColor: "#505050", borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingVertical: 8 },
  filterActive: { backgroundColor: guardTheme.highlight, borderColor: guardTheme.highlight },
  filterText: { color: guardTheme.text, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  filterTextActive: { color: colors.text },
  empty: { color: "#C8C3A8", fontSize: 14, lineHeight: 20 },
  packageRow: { alignItems: "center", backgroundColor: "#303030", borderRadius: 14, flexDirection: "row", gap: 12, padding: 13 },
  packageCopy: { flex: 1 },
  packageFlat: { color: guardTheme.text, fontSize: 16, fontWeight: "800" },
  packageDetail: { color: "#C8C3A8", fontSize: 13, lineHeight: 18, marginTop: 3 },
  statusBadge: { color: guardTheme.highlight, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  actionRow: { flexDirection: "row", gap: 10 },
  errorCard: { backgroundColor: "#4A2520", borderRadius: 16, gap: 10, padding: 14 },
  errorText: { color: "#FFE2DC", fontSize: 14, lineHeight: 20 },
});
