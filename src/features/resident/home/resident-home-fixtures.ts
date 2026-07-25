import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";
import type { ResidentComment } from "@/features/resident/shared/resident-comments-sheet";

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
    comments: readonly ResidentComment[];
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
      comments: [
        {
          id: "c1",
          author: "Meera Shah",
          initials: "M",
          when: "6h",
          body: "Thanks for the heads-up. Will plan laundry accordingly.",
          likes: 3,
          replies: [
            {
              id: "c1-r1",
              author: "Society Office",
              initials: "S",
              when: "5h",
              body: "Appreciate the cooperation.",
              likes: 1,
            },
          ],
        },
        {
          id: "c2",
          author: "Arjun Kumar",
          initials: "A",
          when: "4h",
          body: "Will the clubhouse water supply also be affected?",
          likes: 1,
        },
      ],
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
      comments: [
        {
          id: "c3",
          author: "Priya Nair",
          initials: "P",
          when: "2d",
          body: "Could we get a reminder notice near visitor parking too?",
          likes: 5,
        },
      ],
    },
  ],
};
