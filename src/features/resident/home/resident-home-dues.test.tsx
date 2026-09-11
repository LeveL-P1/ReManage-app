import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react-native";

import type { MobileApi } from "@/platform/api/mobile-api-client";
import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { FakeMobileApi, fakeBootstrap } from "@/testing/fakes";
import { ResidentHomeScreen } from "./resident-home-screen";

const queryClients: QueryClient[] = [];

afterEach(() => {
  for (const client of queryClients) client.clear();
  queryClients.length = 0;
  cleanup();
});

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

function createSession(api: MobileApi): SessionContextValue {
  return {
    state: { status: "authenticated", bootstrap: fakeBootstrap("resident") },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "challenge-1" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => fakeBootstrap("resident")),
    runAuthenticated: (operation) => operation(api, "resident-token"),
    logout: jest.fn(async () => undefined),
  };
}

async function renderHome(api: MobileApi) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false }, mutations: { gcTime: Infinity, retry: false } } });
  queryClients.push(queryClient);
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={createSession(api)}>
        <ResidentHomeScreen />
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

it("shows the dues hero for the nearest outstanding bill", async () => {
  const api = new FakeMobileApi();
  (api.listBills as jest.Mock).mockImplementation(async () => ({
    bills: [{
      id: "bill-1",
      amount: 3000,
      billType: "maintenance" as const,
      period: "March 2026",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "pending" as const,
      lateFee: 0,
      gstAmount: 0,
      totalAmount: 3000,
      description: null,
      paidAt: null,
      paidVia: null,
      paidAmount: null,
      receiptNumber: null,
      flatNumber: "A-308",
      createdAt: new Date().toISOString(),
    }],
    totalPending: 1,
    totalAmount: 3000,
  }));

  const screen = await renderHome(api);

  expect(await screen.findByText("₹3,000")).toBeTruthy();
  expect(screen.getByText("March 2026 maintenance due")).toBeTruthy();
});
