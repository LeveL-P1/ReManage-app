import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { MobileGuardVisitor } from "@/platform/api/mobile-api-client";
import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { queryClient } from "@/platform/query/query-client";
import { colors, guardTheme } from "@/platform/theme/tokens";

type VisitorStatusFilter = "all" | "expected" | "inside" | "exited";

const statusFilters: readonly VisitorStatusFilter[] = ["all", "expected", "inside", "exited"];

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "The gate request could not be completed.";
}

export function GuardGateScreen() {
  const { state } = useSession();
  const runAuthenticated = useAuthenticatedApi();
  const societyId = state.status === "authenticated" ? state.bootstrap.society.id : "unknown";
  const [status, setStatus] = useState<VisitorStatusFilter>("all");
  const [flatQuery, setFlatQuery] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selected, setSelected] = useState<MobileGuardVisitor | null>(null);
  const [passcode, setPasscode] = useState("");
  const [lookupPasscode, setLookupPasscode] = useState("");

  const overviewQuery = useQuery({
    queryKey: ["guard", societyId, "overview"],
    queryFn: () => runAuthenticated((api, token) => api.guardOverview(token)),
  });
  const visitorsQuery = useQuery({
    queryKey: ["guard", societyId, "visitors", status],
    queryFn: () => runAuthenticated((api, token) => api.guardVisitors(token, status === "all" ? undefined : status)),
  });

  function invalidateGate() {
    void queryClient.invalidateQueries({ queryKey: ["guard", societyId] });
  }

  const requestVisitor = useMutation({
    mutationFn: () => runAuthenticated((api, token) => api.guardRequestVisitor(token, { flatQuery, visitorName, purpose })),
    onSuccess: (visitor) => {
      setFlatQuery("");
      setVisitorName("");
      setPurpose("");
      setSelected(visitor);
      invalidateGate();
    },
  });
  const verifyPasscode = useMutation({
    mutationFn: (visitorId: string) => runAuthenticated((api, token) => api.guardVerifyPasscode(token, visitorId, passcode)),
    onSuccess: () => setPasscode(""),
  });
  const lookupByPasscode = useMutation({
    mutationFn: () => runAuthenticated((api, token) => api.guardVerifyPasscodeLookup(token, lookupPasscode)),
    onSuccess: (visitor) => {
      setSelected(visitor);
      setLookupPasscode("");
      invalidateGate();
    },
  });
  const checkIn = useMutation({
    mutationFn: (visitorId: string) => runAuthenticated((api, token) => api.guardCheckIn(token, visitorId)),
    onSuccess: (visitor) => {
      setSelected(visitor);
      invalidateGate();
    },
  });
  const checkOut = useMutation({
    mutationFn: (visitorId: string) => runAuthenticated((api, token) => api.guardCheckOut(token, visitorId)),
    onSuccess: (visitor) => {
      setSelected(visitor);
      invalidateGate();
    },
  });

  const actionError = requestVisitor.error ?? lookupByPasscode.error ?? verifyPasscode.error ?? checkIn.error ?? checkOut.error;
  const canRequest = flatQuery.trim().length > 0 && visitorName.trim().length > 0 && purpose.trim().length > 0;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.title}>Gate</Text>
        <Text style={styles.subtitle}>Online guard desk for visitor requests and entry transitions.</Text>
      </View>

      {overviewQuery.isLoading ? <ActivityIndicator color={guardTheme.highlight} /> : null}
      {overviewQuery.error ? <ErrorCard message={errorMessage(overviewQuery.error)} onRetry={() => void overviewQuery.refetch()} /> : null}
      {overviewQuery.data ? (
        <View style={styles.overviewCard}>
          <Text style={styles.gateLabel}>{overviewQuery.data.gateLabel}</Text>
          <View style={styles.countGrid}>
            <CountTile label="Expected" value={overviewQuery.data.counts.expected} />
            <CountTile label="Inside" value={overviewQuery.data.counts.inside} />
            <CountTile label="Approval" value={overviewQuery.data.counts.pendingApproval} />
            <CountTile label="Parcels" value={overviewQuery.data.counts.pendingParcels} />
          </View>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Request visitor approval</Text>
        <TextInput accessibilityLabel="Flat or unit" onChangeText={setFlatQuery} placeholder="Flat or unit" placeholderTextColor="#9B9B8D" style={styles.input} value={flatQuery} />
        <TextInput accessibilityLabel="Visitor name" onChangeText={setVisitorName} placeholder="Visitor name" placeholderTextColor="#9B9B8D" style={styles.input} value={visitorName} />
        <TextInput accessibilityLabel="Visit purpose" onChangeText={setPurpose} placeholder="Purpose" placeholderTextColor="#9B9B8D" style={styles.input} value={purpose} />
        <PrimaryButton
          disabled={!canRequest || requestVisitor.isPending}
          label={requestVisitor.isPending ? "Requesting..." : "Request approval"}
          onPress={() => requestVisitor.mutate()}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Find approved visitor</Text>
        <Text style={styles.helperText}>Enter a passcode from a pre-approved visitor before check-in.</Text>
        <TextInput accessibilityLabel="Lookup passcode" keyboardType="number-pad" onChangeText={setLookupPasscode} placeholder="Passcode" placeholderTextColor="#9B9B8D" style={styles.input} value={lookupPasscode} />
        <PrimaryButton
          disabled={!lookupPasscode || lookupByPasscode.isPending}
          label={lookupByPasscode.isPending ? "Finding visitor..." : "Find visitor"}
          onPress={() => lookupByPasscode.mutate()}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Visitors</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Refresh visitors" onPress={() => void visitorsQuery.refetch()} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>
        <View style={styles.filters}>
          {statusFilters.map((item) => (
            <Pressable accessibilityRole="button" accessibilityLabel={`Show ${item} visitors`} key={item} onPress={() => setStatus(item)} style={[styles.filter, status === item && styles.filterActive]}>
              <Text style={[styles.filterText, status === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        {visitorsQuery.isLoading ? <ActivityIndicator color={guardTheme.highlight} /> : null}
        {visitorsQuery.error ? <ErrorCard message={errorMessage(visitorsQuery.error)} onRetry={() => void visitorsQuery.refetch()} /> : null}
        {visitorsQuery.data?.length === 0 ? <Text style={styles.empty}>No visitors in this view.</Text> : null}
        {visitorsQuery.data?.map((visitor) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`Open ${visitor.visitorName}`} key={visitor.id} onPress={() => setSelected(visitor)} style={styles.visitorRow}>
            <View style={styles.visitorCopy}>
              <Text style={styles.visitorName}>{visitor.visitorName}</Text>
              <Text style={styles.visitorDetail}>{visitor.flatNumber} · {visitor.purpose}</Text>
            </View>
            <Text style={styles.statusBadge}>{visitor.status}</Text>
          </Pressable>
        ))}
      </View>

      {selected ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Selected visitor</Text>
          <Text style={styles.visitorName}>{selected.visitorName}</Text>
          <Text style={styles.visitorDetail}>{selected.flatNumber} · {selected.purpose} · {selected.status}</Text>
          {selected.passcodeRequired ? (
            <>
              <TextInput accessibilityLabel="Visitor passcode" keyboardType="number-pad" onChangeText={setPasscode} placeholder="Passcode" placeholderTextColor="#9B9B8D" style={styles.input} value={passcode} />
              <SecondaryButton disabled={!passcode || verifyPasscode.isPending} label={verifyPasscode.isPending ? "Verifying..." : "Verify passcode"} onPress={() => verifyPasscode.mutate(selected.id)} />
            </>
          ) : null}
          <View style={styles.actionRow}>
            <PrimaryButton disabled={checkIn.isPending || selected.status === "inside" || selected.status === "exited"} label={checkIn.isPending ? "Checking in..." : "Check in"} onPress={() => checkIn.mutate(selected.id)} />
            <SecondaryButton disabled={checkOut.isPending || selected.status !== "inside"} label={checkOut.isPending ? "Checking out..." : "Check out"} onPress={() => checkOut.mutate(selected.id)} />
          </View>
        </View>
      ) : null}

      {actionError ? <ErrorCard message={errorMessage(actionError)} /> : null}
    </ScrollView>
  );
}

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.countTile}>
      <Text style={styles.countValue}>{value}</Text>
      <Text style={styles.countLabel}>{label}</Text>
    </View>
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
  overviewCard: { backgroundColor: guardTheme.surface, borderRadius: 22, gap: 14, padding: 16 },
  gateLabel: { color: guardTheme.highlight, fontSize: 18, fontWeight: "800" },
  countGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  countTile: { backgroundColor: "#303030", borderRadius: 16, minWidth: "47%", padding: 14 },
  countValue: { color: guardTheme.text, fontSize: 28, fontWeight: "800" },
  countLabel: { color: "#C8C3A8", fontSize: 12, marginTop: 3, textTransform: "uppercase" },
  card: { backgroundColor: guardTheme.surface, borderRadius: 22, gap: 12, padding: 16 },
  sectionTitle: { color: guardTheme.text, fontSize: 18, fontWeight: "800" },
  input: { backgroundColor: "#333333", borderColor: "#464646", borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, color: guardTheme.text, minHeight: 46, paddingHorizontal: 12 },
  helperText: { color: "#C8C3A8", fontSize: 13, lineHeight: 18 },
  primaryButton: { alignItems: "center", backgroundColor: guardTheme.highlight, borderRadius: 12, minHeight: 48, justifyContent: "center", paddingHorizontal: 14 },
  primaryText: { color: colors.charcoal, fontSize: 15, fontWeight: "800" },
  secondaryButton: { alignItems: "center", borderColor: guardTheme.highlight, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, minHeight: 48, justifyContent: "center", paddingHorizontal: 14 },
  secondaryText: { color: guardTheme.highlight, fontSize: 15, fontWeight: "800" },
  disabledButton: { opacity: 0.48 },
  listHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  refreshButton: { padding: 8 },
  refreshText: { color: guardTheme.highlight, fontWeight: "700" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filter: { borderColor: "#505050", borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingVertical: 8 },
  filterActive: { backgroundColor: guardTheme.highlight, borderColor: guardTheme.highlight },
  filterText: { color: guardTheme.text, fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  filterTextActive: { color: colors.charcoal },
  empty: { color: "#C8C3A8", fontSize: 14, lineHeight: 20 },
  visitorRow: { alignItems: "center", backgroundColor: "#303030", borderRadius: 14, flexDirection: "row", gap: 12, padding: 13 },
  visitorCopy: { flex: 1 },
  visitorName: { color: guardTheme.text, fontSize: 16, fontWeight: "800" },
  visitorDetail: { color: "#C8C3A8", fontSize: 13, lineHeight: 18, marginTop: 3 },
  statusBadge: { color: guardTheme.highlight, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  actionRow: { gap: 10 },
  errorCard: { backgroundColor: "#4A2520", borderRadius: 16, gap: 10, padding: 14 },
  errorText: { color: "#FFE2DC", fontSize: 14, lineHeight: 20 },
});
