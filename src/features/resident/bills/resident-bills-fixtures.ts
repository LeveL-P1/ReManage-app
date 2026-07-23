import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";

export interface ResidentBillsViewModel {
  unit: string;
  currentDues: {
    amount: string;
    dueDate: string;
    label: string;
  };
  latestInvoice: {
    id: "july-2026";
    title: string;
    period: string;
    amount: string;
    dueDate: string;
    status: "Due soon";
  };
  activity: readonly {
    id: string;
    icon: ResidentIconKey;
    title: string;
    detail: string;
    when: string;
  }[];
}

export const residentBillsFixture: ResidentBillsViewModel = {
  unit: "A-308",
  currentDues: {
    amount: "₹3,480",
    dueDate: "Due by 15 July 2026",
    label: "Current society dues",
  },
  latestInvoice: {
    id: "july-2026",
    title: "Maintenance invoice",
    period: "July 2026",
    amount: "₹3,480",
    dueDate: "Due by 15 July 2026",
    status: "Due soon",
  },
  activity: [
    { id: "receipt", icon: "bill", title: "June receipt ready", detail: "Your latest receipt is available in payment history.", when: "1 Jul" },
    { id: "reminder", icon: "announcement", title: "Payment reminder", detail: "Society dues for July are available to review.", when: "Today" },
  ],
};
