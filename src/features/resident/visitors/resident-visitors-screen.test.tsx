import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { fakeBootstrap } from "@/testing/fakes";
import { ResidentVisitorsScreen } from "./resident-visitors-screen";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function createSession(): SessionContextValue {
  return {
    state: { status: "authenticated", bootstrap: fakeBootstrap("resident") },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "challenge-1" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => fakeBootstrap("resident")),
    logout: jest.fn(async () => undefined),
  };
}

async function renderVisitors() {
  return render(
    <SessionContext.Provider value={createSession()}>
      <ResidentVisitorsScreen />
    </SessionContext.Provider>,
  );
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
    expect(screen.queryByText("AD")).toBeNull();
  });

  it("opens static visitor routes from actions and visitor cards", async () => {
    const screen = await renderVisitors();

    await fireEvent.press(screen.getByRole("button", { name: "Invite Guest" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/visitors/invite-guest");

    await fireEvent.press(screen.getByRole("button", { name: "View all visitor updates" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/visitors/updates");

    await fireEvent.press(screen.getByRole("button", { name: "Open Maya Shah visitor details" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/visitors/maya-shah");
  });
});
