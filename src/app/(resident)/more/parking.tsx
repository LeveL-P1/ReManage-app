import { ResidentMoreFeatureScreen } from "@/features/resident/more/resident-more-feature-screen";
import { getResidentMoreFeatureOrThrow } from "@/features/resident/more/resident-more-feature-catalog";
export default function ParkingRoute() { return <ResidentMoreFeatureScreen feature={getResidentMoreFeatureOrThrow("parking")} />; }
