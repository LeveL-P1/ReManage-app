import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render } from "@testing-library/react-native";

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
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

function financeOnlySession(): SessionContextValue {
  return {
    state: {
      status: "authenticated",
      bootstrap: { ...fakeBootstrap("resident"), permissions: ["society:finance.read"] },
    },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "challenge-1" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => fakeBootstrap("resident")),
    runAuthenticated: (operation) => operation(new FakeMobileApi(), "resident-token"),
    logout: jest.fn(async () => undefined),
  };
}

async function renderFinanceOnlyHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false }, mutations: { gcTime: Infinity, retry: false } } });
  queryClients.push(queryClient);
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={financeOnlySession()}>
        <ResidentHomeScreen />
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

it("hides permission-gated quick actions but keeps the always-visible ones", async () => {
  const screen = await renderFinanceOnlyHome();

  expect(screen.getByRole("button", { name: "Visitors" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Bills" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Community" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Notices" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Amenities" })).toBeNull();
  expect(screen.queryByRole("button", { name: "SOS" })).toBeNull();
});
