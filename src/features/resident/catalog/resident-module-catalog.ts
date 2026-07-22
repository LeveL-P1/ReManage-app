export type ResidentPermission =
  | "dashboard.read"
  | "society:directory.read"
  | "society:finance.read"
  | "operations:visitor.respond"
  | "operations:read"
  | "operations:booking.manage"
  | "operations:sos.raise"
  | "community:read"
  | "community:helpdesk.respond"
  | "community:vote.cast"
  | "community:rsvp.manage"
  | "community:post"
  | "tenant:membership.read";

export type ResidentModuleId =
  | "my-bills"
  | "my-visitors"
  | "helpdesk"
  | "sos"
  | "announcements"
  | "parcels"
  | "forum"
  | "events"
  | "amenities"
  | "marketplace"
  | "parking"
  | "directory"
  | "staff"
  | "society-noc"
  | "meetings"
  | "polls"
  | "documents"
  | "move-in-out";

export type ResidentModuleGroup = "daily" | "community" | "governance";

export type ResidentIconKey =
  | "bill"
  | "visitor"
  | "helpdesk"
  | "sos"
  | "announcement"
  | "parcel"
  | "forum"
  | "event"
  | "amenity"
  | "marketplace"
  | "parking"
  | "directory"
  | "staff"
  | "noc"
  | "meeting"
  | "poll"
  | "document"
  | "move"
  | "more";

export type ResidentTabHref =
  | "/(resident)/(tabs)/visitors"
  | "/(resident)/(tabs)/bills";

export interface ResidentModuleDefinition {
  id: ResidentModuleId;
  label: string;
  description: string;
  group: ResidentModuleGroup;
  icon: ResidentIconKey;
  requiredPermissions: readonly ResidentPermission[];
  mobileRoute?: ResidentTabHref;
}

export const RESIDENT_DEMO_PERMISSIONS: readonly ResidentPermission[] = [
  "dashboard.read",
  "society:directory.read",
  "society:finance.read",
  "operations:visitor.respond",
  "operations:read",
  "operations:booking.manage",
  "operations:sos.raise",
  "community:read",
  "community:helpdesk.respond",
  "community:vote.cast",
  "community:rsvp.manage",
  "community:post",
] as const;

export const RESIDENT_MODULES: readonly ResidentModuleDefinition[] = [
  { id: "my-bills", label: "My Bills", description: "Maintenance dues, invoices, and payments", group: "daily", icon: "bill", requiredPermissions: ["society:finance.read"], mobileRoute: "/(resident)/(tabs)/bills" },
  { id: "my-visitors", label: "My Visitors", description: "Guest approvals, invitations, and history", group: "daily", icon: "visitor", requiredPermissions: ["operations:visitor.respond"], mobileRoute: "/(resident)/(tabs)/visitors" },
  { id: "helpdesk", label: "Helpdesk", description: "Complaints, requests, and issue tracking", group: "daily", icon: "helpdesk", requiredPermissions: ["community:helpdesk.respond"] },
  { id: "sos", label: "SOS & Safety", description: "Emergency and security support", group: "daily", icon: "sos", requiredPermissions: ["operations:sos.raise"] },
  { id: "announcements", label: "Announcements", description: "Society notices and circulars", group: "daily", icon: "announcement", requiredPermissions: ["community:read"] },
  { id: "parcels", label: "Parcel Desk", description: "Deliveries, collections, and history", group: "daily", icon: "parcel", requiredPermissions: ["operations:read"] },
  { id: "forum", label: "Discussion Forum", description: "Resident posts and conversations", group: "community", icon: "forum", requiredPermissions: ["community:post"] },
  { id: "events", label: "Events & Calendar", description: "Society programs and RSVP", group: "community", icon: "event", requiredPermissions: ["community:rsvp.manage"] },
  { id: "amenities", label: "Amenity Booking", description: "Book clubhouse and shared spaces", group: "community", icon: "amenity", requiredPermissions: ["operations:booking.manage"] },
  { id: "marketplace", label: "Buy & Sell", description: "Resident marketplace", group: "community", icon: "marketplace", requiredPermissions: ["community:read"] },
  { id: "parking", label: "Parking", description: "Parking slots and registered vehicles", group: "community", icon: "parking", requiredPermissions: ["operations:read"] },
  { id: "directory", label: "Resident Directory", description: "Find and connect with neighbours", group: "community", icon: "directory", requiredPermissions: ["society:directory.read"] },
  { id: "staff", label: "Staff & Daily Help", description: "Helpers, staff, and attendance", group: "community", icon: "staff", requiredPermissions: ["operations:read"] },
  { id: "society-noc", label: "Society NOC", description: "NOC requests and records", group: "governance", icon: "noc", requiredPermissions: ["society:finance.read"] },
  { id: "meetings", label: "Meetings", description: "Agenda, minutes, and resolutions", group: "governance", icon: "meeting", requiredPermissions: ["community:read"] },
  { id: "polls", label: "Polls & Voting", description: "Resident polls and decisions", group: "governance", icon: "poll", requiredPermissions: ["community:vote.cast"] },
  { id: "documents", label: "Document Vault", description: "Society records and documents", group: "governance", icon: "document", requiredPermissions: ["community:read"] },
  { id: "move-in-out", label: "Move-In / Out", description: "Occupancy move requests", group: "governance", icon: "move", requiredPermissions: ["tenant:membership.read"] },
] as const;

const groupLabels: Record<ResidentModuleGroup, string> = {
  daily: "Daily priorities",
  community: "Community & shared life",
  governance: "Governance & records",
};

export function filterResidentModules(permissions: readonly string[]) {
  const allowed = new Set(permissions);
  return RESIDENT_MODULES.filter((module) =>
    module.requiredPermissions.some((permission) => allowed.has(permission)),
  );
}

export function groupResidentModules(modules: readonly ResidentModuleDefinition[]) {
  return (["daily", "community", "governance"] as const)
    .map((id) => ({
      id,
      label: groupLabels[id],
      modules: modules.filter((module) => module.group === id),
    }))
    .filter(({ modules }) => modules.length > 0);
}
