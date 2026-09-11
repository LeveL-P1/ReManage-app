import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";

import type { MobileApi } from "@/platform/api/mobile-api-client";
import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { FakeMobileApi, fakeBootstrap } from "@/testing/fakes";
import { ResidentHomeScreen } from "./resident-home-screen";

const mockPush = jest.fn();
const queryClients: QueryClient[] = [];

afterEach(() => {
  for (const client of queryClients) client.clear();
  queryClients.length = 0;
  cleanup();
});

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function createSession(permissions = fakeBootstrap("resident").permissions, api: MobileApi = new FakeMobileApi()): SessionContextValue {
  return {
    state: { status: "authenticated", bootstrap: { ...fakeBootstrap("resident"), permissions } },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "challenge-1" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => fakeBootstrap("resident")),
    runAuthenticated: (operation) => operation(api, "resident-token"),
    logout: jest.fn(async () => undefined),
  };
}

async function renderHome(permissions?: string[], api?: MobileApi) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false }, mutations: { gcTime: Infinity, retry: false } } });
  queryClients.push(queryClient);
  return render(
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={createSession(permissions, api)}>
        <ResidentHomeScreen />
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
}

describe("ResidentHomeScreen", () => {
  beforeEach(() => mockPush.mockReset());

  it("renders the greeting, quick actions, and default empty states", async () => {
    const screen = await renderHome();

    expect(screen.getByText(/Good (morning|afternoon|evening)/)).toBeTruthy();
    expect(await screen.findByText(/Resident · /)).toBeTruthy();
    for (const label of ["Visitors", "Bills", "Community", "Notices", "Amenities", "SOS"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(await screen.findByText("All settled")).toBeTruthy();
    expect(await screen.findByText("No notices yet.")).toBeTruthy();
  });

  it("navigates to the correct route for each quick action", async () => {
    const screen = await renderHome();

    fireEvent.press(screen.getByRole("button", { name: "Bills" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/(tabs)/bills");

    fireEvent.press(screen.getByRole("button", { name: "Visitors" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/(tabs)/visitors");

    fireEvent.press(screen.getByRole("button", { name: "Notices" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/(tabs)/notices");
  });

  it("shows a pending gate visitor and approves it", async () => {
    const api = new FakeMobileApi();
    (api.residentVisitors as jest.Mock).mockImplementation(async () => ({
      flatNumber: "A-308",
      visitors: [{
        id: "visitor-1",
        visitorName: "Rahul Mehta",
        purpose: "Swiggy delivery",
        status: "pending" as const,
        phone: null,
        vehicleNo: null,
        passcode: null,
        arrivedAt: new Date().toISOString(),
        expectedAt: null,
        entryTime: null,
        exitTime: null,
        createdAt: new Date().toISOString(),
      }],
    }));
    (api.residentApproveVisitor as jest.Mock).mockImplementation(async (_token: string, visitorId: string) => ({
      id: visitorId,
      visitorName: "Rahul Mehta",
      purpose: "Swiggy delivery",
      status: "approved" as const,
      phone: null,
      vehicleNo: null,
      passcode: null,
      arrivedAt: new Date().toISOString(),
      expectedAt: null,
      entryTime: null,
      exitTime: null,
      createdAt: new Date().toISOString(),
    }));

    const screen = await renderHome(undefined, api);

    expect(await screen.findByText("Rahul Mehta")).toBeTruthy();
    expect(screen.getByText("AT YOUR GATE · needs approval")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: "Approve Rahul Mehta" }));
    await waitFor(() => expect(api.residentApproveVisitor).toHaveBeenCalledWith("resident-token", "visitor-1"));
  });
});
