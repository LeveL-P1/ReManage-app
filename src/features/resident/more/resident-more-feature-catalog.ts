import type {
  ResidentIconKey,
  ResidentModuleId,
} from "@/features/resident/catalog/resident-module-catalog";

export type ResidentMoreFeatureId = Exclude<ResidentModuleId, "my-bills" | "my-visitors">;
export type ResidentMoreFeatureHref = `/(resident)/more/${string}`;

export interface ResidentMoreFeatureDefinition {
  moduleId: ResidentMoreFeatureId;
  title: string;
  description: string;
  icon: ResidentIconKey;
  route: ResidentMoreFeatureHref;
  highlights: readonly [string, string, string];
}

export const residentMoreFeatures: readonly ResidentMoreFeatureDefinition[] = [
  { moduleId: "helpdesk", title: "Helpdesk", description: "Complaints, requests, and issue tracking", icon: "helpdesk", route: "/(resident)/more/helpdesk", highlights: ["Raise a clear service request", "Follow request updates", "Keep society conversations together"] },
  { moduleId: "sos", title: "SOS & Safety", description: "Emergency and security support", icon: "sos", route: "/(resident)/more/safety", highlights: ["Find emergency support contacts", "Understand the safety handoff", "Use the live alert flow when enabled"] },
  { moduleId: "announcements", title: "Announcements", description: "Society notices and circulars", icon: "announcement", route: "/(resident)/more/announcements", highlights: ["Read official updates", "Keep important notices handy", "See society circulars in one place"] },
  { moduleId: "parcels", title: "Parcel Desk", description: "Deliveries, collections, and history", icon: "parcel", route: "/(resident)/more/parcel-desk", highlights: ["Check delivery updates", "Track collections", "Review parcel history"] },
  { moduleId: "forum", title: "Discussion Forum", description: "Resident posts and conversations", icon: "forum", route: "/(resident)/more/discussion-forum", highlights: ["Start a resident conversation", "See community replies", "Keep discussions respectful"] },
  { moduleId: "events", title: "Events & Calendar", description: "Society programs and RSVP", icon: "event", route: "/(resident)/more/events-calendar", highlights: ["Browse upcoming programs", "Review RSVP details", "Save event reminders"] },
  { moduleId: "amenities", title: "Amenity Booking", description: "Book clubhouse and shared spaces", icon: "amenity", route: "/(resident)/more/amenity-booking", highlights: ["Check shared-space availability", "Review booking rules", "Request a slot when enabled"] },
  { moduleId: "marketplace", title: "Buy & Sell", description: "Resident marketplace", icon: "marketplace", route: "/(resident)/more/buy-sell", highlights: ["Browse resident listings", "Keep exchanges local", "Post a listing when enabled"] },
  { moduleId: "parking", title: "Parking", description: "Parking slots and registered vehicles", icon: "parking", route: "/(resident)/more/parking", highlights: ["Review your vehicle details", "Find parking information", "Keep visitor parking clear"] },
  { moduleId: "directory", title: "Resident Directory", description: "Find and connect with neighbours", icon: "directory", route: "/(resident)/more/resident-directory", highlights: ["Find approved resident contacts", "Respect privacy preferences", "Connect through the community"] },
  { moduleId: "staff", title: "Staff & Daily Help", description: "Helpers, staff, and attendance", icon: "staff", route: "/(resident)/more/staff-daily-help", highlights: ["Find household support", "Review staff details", "Keep attendance information organised"] },
  { moduleId: "society-noc", title: "Society NOC", description: "NOC requests and records", icon: "noc", route: "/(resident)/more/society-noc", highlights: ["Understand NOC requirements", "Prepare request details", "Keep records together"] },
  { moduleId: "meetings", title: "Meetings", description: "Agenda, minutes, and resolutions", icon: "meeting", route: "/(resident)/more/meetings", highlights: ["Read meeting agendas", "Review shared minutes", "Keep community decisions visible"] },
  { moduleId: "polls", title: "Polls & Voting", description: "Resident polls and decisions", icon: "poll", route: "/(resident)/more/polls-voting", highlights: ["See active community polls", "Review poll context", "Vote when a poll is open"] },
  { moduleId: "documents", title: "Document Vault", description: "Society records and documents", icon: "document", route: "/(resident)/more/document-vault", highlights: ["Find shared society records", "Review document categories", "Download when enabled"] },
  { moduleId: "move-in-out", title: "Move-In / Out", description: "Occupancy move requests", icon: "move", route: "/(resident)/more/move-in-out", highlights: ["Understand move requirements", "Prepare required details", "Request coordination when enabled"] },
];

export function getResidentMoreFeature(moduleId: ResidentModuleId) {
  return residentMoreFeatures.find((feature) => feature.moduleId === moduleId) ?? null;
}

export function getResidentMoreFeatureOrThrow(moduleId: ResidentMoreFeatureId) {
  const feature = getResidentMoreFeature(moduleId);
  if (!feature) throw new Error(`Unknown Resident More feature: ${moduleId}`);
  return feature;
}
