import { ResidentMoreFeatureScreen } from "@/features/resident/more/resident-more-feature-screen";
import { getResidentMoreFeatureOrThrow } from "@/features/resident/more/resident-more-feature-catalog";
export default function HelpdeskRoute() { return <ResidentMoreFeatureScreen feature={getResidentMoreFeatureOrThrow("helpdesk")} />; }
