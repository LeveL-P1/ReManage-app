import React from "react";
import { Alert } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { fakeBootstrap } from "@/testing/fakes";
import { residentHomeFixture } from "./resident-home-fixtures";
import { ResidentHomeScreen } from "./resident-home-screen";

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

async function renderHome(
  permissions?: string[],
  viewModel = residentHomeFixture,
) {
  return render(
    <SessionContext.Provider value={createSession(permissions)}>
      <ResidentHomeScreen viewModel={viewModel} />
    </SessionContext.Provider>,
  );
}

describe("ResidentHomeScreen", () => {
  beforeEach(() => mockPush.mockReset());

  it("renders the resident overview and handles implemented and upcoming actions", async () => {
    const screen = await renderHome();

    expect(screen.getByText("Your society, at a glance")).toBeTruthy();
    for (const label of ["Pay bill", "Approve visitor", "Raise complaint", "Raise SOS"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(screen.getByText("Today")).toBeTruthy();
    expect(screen.getByText("Recent activity")).toBeTruthy();
    expect(screen.getByText("From your community")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Pay bill" }));
    expect(mockPush).toHaveBeenCalledWith("/(resident)/(tabs)/bills");
    await fireEvent.press(screen.getByRole("button", { name: "Approve visitor" }));
    expect(mockPush).toHaveBeenCalledWith("/(resident)/(tabs)/visitors");
    await fireEvent.press(screen.getByRole("button", { name: "Raise complaint" }));
    expect(screen.getByText("This mobile module is coming in the next ReManage phase.")).toBeTruthy();
  });

  it("only shows quick actions permitted by bootstrap", async () => {
    const screen = await renderHome(["society:finance.read"]);

    expect(screen.getByRole("button", { name: "Pay bill" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Approve visitor" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Raise complaint" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Raise SOS" })).toBeNull();
  });

  it("renders an honest empty state and truthful Search feedback", async () => {
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    const screen = await renderHome(undefined, { ...residentHomeFixture, activity: [] });

    expect(screen.getByText("No recent activity yet.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Search" }));
    expect(alert).toHaveBeenCalledWith("Search", "Resident search is coming in the next ReManage phase.");
    alert.mockRestore();
  });
});
