import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuthenticatedApi, useSession } from "@/platform/auth/session-provider";
import { residentTheme } from "@/platform/theme/tokens";

const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical", description: "Immediate danger — fire, medical emergency, active threat", color: "#C62828" },
  { value: "high", label: "High", description: "Serious safety concern requiring urgent attention", color: "#E65100" },
  { value: "medium", label: "Medium", description: "Non-urgent safety issue that should be reported", color: "#F57F17" },
  { value: "low", label: "Low", description: "Minor concern or suspicious activity observation", color: "#2E7D32" },
] as const;

type SeverityValue = (typeof SEVERITY_OPTIONS)[number]["value"];

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "SOS could not be sent. Please try again.";
}

export function ResidentSosScreen() {
  const runAuthenticated = useAuthenticatedApi();
  const { state } = useSession();
  const societyName = state.status === "authenticated" ? state.bootstrap.society.name : "your society";
  const [severity, setSeverity] = useState<SeverityValue>("critical");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const raiseSos = useMutation({
    mutationFn: () =>
      runAuthenticated((api, token) =>
        api.raiseSos(token, {
          description: description.trim() || undefined,
          severity,
        }),
      ),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.centerContent}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}><Ionicons color="#fff" name="checkmark-circle" size={48} /></View>
            <Text accessibilityRole="header" style={styles.successTitle}>Alert Sent</Text>
            <Text style={styles.successDescription}>
              Your SOS has been raised and security at {societyName} has been notified. Stay where you are if safe to do so.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => { setSubmitted(false); setDescription(""); setSeverity("critical"); }}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryText}>Raise Another Alert</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerIcon}><Ionicons color="#fff" name="warning-outline" size={32} /></View>
          <Text accessibilityRole="header" style={styles.title}>Raise SOS</Text>
          <Text style={styles.subtitle}>Send an emergency alert to {societyName} security immediately.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Alert severity</Text>
          <Text style={styles.helperText}>Higher severity levels notify more people.</Text>
          <View style={styles.severityGrid}>
            {SEVERITY_OPTIONS.map((option) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${option.label} severity`}
                accessibilityState={{ selected: severity === option.value }}
                key={option.value}
                onPress={() => setSeverity(option.value)}
                style={({ pressed }) => [
                  styles.severityTile,
                  { borderColor: option.color },
                  severity === option.value && { backgroundColor: option.color },
                  (pressed || raiseSos.isPending) && styles.pressed,
                ]}
              >
                <Text style={[styles.severityLabel, severity === option.value && styles.severityLabelActive]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.severityDescription}>{SEVERITY_OPTIONS.find((o) => o.value === severity)?.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What's happening?</Text>
          <Text style={styles.helperText}>Optional — share a brief description if you can.</Text>
          <Pressable style={styles.textArea}>
            <Text
              style={[styles.textAreaText, !description && styles.textAreaPlaceholder]}
              numberOfLines={4}
            >
              {description || "e.g. Fire in Block B parking, medical emergency in flat A-308..."}
            </Text>
          </Pressable>
        </View>

        {raiseSos.error ? <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage(raiseSos.error)}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send SOS alert"
          disabled={raiseSos.isPending}
          onPress={() => raiseSos.mutate()}
          style={({ pressed }) => [styles.sosButton, (pressed || raiseSos.isPending) && styles.pressed]}
        >
          <Ionicons color="#fff" name="alert-circle" size={22} />
          <Text style={styles.sosButtonText}>{raiseSos.isPending ? "Sending Alert..." : "Send SOS Alert"}</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Only use SOS for genuine emergencies. Misuse may result in account restrictions.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#1A1A1A" },
  scrollContent: { gap: 16, padding: 18, paddingBottom: 48 },
  centerContent: { flex: 1, justifyContent: "center", padding: 18 },
  header: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  headerIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: "#C62828", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  title: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", textAlign: "center" },
  subtitle: { color: "#B0B0B0", fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 6 },
  card: { backgroundColor: "#2A2A2A", borderRadius: 20, gap: 12, padding: 16 },
  sectionTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  helperText: { color: "#9E9E9E", fontSize: 13, lineHeight: 18 },
  severityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  severityTile: { flex: 1, minWidth: "47%", borderWidth: 2, borderRadius: 14, minHeight: 48, alignItems: "center", justifyContent: "center" },
  severityLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  severityLabelActive: { color: "#FFFFFF" },
  severityDescription: { color: "#B0B0B0", fontSize: 13, lineHeight: 18, marginTop: 4 },
  textArea: { backgroundColor: "#333333", borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: "#444444", minHeight: 100, padding: 14, justifyContent: "flex-start" },
  textAreaText: { color: "#FFFFFF", fontSize: 15, lineHeight: 22 },
  textAreaPlaceholder: { color: "#777777" },
  sosButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#C62828", borderRadius: 16, minHeight: 56, paddingHorizontal: 20 },
  sosButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  disclaimer: { color: "#6E6E6E", fontSize: 12, lineHeight: 17, textAlign: "center" },
  errorText: { color: "#FF8A80", fontSize: 13, lineHeight: 18 },
  successCard: { backgroundColor: "#2A2A2A", borderRadius: 24, gap: 16, padding: 24, alignItems: "center" },
  successIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: "#2E7D32", alignItems: "center", justifyContent: "center" },
  successTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  successDescription: { color: "#B0B0B0", fontSize: 14, lineHeight: 21, textAlign: "center" },
  secondaryButton: { borderWidth: 1, borderColor: "#555555", borderRadius: 14, minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  secondaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.74 },
});
