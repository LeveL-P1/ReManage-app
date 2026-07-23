import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";
import { residentBillsFixture } from "./resident-bills-fixtures";

export type ResidentBillsFeatureId = "pay-now" | "invoices" | "history" | "help";
export type ResidentBillsFeatureHref = `/(resident)/bills/${string}`;

export interface ResidentBillsFeatureDefinition {
  id: ResidentBillsFeatureId;
  title: string;
  description: string;
  icon: ResidentIconKey;
  route: ResidentBillsFeatureHref;
  highlights: readonly string[];
}

export const residentBillsFeatures: readonly ResidentBillsFeatureDefinition[] = [
  { id: "pay-now", title: "Pay society dues", description: "Review the current maintenance amount before choosing a payment option.", icon: "bill", route: "/(resident)/bills/pay-now", highlights: ["Review the amount first", "Choose a trusted payment option", "Keep a digital receipt"] },
  { id: "invoices", title: "Invoices", description: "See your current and previous maintenance invoices.", icon: "document", route: "/(resident)/bills/invoices", highlights: ["Current billing period", "Invoice due dates", "Downloadable records later"] },
  { id: "history", title: "Payment history", description: "Keep receipts and payment activity together.", icon: "bill", route: "/(resident)/bills/history", highlights: ["Recent receipts", "Clear payment references", "Simple record keeping"] },
  { id: "help", title: "Payment Help", description: "Find the right support path for a payment or invoice question.", icon: "helpdesk", route: "/(resident)/bills/help", highlights: ["Invoice questions", "Payment support", "Society contact details"] },
];

export const residentBillsQuickActionIds: readonly ResidentBillsFeatureId[] = [
  "pay-now",
  "invoices",
  "history",
  "help",
];

export function getResidentBillsFeature(id: ResidentBillsFeatureId) {
  const feature = residentBillsFeatures.find((candidate) => candidate.id === id);
  if (!feature) throw new Error(`Unknown resident Bills feature: ${id}`);
  return feature;
}

export { residentBillsFixture };
