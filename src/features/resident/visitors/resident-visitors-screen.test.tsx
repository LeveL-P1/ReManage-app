import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";

import type { MobileApi } from "@/platform/api/mobile-api-client";
import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { fakeBootstrap } from "@/testing/fakes";
import { ResidentVisitorsScreen } from "./resident-visitors-screen";

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

function createApi() {
  return {
    residentVisitors: jest.fn(async () => ({
      flatNumber: "A-308",
      visitors: [
        {
          arrivedAt: "2026-08-15T08:00:00.000Z",
          createdAt: "2026-08-15T08:00:00.000Z",
          id: "visitor-1",
          purpose: "Guest visit",
          status: "pending" as const,
          visitorName: "Maya Shah",
        },
        {
          arrivedAt: "2026-08-15T07:00:00.000Z",
          createdAt: "2026-08-15T07:00:00.000Z",
          id: "visitor-2",
          passcode: "4829",
          purpose: "Family visit",
          status: "approved" as const,
          visitorName: "Arjun Kumar",
        },
      ],
    })),
    residentApproveVisitor: jest.fn(async (_token: string, visitorId: string) => ({
      arrivedAt: "2026-08-15T08:00:00.000Z",
      createdAt: "2026-08-15T08:00:00.000Z",
      id: visitorId,
      purpose: "Guest visit",
      status: "approved" as const,
      visitorName: "Maya Shah",
    })),
    residentRejectVisitor: jest.fn(async (_token: string, visitorId: string) => ({
      arrivedAt: "2026-08-15T08:00:00.000Z",
      createdAt: "2026-08-15T08:00:00.000Z",
      id: visitorId,
      purpose: "Guest visit",
      status: "rejected" as const,
      visitorName: "Maya Shah",
    })),
  };
}

function createSession(api: ReturnType<typeof createApi>): SessionContextValue {
  return {
    state: { status: "authenticated", bootstrap: fakeBootstrap("resident") },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "challenge-1" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => fakeBootstrap("resident")),
    runAuthenticated: (operation) => operation(api as unknown as MobileApi, "resident-token"),
    logout: jest.fn(async () => undefined),
  };
}

async function renderVisitors(api = createApi()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false }, mutations: { gcTime: Infinity, retry: false } } });
  queryClients.push(queryClient);
  return {
    api,
    queryClient,
    ...(await render(
      <QueryClientProvider client={queryClient}>
        <SessionContext.Provider value={createSession(api)}>
          <ResidentVisitorsScreen />
        </SessionContext.Provider>
      </QueryClientProvider>,
    )),
  };
}

describe("ResidentVisitorsScreen", () => {
  beforeEach(() => mockPush.mockReset());

  it("renders the arrival-first visitor feed without advertisements", async () => {
    const screen = await renderVisitors();

    expect(screen.getByText("Visitors")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pre-Approve visitor" })).toBeTruthy();
    expect(screen.getByText("Today’s visitor updates")).toBeTruthy();
    expect(screen.getByText("Expected today")).toBeTruthy();
    expect(screen.getByText("Recent activity")).toBeTruthy();
    for (const label of ["Pre-Approve", "Invite Guest", "Daily Help", "Visitor History"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: "View all visitor updates" })).toBeTruthy();
    expect(await screen.findByText("Pending gate approval")).toBeTruthy();
    expect(screen.queryByText("AD")).toBeNull();
  });

  it("opens static visitor routes from actions and visitor cards", async () => {
    const screen = await renderVisitors();

    await fireEvent.press(screen.getByRole("button", { name: "Invite Guest" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/visitors/invite-guest");

    await fireEvent.press(screen.getByRole("button", { name: "View all visitor updates" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/visitors/updates");

    await fireEvent.press(await screen.findByRole("button", { name: "Open Maya Shah visitor details" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/visitors/visitor-1");
  });

  it("loads resident visitors and approves a pending gate request", async () => {
    const screen = await renderVisitors();

    expect(await screen.findByText("Pending gate approval")).toBeTruthy();
    expect(screen.api.residentVisitors).toHaveBeenCalledWith("resident-token");

    await fireEvent.press(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => expect(screen.api.residentApproveVisitor).toHaveBeenCalledWith("resident-token", "visitor-1"));
  });
});
