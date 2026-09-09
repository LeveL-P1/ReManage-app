import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/platform/auth/session-provider";
import type { MobileBill } from "@/platform/api/mobile-api-client";

export const RESIDENT_BILLS_QUERY_KEY = ["resident-bills"] as const;

export function useResidentBills() {
  const { runAuthenticated, state } = useSession();
  return useQuery({
    enabled: state.status === "authenticated" && Boolean(runAuthenticated),
    queryKey: RESIDENT_BILLS_QUERY_KEY,
    queryFn: () => runAuthenticated!((api, token) => api.listBills(token)),
    staleTime: 60 * 1000,
  });
}

export function primaryOutstandingBill(bills: readonly MobileBill[]): MobileBill | null {
  const outstanding = bills.filter((bill) => bill.status !== "paid");
  if (outstanding.length === 0) return null;
  return [...outstanding].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
}

export function billTotal(bill: MobileBill): number {
  return bill.totalAmount ?? bill.amount + bill.gstAmount + bill.lateFee;
}

export function daysUntil(dateIso: string): number {
  const now = new Date();
  const target = new Date(dateIso);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / msPerDay);
}

export function formatDueLabel(dateIso: string): string {
  const days = daysUntil(dateIso);
  const dateLabel = new Date(dateIso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (days < 0) return `Overdue · ${dateLabel}`;
  if (days === 0) return `Due today · ${dateLabel}`;
  if (days === 1) return `Due tomorrow · ${dateLabel}`;
  return `Due in ${days} days · ${dateLabel}`;
}
