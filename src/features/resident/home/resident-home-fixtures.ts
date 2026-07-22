export interface ResidentHomeViewModel {
  unit: string;
  heroTitle: string;
  heroMessage: string;
  heroStatus: string;
  stats: readonly { id: string; label: string; value: string; detail: string }[];
  dues: { amount: string; dueLabel: string };
  activity: readonly { id: string; title: string; detail: string; icon: "visitor" | "parcel" }[];
  community: { title: string; detail: string };
  notice: { title: string; detail: string; body: string };
}

export const residentHomeFixture: ResidentHomeViewModel = {
  unit: "A-308",
  heroTitle: "Your society, at a glance",
  heroMessage: "Everything important in one place.",
  heroStatus: "All clear today",
  stats: [
    { id: "visitors", label: "Visitors", value: "2", detail: "Expected today" },
    { id: "parcels", label: "Parcels", value: "1", detail: "At the gate" },
    { id: "dues", label: "Outstanding", value: "₹2,850", detail: "Due 30 July" },
  ],
  dues: { amount: "₹2,850", dueLabel: "Maintenance due in 8 days" },
  activity: [
    { id: "visitor-riya", title: "Visitor approved", detail: "Riya Sharma · 10:42 AM", icon: "visitor" },
    { id: "parcel-gate", title: "Parcel at the gate", detail: "Collect from security", icon: "parcel" },
  ],
  community: { title: "Sunday monsoon meetup", detail: "Clubhouse · 5:30 PM · 18 interested" },
  notice: {
    title: "Water tank cleaning notice",
    detail: "Society Office · 1 hour ago",
    body: "Supply will pause from 11 AM to 1 PM this Saturday.",
  },
};
