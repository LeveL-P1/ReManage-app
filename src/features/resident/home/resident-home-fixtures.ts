import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";

export interface ResidentHomeViewModel {
  unit: string;
  entryUpdates: readonly {
    id: string;
    label: string;
    detail: string;
    icon: ResidentIconKey;
    featureId: "order-now" | "pre-approve" | "daily-help";
  }[];
  posts: readonly {
    id: string;
    author: string;
    unit: string;
    when: string;
    initials: string;
    body: string;
    views: string;
    reactions: string;
  }[];
}

export const residentHomeFixture: ResidentHomeViewModel = {
  unit: "A-308",
  entryUpdates: [
    { id: "order-now", label: "Order now", detail: "Deliveries", icon: "parcel", featureId: "order-now" },
    { id: "pre-approve", label: "Pre-approve", detail: "Guest entry", icon: "visitor", featureId: "pre-approve" },
    { id: "daily-help", label: "Daily Help", detail: "Add a helper", icon: "staff", featureId: "daily-help" },
  ],
  posts: [
    {
      id: "water-pressure",
      author: "Society Office",
      unit: "Admin desk",
      when: "1 day ago",
      initials: "SO",
      body: "Water pressure may be lower between 11 AM and 1 PM on Saturday while the overhead tank is cleaned.",
      views: "28",
      reactions: "4",
    },
    {
      id: "parking-reminder",
      author: "Community Committee",
      unit: "Block A",
      when: "3 days ago",
      initials: "CC",
      body: "Please park only in your assigned slot. This keeps guest and emergency access clear for every resident.",
      views: "24",
      reactions: "6",
    },
  ],
};
