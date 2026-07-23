import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";

export interface ResidentVisitorsViewModel {
  unit: string;
  summary: {
    expectedCount: string;
    pendingCount: string;
    activityCount: string;
  };
  expectedVisitors: readonly {
    id: string;
    initials: string;
    name: string;
    context: string;
    expectedAt: string;
    status: "Pre-approved" | "Expected";
  }[];
  activity: readonly {
    id: string;
    icon: ResidentIconKey;
    title: string;
    detail: string;
    when: string;
  }[];
}

export const residentVisitorsFixture: ResidentVisitorsViewModel = {
  unit: "A-308",
  summary: { expectedCount: "2", pendingCount: "1", activityCount: "3" },
  expectedVisitors: [
    { id: "maya-shah", initials: "MS", name: "Maya Shah", context: "Family visit", expectedAt: "Expected at 6:30 PM", status: "Pre-approved" },
    { id: "arjun-kumar", initials: "AK", name: "Arjun Kumar", context: "Guest visit", expectedAt: "Expected at 7:15 PM", status: "Expected" },
  ],
  activity: [
    { id: "daily-help", icon: "staff", title: "Daily Help arrived", detail: "Meera checked in for A-308.", when: "9:08 AM" },
    { id: "parcel", icon: "parcel", title: "Parcel recorded", detail: "A delivery is waiting at the gate desk.", when: "Yesterday" },
  ],
};
