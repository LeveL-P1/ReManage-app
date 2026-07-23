import { ResidentMoreFeatureScreen } from "@/features/resident/more/resident-more-feature-screen";
import { getResidentMoreFeatureOrThrow } from "@/features/resident/more/resident-more-feature-catalog";
export default function SafetyRoute() { return <ResidentMoreFeatureScreen feature={getResidentMoreFeatureOrThrow("sos")} />; }
