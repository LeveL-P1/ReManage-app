import { ResidentMoreFeatureScreen } from "@/features/resident/more/resident-more-feature-screen";
import { getResidentMoreFeatureOrThrow } from "@/features/resident/more/resident-more-feature-catalog";
export default function DiscussionForumRoute() { return <ResidentMoreFeatureScreen feature={getResidentMoreFeatureOrThrow("forum")} />; }
