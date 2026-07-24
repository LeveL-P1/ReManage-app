export type NotificationTabId = "neighborhood" | "activity" | "alerts";

export interface ResidentNotificationItem {
  id: string;
  tab: NotificationTabId;
  section: string;
  author: string;
  initials: string;
  avatarColor: string;
  action: string;
  when: string;
}

export const residentNotificationsFixture: readonly {
  title: string;
  tab: NotificationTabId;
  data: ResidentNotificationItem[];
}[] = [
  {
    title: "Today",
    tab: "neighborhood",
    data: [
      { id: "n1", tab: "neighborhood", section: "Today", author: "Ava O'Malley", initials: "A", avatarColor: "#6A8CAF", action: "posted: Hi parents!", when: "4h" },
      { id: "n2", tab: "neighborhood", section: "Today", author: "Community Office", initials: "C", avatarColor: "#123D41", action: "shared a water supply update.", when: "6h" },
    ],
  },
  {
    title: "Last 7 days",
    tab: "neighborhood",
    data: [
      { id: "n3", tab: "neighborhood", section: "Last 7 days", author: "Rahul Mehta", initials: "R", avatarColor: "#8B6A4F", action: "asked about parking in Block A.", when: "1d" },
      { id: "n4", tab: "neighborhood", section: "Last 7 days", author: "Society Committee", initials: "S", avatarColor: "#FF5400", action: "posted meeting minutes.", when: "3d" },
    ],
  },
  {
    title: "Today",
    tab: "activity",
    data: [
      { id: "a1", tab: "activity", section: "Today", author: "You", initials: "D", avatarColor: "#123D41", action: "liked a community post.", when: "2h" },
    ],
  },
  {
    title: "Last 7 days",
    tab: "activity",
    data: [
      { id: "a2", tab: "activity", section: "Last 7 days", author: "You", initials: "D", avatarColor: "#123D41", action: "viewed your July invoice.", when: "2d" },
    ],
  },
  {
    title: "Today",
    tab: "alerts",
    data: [
      { id: "l1", tab: "alerts", section: "Today", author: "ReManage", initials: "R", avatarColor: "#C62828", action: "sent a payment reminder for July dues.", when: "1h" },
    ],
  },
];
