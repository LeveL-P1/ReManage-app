import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";
import { residentVisitorsFixture } from "./resident-visitors-fixtures";

export type ResidentVisitorFeatureId =
  | "pre-approve"
  | "invite-guest"
  | "daily-help"
  | "history"
  | "updates";

export type ResidentVisitorFeatureHref = `/(resident)/visitors/${string}`;

export interface ResidentVisitorFeatureDefinition {
  id: ResidentVisitorFeatureId;
  title: string;
  description: string;
  icon: ResidentIconKey;
  route: ResidentVisitorFeatureHref;
  highlights: readonly string[];
}

export const residentVisitorFeatures: readonly ResidentVisitorFeatureDefinition[] = [
  { id: "pre-approve", title: "Pre-Approve Visitor", description: "Prepare a clear approval before your guest reaches the gate.", icon: "visitor", route: "/(resident)/visitors/pre-approve", highlights: ["Add guest details", "Choose their visit window", "Review entry instructions"] },
  { id: "invite-guest", title: "Invite Guest", description: "Create a guest invitation to share when the visit is planned.", icon: "visitor", route: "/(resident)/visitors/invite-guest", highlights: ["Share a visit reference", "Keep arrival timing clear", "Update it when plans change"] },
  { id: "daily-help", title: "Daily Help", description: "Manage the trusted helpers who visit your residence.", icon: "staff", route: "/(resident)/visitors/daily-help", highlights: ["Review helper access", "Set expected days", "See entry updates"] },
  { id: "history", title: "Visitor History", description: "Review previous guest and helper entry updates in one place.", icon: "visitor", route: "/(resident)/visitors/history", highlights: ["Find recent visits", "Review arrival activity", "Keep entry context together"] },
  { id: "updates", title: "Today’s Visitor Updates", description: "See today's expected guests, approvals, and entry activity.", icon: "visitor", route: "/(resident)/visitors/updates", highlights: ["Expected arrivals", "Pending approvals", "Recent gate activity"] },
];

export const residentVisitorQuickActionIds: readonly ResidentVisitorFeatureId[] = [
  "pre-approve",
  "invite-guest",
  "daily-help",
  "history",
];

export function getResidentVisitorFeature(id: ResidentVisitorFeatureId) {
  const feature = residentVisitorFeatures.find((candidate) => candidate.id === id);
  if (!feature) throw new Error(`Unknown resident visitor feature: ${id}`);
  return feature;
}

export { residentVisitorsFixture };
