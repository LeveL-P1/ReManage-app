import React from "react";
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

  it("renders the reference-informed Home feed without advertisements", async () => {
    const screen = await renderHome();

    expect(screen.getByText("Quick Actions")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Customise" })).toBeTruthy();
    for (const label of [
      "Pre-Approve",
      "Security",
      "Ask Society",
      "Posts",
      "Find Daily Help",
      "Raise Alert",
      "Pay Bills",
      "View More",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    expect(screen.getByText("You have no new updates")).toBeTruthy();
    expect(screen.getByText("Today’s Entry Updates")).toBeTruthy();
    expect(screen.getByText("Community Posts")).toBeTruthy();
    expect(screen.getByRole("button", { name: "New Post" })).toBeTruthy();
    expect(screen.getByText("You are all caught up!")).toBeTruthy();
    expect(screen.getByRole("button", { name: "View Older Posts" })).toBeTruthy();
    expect(screen.queryByText("Your society, at a glance")).toBeNull();
  });

  it("opens dedicated pop-out screens for Home features", async () => {
    const screen = await renderHome();

    fireEvent.press(screen.getByRole("button", { name: "Pre-Approve" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/home/pre-approve");

    fireEvent.press(screen.getByRole("button", { name: "New Post" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/home/new-post");

    fireEvent.press(screen.getByRole("button", { name: "View Older Posts" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/home/older-posts");
  });
});
