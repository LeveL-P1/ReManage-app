export const residentProfileFixture = {
  initials: "A",
  name: "Alex S.",
  bio: "Hello! I have two cats! Would love to cat sit!",
  societyName: "Archana Paradise Phase 2",
  dashboard: [
    { id: "bookmarks", label: "Bookmarks", icon: "bookmark-outline" as const },
    { id: "events", label: "Events", icon: "calendar-outline" as const },
  ],
  favorite: {
    name: "Carlo's Cucina Italiana",
    detail: "72 · 131 Brighton Ave",
  },
  groups: [
    { id: "babysitting", initials: "B", name: "Babysitting", members: "223" },
    { id: "pets", initials: "P", name: "Pets", members: "118" },
  ],
};
