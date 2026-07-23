import { ResidentMoreFeatureScreen } from "@/features/resident/more/resident-more-feature-screen";
import { getResidentMoreFeatureOrThrow } from "@/features/resident/more/resident-more-feature-catalog";
export default function MoveInOutRoute() { return <ResidentMoreFeatureScreen feature={getResidentMoreFeatureOrThrow("move-in-out")} />; }
