import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { ResidentPopOutScreen } from "@/features/resident/shared/resident-overlays";
import { residentTheme } from "@/platform/theme/tokens";
import { getResidentVisitorFeature, type ResidentVisitorFeatureId } from "./resident-visitors-feature-catalog";
import { residentVisitorsFixture } from "./resident-visitors-fixtures";

export function ResidentVisitorsFeatureScreen({ featureId }: { featureId: ResidentVisitorFeatureId }) {
  const feature = getResidentVisitorFeature(featureId);
  const router = useRouter();

  return (
    <ResidentPopOutScreen
      description={feature.description}
      eyebrow="REMANAGE VISITORS"
      highlights={feature.highlights}
      icon={feature.icon}
      notice="This is a guided mobile preview; it does not create a live gate invitation."
      noticeTone="warning"
      onBack={() => router.back()}
      secondaryLabel="Back to Visitors"
      title={feature.title}
    />
  );
}

export function ResidentVisitorDetailScreen({ visitorId }: { visitorId: string }) {
  const router = useRouter();
  const visitor = residentVisitorsFixture.expectedVisitors.find((candidate) => candidate.id === visitorId);
  const name = visitor?.name ?? "Visitor details";

  return (
    <ResidentPopOutScreen
      description={visitor ? `${visitor.context} · ${visitor.expectedAt}` : "This visitor is no longer available in the demo list."}
      eyebrow="VISIT STATUS"
      hero={(
        <View style={styles.detailAvatar}>
          <Text style={styles.detailInitials}>{visitor?.initials ?? "V"}</Text>
        </View>
      )}
      highlights={[
        visitor?.status ?? "No active status",
        "Gate updates will appear here when live visitor services are connected.",
      ]}
      onBack={() => router.back()}
      secondaryLabel="Back to Visitors"
      title={name}
    />
  );
}

const styles = StyleSheet.create({
  detailAvatar: { width: 76, height: 76, borderRadius: 25, backgroundColor: "#E7DDC9", alignItems: "center", justifyContent: "center" },
  detailInitials: { color: residentTheme.icon, fontSize: 23, fontWeight: "800" },
});
