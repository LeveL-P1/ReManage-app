import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react-native";

import type { MobileApi } from "@/platform/api/mobile-api-client";
import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { fakeBootstrap } from "@/testing/fakes";

import { GuardGateScreen } from "./guard-gate-screen";

const queryClients: QueryClient[] = [];

afterEach(() => {
  for (const client of queryClients) client.clear();
  queryClients.length = 0;
  cleanup();
});

function createApi() {
  return {
    guardOverview: jest.fn(async (_token: string) => ({
      counts: { expected: 2, inside: 1, pendingApproval: 1, pendingParcels: 3 },
      gateLabel: "Main Gate",
    })),
    guardVisitors: jest.fn(async (_token: string, _status?: string) => [
      {
        arrivedAt: "2026-08-15T08:00:00.000Z",
        flatNumber: "A-308",
        id: "visitor-1",
        passcodeRequired: true,
        purpose: "guest",
        status: "expected" as const,
        visitorName: "Maya Shah",
      },
    ]),
    guardRequestVisitor: jest.fn(async (_token, body) => ({
      arrivedAt: "2026-08-15T08:05:00.000Z",
      flatNumber: body.flatQuery,
      id: "visitor-2",
      passcodeRequired: false,
      purpose: body.purpose,
      status: "expected" as const,
      visitorName: body.visitorName,
    })),
    guardVerifyPasscode: jest.fn(async (_token: string, visitorId: string, _passcode: string) => ({ id: visitorId, passcodeVerified: true })),
    guardVerifyPasscodeLookup: jest.fn(async (_token: string, _passcode: string) => ({
      arrivedAt: "2026-08-15T08:00:00.000Z",
      flatNumber: "A-308",
      id: "visitor-1",
      passcodeRequired: true,
      purpose: "guest",
      status: "expected" as const,
      visitorName: "Maya Shah",
    })),
    guardCheckIn: jest.fn(async (_token, visitorId) => ({
      arrivedAt: "2026-08-15T08:00:00.000Z",
      entryTime: "2026-08-15T08:10:00.000Z",
      flatNumber: "A-308",
      id: visitorId,
      passcodeRequired: false,
      purpose: "guest",
      status: "inside" as const,
      visitorName: "Maya Shah",
    })),
    guardCheckOut: jest.fn(async (_token, visitorId) => ({
      arrivedAt: "2026-08-15T08:00:00.000Z",
      entryTime: "2026-08-15T08:10:00.000Z",
      exitTime: "2026-08-15T08:20:00.000Z",
      flatNumber: "A-308",
      id: visitorId,
      passcodeRequired: false,
      purpose: "guest",
      status: "exited" as const,
      visitorName: "Maya Shah",
    })),
  };
}

function createSession(api: ReturnType<typeof createApi>): SessionContextValue {
  return {
    state: { status: "authenticated", bootstrap: fakeBootstrap("guard") },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "challenge-1" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => fakeBootstrap("resident")),
    runAuthenticated: (operation) => operation(api as unknown as MobileApi, "guard-token"),
    logout: jest.fn(async () => undefined),
  };
}

async function renderGate(api = createApi()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false }, mutations: { gcTime: Infinity, retry: false } } });
  queryClients.push(queryClient);
  return {
    api,
    ...(await render(
      <QueryClientProvider client={queryClient}>
        <SessionContext.Provider value={createSession(api)}>
          <GuardGateScreen />
        </SessionContext.Provider>
      </QueryClientProvider>,
    )),
  };
}

describe("GuardGateScreen", () => {
  it("loads gate overview and visitors", async () => {
    const screen = await renderGate();

    expect(await screen.findByText("Main Gate")).toBeTruthy();

    expect(screen.getByText("Maya Shah")).toBeTruthy();
    expect(screen.api.guardOverview).toHaveBeenCalledWith("guard-token");
    expect(screen.api.guardVisitors).toHaveBeenCalledWith("guard-token", undefined);
  });

  it("finds a pre-approved visitor by passcode", async () => {
    const screen = await renderGate();
    expect(await screen.findByText("Maya Shah")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("Lookup passcode"), "4829");
    await fireEvent.press(screen.getByRole("button", { name: "Find visitor" }));

    await waitFor(() => expect(screen.api.guardVerifyPasscodeLookup).toHaveBeenCalledWith("guard-token", "4829"));
    expect(screen.getAllByText("Maya Shah").length).toBeGreaterThan(0);
  });

  it("requests a visitor and then allows passcode and check-in actions", async () => {
    const screen = await renderGate();
    expect(await screen.findByText("Maya Shah")).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("Flat or unit"), "B-402");
    await fireEvent.changeText(screen.getByLabelText("Visitor name"), "Arjun Kumar");
    await fireEvent.changeText(screen.getByLabelText("Visit purpose"), "delivery");
    await fireEvent.press(screen.getByRole("button", { name: "Request approval" }));

    await waitFor(() => expect(screen.api.guardRequestVisitor).toHaveBeenCalledWith("guard-token", {
      flatQuery: "B-402",
      purpose: "delivery",
      visitorName: "Arjun Kumar",
    }));

    await fireEvent.press(screen.getByRole("button", { name: "Open Maya Shah" }));
    await fireEvent.changeText(screen.getByLabelText("Visitor passcode"), "4829");
    await fireEvent.press(screen.getByRole("button", { name: "Verify passcode" }));
    await waitFor(() => expect(screen.api.guardVerifyPasscode).toHaveBeenCalledWith("guard-token", "visitor-1", "4829"));

    await fireEvent.press(screen.getByRole("button", { name: "Check in" }));
    await waitFor(() => expect(screen.api.guardCheckIn).toHaveBeenCalledWith("guard-token", "visitor-1"));
  });
});
