import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";

export type ResidentHomeFeatureId =
  | "customise"
  | "pre-approve"
  | "security"
  | "ask-society"
  | "posts"
  | "daily-help"
  | "raise-alert"
  | "pay-bills"
  | "more-actions"
  | "order-now"
  | "entry-updates"
  | "new-post"
  | "community-posts"
  | "older-posts"
  | "search"
  | "notifications"
  | "profile";

export type ResidentHomeFeatureHref = `/(resident)/home/${string}`;

export interface ResidentHomeFeatureDefinition {
  id: ResidentHomeFeatureId;
  title: string;
  description: string;
  icon: ResidentIconKey;
  route: ResidentHomeFeatureHref;
  requiredPermissions?: readonly string[];
  highlights: readonly string[];
  primaryAction?: { label: string; route: "/(resident)/(tabs)/visitors" | "/(resident)/(tabs)/bills" };
}

export const residentHomeFeatures: readonly ResidentHomeFeatureDefinition[] = [
  { id: "customise", title: "Customise Home", description: "Choose the actions you want at the top of Home.", icon: "more", route: "/(resident)/home/customise", highlights: ["Pin everyday tasks", "Keep the Home grid personal", "Changes stay on this device"] },
  { id: "pre-approve", title: "Pre-Approve", description: "Create a visitor approval before your guest reaches the gate.", icon: "visitor", route: "/(resident)/home/pre-approve", requiredPermissions: ["operations:visitor.respond"], highlights: ["Share a secure entry approval", "Set a visit date and time", "Review approvals from Home"], primaryAction: { label: "Open Visitors", route: "/(resident)/(tabs)/visitors" } },
  { id: "security", title: "Security", description: "Reach the security team for a gate or safety concern.", icon: "sos", route: "/(resident)/home/security", requiredPermissions: ["operations:sos.raise"], highlights: ["Contact the gate team", "Review security notices", "Keep emergency details ready"] },
  { id: "ask-society", title: "Ask Society", description: "Send a request or question to the society office.", icon: "helpdesk", route: "/(resident)/home/ask-society", requiredPermissions: ["community:helpdesk.respond"], highlights: ["Raise a maintenance request", "Track updates in one place", "Attach details when needed"] },
  { id: "posts", title: "Posts", description: "Read and join resident conversations.", icon: "forum", route: "/(resident)/home/posts", requiredPermissions: ["community:post"], highlights: ["See the latest updates", "Share a helpful post", "Keep conversations local"] },
  { id: "daily-help", title: "Find Daily Help", description: "Find and manage trusted household help in your society.", icon: "staff", route: "/(resident)/home/daily-help", requiredPermissions: ["operations:read"], highlights: ["Browse verified helpers", "Add your household staff", "Check attendance updates"] },
  { id: "raise-alert", title: "Raise Alert", description: "Send a safety alert when you need immediate assistance.", icon: "sos", route: "/(resident)/home/raise-alert", requiredPermissions: ["operations:sos.raise"], highlights: ["Alert security quickly", "Share a concise location", "Use only for urgent concerns"] },
  { id: "pay-bills", title: "Pay Bills", description: "Review maintenance dues and invoices before making a payment.", icon: "bill", route: "/(resident)/home/pay-bills", requiredPermissions: ["society:finance.read"], highlights: ["See current balance", "Review invoices", "Pay securely when ready"], primaryAction: { label: "Open Bills", route: "/(resident)/(tabs)/bills" } },
  { id: "more-actions", title: "View More", description: "Discover the remaining resident services available to you.", icon: "more", route: "/(resident)/home/more-actions", highlights: ["Amenities and bookings", "Documents and requests", "Community services"] },
  { id: "order-now", title: "Order Now", description: "Prepare for a delivery and keep the gate informed.", icon: "parcel", route: "/(resident)/home/order-now", requiredPermissions: ["operations:read"], highlights: ["Add delivery instructions", "Follow parcel updates", "Collect items from the gate"] },
  { id: "entry-updates", title: "Today's Entry Updates", description: "Review today’s visitor, delivery, and daily-help activity.", icon: "visitor", route: "/(resident)/home/entry-updates", highlights: ["No upcoming visitors yet", "Set up an approval", "Add trusted daily help"] },
  { id: "new-post", title: "New Community Post", description: "Start a clear, helpful conversation with your society.", icon: "forum", route: "/(resident)/home/new-post", requiredPermissions: ["community:post"], highlights: ["Choose the right category", "Keep personal details private", "Neighbours can respond in the thread"] },
  { id: "community-posts", title: "Community Posts", description: "View the complete stream of society updates and conversations.", icon: "forum", route: "/(resident)/home/community-posts", requiredPermissions: ["community:read"], highlights: ["Read recent discussions", "React thoughtfully", "Open a post to reply"] },
  { id: "older-posts", title: "Older Community Posts", description: "Browse posts that are outside your current Home feed.", icon: "forum", route: "/(resident)/home/older-posts", requiredPermissions: ["community:read"], highlights: ["Search past discussions", "Find older notices", "Return to the latest feed anytime"] },
  { id: "search", title: "Search Society", description: "Search resident services, updates, and useful information.", icon: "directory", route: "/(resident)/home/search", highlights: ["Find a resident service", "Look up a notice", "Search stays within your society"] },
  { id: "notifications", title: "Notifications", description: "Keep track of visitor, bill, and community updates.", icon: "announcement", route: "/(resident)/home/notifications", highlights: ["Visitor changes", "Payment reminders", "Community updates"] },
  { id: "profile", title: "Resident Profile", description: "Review the information linked to your residence.", icon: "directory", route: "/(resident)/home/profile", highlights: ["Residence details", "Contact preferences", "Account settings"] },
];

export const residentHomeQuickActionIds: readonly ResidentHomeFeatureId[] = [
  "pre-approve",
  "security",
  "ask-society",
  "posts",
  "daily-help",
  "raise-alert",
  "pay-bills",
  "more-actions",
];

export function getResidentHomeFeature(id: ResidentHomeFeatureId) {
  const feature = residentHomeFeatures.find((candidate) => candidate.id === id);
  if (!feature) throw new Error(`Unknown resident Home feature: ${id}`);
  return feature;
}

export function canUseResidentHomeFeature(feature: ResidentHomeFeatureDefinition, permissions: readonly string[]) {
  if (!feature.requiredPermissions?.length) return true;
  const allowed = new Set(permissions);
  return feature.requiredPermissions.some((permission) => allowed.has(permission));
}
