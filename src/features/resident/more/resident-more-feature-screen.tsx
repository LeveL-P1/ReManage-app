import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ResidentIcon } from "@/features/resident/shared/resident-icon";
import { residentTheme } from "@/platform/theme/tokens";
import type { ResidentMoreFeatureDefinition } from "./resident-more-feature-catalog";

export function ResidentMoreFeatureScreen({ feature }: { feature: ResidentMoreFeatureDefinition }) {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} style={styles.backControl}>
          <Ionicons color={residentTheme.ink} name="arrow-back" size={24} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>{feature.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}><ResidentIcon color={residentTheme.icon} name={feature.icon} size={34} /></View>
        <Text accessibilityRole="header" style={styles.title}>{feature.title}</Text>
        <Text style={styles.description}>{feature.description}</Text>

        <View style={styles.noticeCard}>
          <Ionicons color={residentTheme.icon} name="information-circle-outline" size={22} />
          <Text style={styles.noticeText}>This is a guided mobile preview.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>REMANAGE SERVICE</Text>
          {feature.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlight}>
              <Ionicons color={residentTheme.icon} name="checkmark-circle" size={20} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Ready when your society enables it</Text>
          <Text style={styles.previewDetail}>This preview does not submit, book, request, or change any live society record.</Text>
        </View>

        <Pressable accessibilityLabel="Back to More" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to More</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: residentTheme.canvas },
  header: { alignItems: "center", backgroundColor: residentTheme.header, borderBottomColor: residentTheme.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", height: 72, paddingHorizontal: 16 },
  backControl: { alignItems: "center", borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  headerTitle: { color: residentTheme.ink, flex: 1, fontSize: 17, fontWeight: "700", lineHeight: 22, textAlign: "center" },
  headerSpacer: { width: 44 },
  content: { alignItems: "center", paddingBottom: 44, paddingHorizontal: 24, paddingTop: 42 },
  heroIcon: { alignItems: "center", backgroundColor: residentTheme.surface, borderColor: residentTheme.border, borderRadius: 25, borderWidth: StyleSheet.hairlineWidth, height: 76, justifyContent: "center", width: 76 },
  title: { color: residentTheme.ink, fontSize: 27, fontWeight: "700", lineHeight: 34, marginTop: 22, textAlign: "center" },
  description: { color: residentTheme.muted, fontSize: 16, lineHeight: 23, marginTop: 9, maxWidth: 320, textAlign: "center" },
  noticeCard: { alignItems: "flex-start", alignSelf: "stretch", backgroundColor: `${residentTheme.icon}12`, borderRadius: 17, flexDirection: "row", gap: 9, marginTop: 25, padding: 15 },
  noticeText: { color: residentTheme.ink, flex: 1, fontSize: 14, lineHeight: 20 },
  card: { alignSelf: "stretch", backgroundColor: residentTheme.surface, borderColor: residentTheme.border, borderRadius: 21, borderWidth: StyleSheet.hairlineWidth, marginTop: 16, padding: 20 },
  eyebrow: { color: residentTheme.accent, fontSize: 11, fontWeight: "800", letterSpacing: 0.7, lineHeight: 16 },
  highlight: { alignItems: "center", flexDirection: "row", gap: 11, marginTop: 17 },
  highlightText: { color: residentTheme.ink, flex: 1, fontSize: 15, lineHeight: 21 },
  previewCard: { alignSelf: "stretch", backgroundColor: residentTheme.surface, borderRadius: 18, marginTop: 16, padding: 18 },
  previewTitle: { color: residentTheme.ink, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  previewDetail: { color: residentTheme.muted, fontSize: 13, lineHeight: 19, marginTop: 5 },
  backButton: { alignItems: "center", alignSelf: "stretch", borderColor: residentTheme.icon, borderRadius: 15, borderWidth: 2, height: 52, justifyContent: "center", marginTop: 18, paddingHorizontal: 18 },
  backButtonText: { color: residentTheme.icon, fontSize: 16, fontWeight: "700" },
});
