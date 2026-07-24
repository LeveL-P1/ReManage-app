import { useRouter } from "expo-router";

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
      icon={feature.icon}
      notice="This is a guided mobile preview."
      onBack={() => router.back()}
      secondaryLabel="Back to More"
      title={feature.title}
    />
  );
}
