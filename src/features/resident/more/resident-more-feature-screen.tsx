import { useRouter } from "expo-router";
import { Image, StyleSheet, View } from "react-native";

import { ResidentPopOutScreen } from "@/features/resident/shared/resident-overlays";
import type { ResidentMoreFeatureDefinition } from "./resident-more-feature-catalog";

export function ResidentMoreFeatureScreen({ feature }: { feature: ResidentMoreFeatureDefinition }) {
  const router = useRouter();

  return (
    <ResidentPopOutScreen
      backIcon="arrow-back"
      backLabel="Back"
      description={feature.description}
      eyebrow="REMANAGE SERVICE"
      highlights={feature.highlights}
      hero={feature.moduleId === "sos" ? (
        <View style={styles.safetyHero}>
          <Image
            accessibilityLabel="Safety support illustration"
            accessibilityRole="image"
            resizeMode="contain"
            source={require("../../../../assets/images/resident-walkie-talkie.png")}
            style={styles.safetyIllustration}
          />
        </View>
      ) : undefined}
      icon={feature.icon}
      notice="This is a guided mobile preview."
      onBack={() => router.back()}
      secondaryLabel="Back to More"
      title={feature.title}
    />
  );
}

const styles = StyleSheet.create({
  safetyHero: { width: 124, height: 124, borderRadius: 32, overflow: "hidden", backgroundColor: "#E5F2F0", alignItems: "center", justifyContent: "center" },
  safetyIllustration: { width: 116, height: 116 },
});
