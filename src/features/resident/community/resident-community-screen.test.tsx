import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { fakeBootstrap } from "@/testing/fakes";
import { ResidentCommunityScreen } from "./resident-community-screen";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

function createSession(permissions = fakeBootstrap("resident").permissions): SessionContextValue {
  return {
    state: { status: "authenticated", bootstrap: { ...fakeBootstrap("resident"), permissions } },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "challenge-1" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => fakeBootstrap("resident")),
    logout: jest.fn(async () => undefined),
  };
}

async function renderCommunity(permissions?: string[]) {
  return render(
    <SessionContext.Provider value={createSession(permissions)}>
      <ResidentCommunityScreen />
    </SessionContext.Provider>,
  );
}

describe("ResidentCommunityScreen", () => {
  beforeEach(() => mockPush.mockReset());

  it("shows the approved community modules and fixture-backed sections", async () => {
    const screen = await renderCommunity();
    const labels = [
      "Helpdesk",
      "Announcements",
      "Discussion Forum",
      "Events & Calendar",
      "Amenity Booking",
      "Resident Directory",
      "Staff & Daily Help",
      "Buy & Sell",
      "Parking",
      "More",
    ];
    for (const label of labels) expect(screen.getByRole("button", { name: label })).toBeTruthy();
    for (const heading of ["Happening nearby", "Find your circle", "Safety & support", "Governance highlights"]) {
      expect(screen.getByText(heading)).toBeTruthy();
    }
    expect(screen.getByText("Part of ReManage for 1 month")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "More" }));
    expect(mockPush).toHaveBeenCalledWith("/(resident)/(tabs)/more");
    await fireEvent.press(screen.getByRole("button", { name: "Helpdesk" }));
    expect(screen.getByText("This mobile module is coming in the next ReManage phase.")).toBeTruthy();
  });

  it("hides unavailable community modules but always keeps More", async () => {
    const permissions = fakeBootstrap("resident").permissions.filter((permission) => permission !== "community:rsvp.manage");
    const screen = await renderCommunity(permissions);

    expect(screen.queryByRole("button", { name: "Events & Calendar" })).toBeNull();
    expect(screen.getByRole("button", { name: "More" })).toBeTruthy();
  });
});
