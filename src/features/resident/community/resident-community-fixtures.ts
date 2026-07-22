export interface ResidentCommunityViewModel {
  unit: string;
  stats: readonly { id: string; label: string; value: string }[];
  event: { title: string; detail: string };
  hostPrompt: { title: string; detail: string };
  safety: { title: string; detail: string };
  dues: { amount: string; detail: string };
  tenure: string;
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
};
