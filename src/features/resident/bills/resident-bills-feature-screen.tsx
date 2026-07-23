import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ResidentIcon } from "@/features/resident/shared/resident-icon";
import { residentTheme } from "@/platform/theme/tokens";
import { getResidentBillsFeature, type ResidentBillsFeatureId } from "./resident-bills-feature-catalog";
import { residentBillsFixture } from "./resident-bills-fixtures";

export function ResidentBillsFeatureScreen({ featureId }: { featureId: ResidentBillsFeatureId }) {
  const feature = getResidentBillsFeature(featureId);
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
          <Text style={styles.noticeText}>This is a guided mobile preview; it does not initiate a live payment.</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>REMANAGE BILLS</Text>
          {feature.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlight}>
              <Ionicons color={residentTheme.icon} name="checkmark-circle" size={20} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
        <Pressable accessibilityLabel="Back to Bills" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Bills</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

export function ResidentBillInvoiceScreen() {
  const router = useRouter();
  const invoice = residentBillsFixture.latestInvoice;

  return (
    <View style={styles.screen}>
      <FeatureHeader onClose={() => router.back()} title={invoice.period} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroIcon}><ResidentIcon color={residentTheme.icon} name="document" size={34} /></View>
        <Text style={styles.title}>{invoice.title}</Text>
        <Text style={styles.description}>{invoice.period} · {invoice.dueDate}</Text>
        <View style={styles.invoiceAmountCard}>
          <Text style={styles.eyebrow}>AMOUNT DUE</Text>
          <Text style={styles.invoiceAmount}>{invoice.amount}</Text>
          <Text style={styles.invoiceDetail}>This preview keeps the invoice amount visible without creating a payment or receipt.</Text>
        </View>
        <Pressable accessibilityLabel="Back to Bills" accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to Bills</Text>
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
  title: { marginTop: 22, color: residentTheme.ink, fontSize: 27, lineHeight: 34, fontWeight: "700", textAlign: "center" },
  description: { marginTop: 9, maxWidth: 320, color: residentTheme.muted, fontSize: 16, lineHeight: 23, textAlign: "center" },
  noticeCard: { alignSelf: "stretch", marginTop: 25, padding: 15, borderRadius: 17, backgroundColor: "#FFF0D6", flexDirection: "row", alignItems: "flex-start", gap: 9 },
  noticeText: { flex: 1, color: residentTheme.ink, fontSize: 14, lineHeight: 20 },
  card: { alignSelf: "stretch", marginTop: 16, padding: 20, borderRadius: 21, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border },
  eyebrow: { color: residentTheme.accent, fontSize: 11, lineHeight: 16, fontWeight: "800", letterSpacing: 0.7 },
  highlight: { flexDirection: "row", gap: 11, alignItems: "center", marginTop: 17 },
  highlightText: { flex: 1, color: residentTheme.ink, fontSize: 15, lineHeight: 21 },
  invoiceAmountCard: { alignSelf: "stretch", marginTop: 27, padding: 22, borderRadius: 21, backgroundColor: residentTheme.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: residentTheme.border },
  invoiceAmount: { color: residentTheme.ink, fontSize: 34, lineHeight: 42, fontWeight: "800", marginTop: 8 },
  invoiceDetail: { color: residentTheme.muted, fontSize: 14, lineHeight: 20, marginTop: 7 },
  backButton: { alignSelf: "stretch", height: 52, paddingHorizontal: 18, marginTop: 18, borderRadius: 15, borderWidth: 2, borderColor: residentTheme.icon, alignItems: "center", justifyContent: "center" },
  backButtonText: { color: residentTheme.icon, fontSize: 16, fontWeight: "700" },
});
