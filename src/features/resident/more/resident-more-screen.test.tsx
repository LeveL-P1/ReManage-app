import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { fakeBootstrap } from "@/testing/fakes";
import { ResidentMoreScreen } from "./resident-more-screen";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

function createSession(permissions = fakeBootstrap("resident").permissions): SessionContextValue {
  return {
    state: { status: "authenticated", bootstrap: { ...fakeBootstrap("resident"), permissions } },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "challenge-1" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => fakeBootstrap("guard")),
    logout: jest.fn(async () => undefined),
  };
}

function shell(permissions?: string[]) {
  return (
    <SessionContext.Provider value={createSession(permissions)}>
      <ResidentMoreScreen />
    </SessionContext.Provider>
  );
}

describe("ResidentMoreScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
  });

  it("shows the permission-filtered account hub and routes every permitted service", async () => {
    const screen = await render(shell());

    expect(screen.getByRole("header", { name: "More" })).toBeTruthy();
    expect(screen.getByText("Your home in ReManage")).toBeTruthy();
    expect(screen.getByText("Account & access")).toBeTruthy();
    expect(screen.getByText("Daily priorities")).toBeTruthy();
    expect(screen.getByText("Community & shared life")).toBeTruthy();
    expect(screen.getByText("Governance & records")).toBeTruthy();
    expect(screen.getByRole("button", { name: "My Bills" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Resident Directory" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Move-In / Out" })).toBeNull();
    expect(screen.getByRole("button", { name: "Switch to Guard" })).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "My Bills" }));
    expect(mockPush).toHaveBeenCalledWith("/(resident)/(tabs)/bills");
    await fireEvent.press(screen.getByRole("button", { name: "Helpdesk" }));
    expect(mockPush).toHaveBeenCalledWith("/(resident)/more/helpdesk");
  });

  it("reveals Move-In / Out only with its explicit permission", async () => {
    const screen = await render(shell());
    expect(screen.queryByRole("button", { name: "Move-In / Out" })).toBeNull();

    await screen.rerender(shell([...fakeBootstrap("resident").permissions, "tenant:membership.read"]));
    expect(screen.getByRole("button", { name: "Move-In / Out" })).toBeTruthy();
  });

  it("keeps role switching available when no Resident services are permitted", async () => {
    const screen = await render(shell([]));

    expect(screen.getByText("No Resident services are available for this account.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Switch to Guard" })).toBeTruthy();
  });
});
