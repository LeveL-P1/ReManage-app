import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ResidentIcon } from "@/features/resident/shared/resident-icon";
import { residentTheme } from "@/platform/theme/tokens";
import { getResidentHomeFeature, type ResidentHomeFeatureId } from "./resident-home-feature-catalog";

export function ResidentHomeFeatureScreen({ featureId }: { featureId: ResidentHomeFeatureId }) {
  const feature = getResidentHomeFeature(featureId);
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons color={residentTheme.ink} name="close" size={24} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>{feature.title}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}>
          <ResidentIcon color={residentTheme.icon} name={feature.icon} size={34} />
        </View>
        <Text style={styles.title}>{feature.title}</Text>
        <Text style={styles.description}>{feature.description}</Text>
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>REMANAGE HOME</Text>
          {feature.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlight}>
              <Ionicons color={residentTheme.accent} name="checkmark-circle" size={20} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
        {feature.primaryAction ? (
          <Pressable
            accessibilityLabel={feature.primaryAction.label}
            accessibilityRole="button"
            onPress={() => router.push(feature.primaryAction!.route)}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>{feature.primaryAction.label}</Text>
            <Ionicons color={residentTheme.surface} name="arrow-forward" size={20} />
          </Pressable>
        ) : null}
        <Pressable accessibilityLabel="Back to Home" accessibilityRole="button" onPress={() => router.back()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.canvas },
  header: { height: 72, paddingHorizontal: 16, backgroundColor: residentTheme.header, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: residentTheme.border, flexDirection: "row", alignItems: "center" },
  closeButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: residentTheme.ink, fontSize: 17, lineHeight: 22, fontWeight: "700", textAlign: "center" },
  headerSpacer: { width: 44 },
  content: { alignItems: "center", paddingHorizontal: 24, paddingTop: 42, paddingBottom: 44 },
  heroIcon: { width: 76, height: 76, borderRadius: 25, backgroundColor: residentTheme.surface, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border },
  title: { marginTop: 22, color: residentTheme.ink, fontSize: 27, lineHeight: 34, fontWeight: "700", textAlign: "center" },
  description: { marginTop: 9, maxWidth: 320, color: residentTheme.muted, fontSize: 16, lineHeight: 23, textAlign: "center" },
  card: { alignSelf: "stretch", marginTop: 30, padding: 20, borderRadius: 21, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border },
  cardEyebrow: { color: residentTheme.accent, fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 0.7 },
  highlight: { flexDirection: "row", gap: 11, alignItems: "center", marginTop: 17 },
  highlightText: { flex: 1, color: residentTheme.ink, fontSize: 15, lineHeight: 21 },
  primaryButton: { alignSelf: "stretch", height: 52, paddingHorizontal: 18, marginTop: 18, borderRadius: 15, backgroundColor: residentTheme.accent, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: residentTheme.surface, fontSize: 16, fontWeight: "700" },
  secondaryButton: { marginTop: 14, paddingVertical: 12, paddingHorizontal: 18 },
  secondaryButtonText: { color: residentTheme.icon, fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.76 },
});
