import React from "react";
import { render } from "@testing-library/react-native";

import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { fakeBootstrap } from "@/testing/fakes";
import { ResidentHomeScreen } from "./resident-home-screen";

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
    logout: jest.fn(async () => undefined),
  };
}

async function renderFinanceOnlyHome() {
  return render(
    <SessionContext.Provider value={financeOnlySession()}>
      <ResidentHomeScreen />
    </SessionContext.Provider>,
  );
}

it("only shows Home quick actions permitted by bootstrap", async () => {
  const screen = await renderFinanceOnlyHome();

  expect(screen.getByRole("button", { name: "Pay Bills" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "View More" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Pre-Approve" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Ask Society" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Raise Alert" })).toBeNull();
});
