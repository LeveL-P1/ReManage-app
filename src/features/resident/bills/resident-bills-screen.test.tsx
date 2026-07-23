import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { fakeBootstrap } from "@/testing/fakes";
import { ResidentBillsScreen } from "./resident-bills-screen";

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

async function renderBills() {
  return render(
    <SessionContext.Provider value={createSession()}>
      <ResidentBillsScreen />
    </SessionContext.Provider>,
  );
}

describe("ResidentBillsScreen", () => {
  beforeEach(() => mockPush.mockReset());

  it("renders the invoice-first payment feed without advertising", async () => {
    const screen = await renderBills();

    expect(screen.getByText("My Bills")).toBeTruthy();
    expect(screen.getByText("Current society dues")).toBeTruthy();
    expect(screen.getAllByText("₹3,480")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Pay now" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "View invoices" })).toBeTruthy();
    for (const label of ["Pay dues", "Invoices", "History", "Payment Help"]) {
      expect(screen.getByRole("button", { name: label })).toBeTruthy();
    }
    for (const heading of ["Latest invoice", "Payment activity", "Payments made simpler"]) {
      expect(screen.getByText(heading)).toBeTruthy();
    }
    expect(screen.getByRole("button", { name: "Open July 2026 invoice" })).toBeTruthy();
    expect(screen.queryByText("AD")).toBeNull();
  });

  it("opens static Bill routes from its primary action and invoice", async () => {
    const screen = await renderBills();

    await fireEvent.press(screen.getByRole("button", { name: "Pay now" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/bills/pay-now");

    await fireEvent.press(screen.getByRole("button", { name: "View invoices" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/bills/invoices");

    await fireEvent.press(screen.getByRole("button", { name: "Open July 2026 invoice" }));
    expect(mockPush).toHaveBeenLastCalledWith("/(resident)/bills/july-2026");
  });
});
