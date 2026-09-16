import { useRouter } from "expo-router";

import { ResidentPopOutScreen } from "@/features/resident/shared/resident-overlays";
import { getResidentVisitorFeature, type ResidentVisitorFeatureId } from "./resident-visitors-feature-catalog";

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
