import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";

const iconNames: Record<ResidentIconKey, ComponentProps<typeof Ionicons>["name"]> = {
  bill: "card-outline",
  visitor: "person-add-outline",
  helpdesk: "chatbox-ellipses-outline",
  sos: "warning-outline",
  announcement: "megaphone-outline",
  parcel: "cube-outline",
  forum: "chatbubbles-outline",
  event: "calendar-outline",
  amenity: "business-outline",
  marketplace: "bag-handle-outline",
  parking: "car-outline",
  directory: "book-outline",
  staff: "people-outline",
  noc: "document-attach-outline",
  meeting: "clipboard-outline",
  poll: "stats-chart-outline",
  document: "folder-open-outline",
  move: "swap-horizontal-outline",
};

export function ResidentIcon({
  name,
  color,
  size = 24,
}: {
  name: ResidentIconKey;
  color?: string;
  size?: number;
}) {
  return <Ionicons color={color} name={iconNames[name]} size={size} />;
}
