import { ResidentMoreFeatureScreen } from "@/features/resident/more/resident-more-feature-screen";
import { getResidentMoreFeatureOrThrow } from "@/features/resident/more/resident-more-feature-catalog";
export default function BuySellRoute() { return <ResidentMoreFeatureScreen feature={getResidentMoreFeatureOrThrow("marketplace")} />; }
