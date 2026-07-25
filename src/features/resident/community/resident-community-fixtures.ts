export interface ResidentCommunityViewModel {
  unit: string;
  stats: readonly { id: string; label: string; value: string }[];
  event: { title: string; detail: string };
  hostPrompt: { title: string; detail: string };
  safety: { title: string; detail: string };
  dues: { amount: string; detail: string };
  tenure: string;
  tribeCategories: readonly {
    id: string;
    title: string;
    initial: string;
    actionLabel: string;
  }[];
  dailyHelp: readonly {
    id: string;
    name: string;
    role: string;
    initials: string;
    online: boolean;
  }[];
}

export const residentCommunityFixture: ResidentCommunityViewModel = {
  unit: "A-308",
  stats: [
    { id: "homes", label: "Homes", value: "86" },
    { id: "pets", label: "Pets", value: "24" },
    { id: "directory", label: "Directory", value: "92%" },
  ],
  event: { title: "Sunday monsoon meetup", detail: "Clubhouse · 5:30 PM · 18 interested" },
  hostPrompt: { title: "Host a community activity", detail: "Propose a class, game, or resident gathering" },
  safety: { title: "Raise SOS", detail: "Contact society security immediately" },
  dues: { amount: "₹2,850 society dues", detail: "Invoice available · Due 30 July" },
  tenure: "Part of ReManage for 1 month",
  tribeCategories: [
    { id: "dance", title: "Dance", initial: "D", actionLabel: "Add Your Interest" },
    { id: "developer", title: "Software Developer", initial: "S", actionLabel: "Add Your Job" },
    { id: "mumbai", title: "Mumbai", initial: "M", actionLabel: "Add Your City" },
    { id: "pets", title: "Pets", initial: "P", actionLabel: "Add Your Pet" },
  ],
  dailyHelp: [
    { id: "asha", name: "Asha", role: "House help", initials: "A", online: true },
    { id: "sapna", name: "Sapna", role: "Cook", initials: "S", online: true },
    { id: "ravi", name: "Ravi", role: "Driver", initials: "R", online: false },
  ],
};
