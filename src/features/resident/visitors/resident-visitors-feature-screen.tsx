import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ResidentIcon } from "@/features/resident/shared/resident-icon";
import { residentTheme } from "@/platform/theme/tokens";
import { getResidentVisitorFeature, type ResidentVisitorFeatureId } from "./resident-visitors-feature-catalog";
import { residentVisitorsFixture } from "./resident-visitors-fixtures";

export function ResidentVisitorsFeatureScreen({ featureId }: { featureId: ResidentVisitorFeatureId }) {
  const feature = getResidentVisitorFeature(featureId);
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <FeatureHeader onClose={() => router.back()} title={feature.title} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}><ResidentIcon color={residentTheme.icon} name={feature.icon} size={34} /></View>
        <Text style={styles.title}>{feature.title}</Text>
        <Text style={styles.description}>{feature.description}</Text>
        <View style={styles.noticeCard}>
          <Ionicons color={residentTheme.accent} name="information-circle-outline" size={22} />
          <Text style={styles.noticeText}>This is a guided mobile preview; it does not create a live gate invitation.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>REMANAGE VISITORS</Text>
          {feature.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlight}>
              <Ionicons color={residentTheme.icon} name="checkmark-circle" size={20} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
        <Pressable accessibilityLabel="Back to Visitors" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Visitors</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export function ResidentVisitorDetailScreen({ visitorId }: { visitorId: string }) {
  const router = useRouter();
  const visitor = residentVisitorsFixture.expectedVisitors.find((candidate) => candidate.id === visitorId);
  const name = visitor?.name ?? "Visitor details";

  return (
    <View style={styles.screen}>
      <FeatureHeader onClose={() => router.back()} title={name} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.detailAvatar}><Text style={styles.detailInitials}>{visitor?.initials ?? "V"}</Text></View>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.description}>{visitor ? `${visitor.context} · ${visitor.expectedAt}` : "This visitor is no longer available in the demo list."}</Text>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>VISIT STATUS</Text>
          <View style={styles.highlight}>
            <Ionicons color={residentTheme.icon} name="checkmark-circle" size={20} />
            <Text style={styles.highlightText}>{visitor?.status ?? "No active status"}</Text>
          </View>
          <View style={styles.highlight}>
            <Ionicons color={residentTheme.icon} name="shield-checkmark-outline" size={20} />
            <Text style={styles.highlightText}>Gate updates will appear here when live visitor services are connected.</Text>
          </View>
        </View>
        <Pressable accessibilityLabel="Back to Visitors" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Visitors</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function FeatureHeader({ onClose, title }: { onClose(): void; title: string }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel={`Close ${title}`} accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
        <Ionicons color={residentTheme.ink} name="close" size={24} />
      </Pressable>
      <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
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
  detailAvatar: { width: 76, height: 76, borderRadius: 25, backgroundColor: "#E7DDC9", alignItems: "center", justifyContent: "center" },
  detailInitials: { color: residentTheme.icon, fontSize: 23, fontWeight: "800" },
  title: { marginTop: 22, color: residentTheme.ink, fontSize: 27, lineHeight: 34, fontWeight: "700", textAlign: "center" },
  description: { marginTop: 9, maxWidth: 320, color: residentTheme.muted, fontSize: 16, lineHeight: 23, textAlign: "center" },
  noticeCard: { alignSelf: "stretch", marginTop: 25, padding: 15, borderRadius: 17, backgroundColor: "#FFF0D6", flexDirection: "row", alignItems: "flex-start", gap: 9 },
  noticeText: { flex: 1, color: residentTheme.ink, fontSize: 14, lineHeight: 20 },
  card: { alignSelf: "stretch", marginTop: 16, padding: 20, borderRadius: 21, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border },
  eyebrow: { color: residentTheme.accent, fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 0.7 },
  highlight: { flexDirection: "row", gap: 11, alignItems: "center", marginTop: 17 },
  highlightText: { flex: 1, color: residentTheme.ink, fontSize: 15, lineHeight: 21 },
  backButton: { alignSelf: "stretch", height: 52, paddingHorizontal: 18, marginTop: 18, borderRadius: 15, borderWidth: 2, borderColor: residentTheme.icon, alignItems: "center", justifyContent: "center" },
  backButtonText: { color: residentTheme.icon, fontSize: 16, fontWeight: "700" },
});
