import { useRouter } from "expo-router";

import { ResidentPopOutScreen } from "@/features/resident/shared/resident-overlays";
import { getResidentHomeFeature, type ResidentHomeFeatureId } from "./resident-home-feature-catalog";

export function ResidentHomeFeatureScreen({ featureId }: { featureId: ResidentHomeFeatureId }) {
  const feature = getResidentHomeFeature(featureId);
  const router = useRouter();

  return (
    <ResidentPopOutScreen
      description={feature.description}
      eyebrow="REMANAGE HOME"
      highlights={feature.highlights}
      icon={feature.icon}
      onBack={() => router.back()}
      primaryAction={feature.primaryAction ? {
        label: feature.primaryAction.label,
        onPress: () => router.push(feature.primaryAction!.route),
      } : undefined}
      secondaryLabel="Back to Home"
      title={feature.title}
    />
  );
}
