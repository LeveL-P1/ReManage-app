import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { fakeBootstrap } from "@/testing/fakes";

import { RoleSwitcher } from "./role-switcher";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

function createSession(overrides: Partial<SessionContextValue> = {}): SessionContextValue {
  return {
    state: { status: "authenticated", bootstrap: fakeBootstrap("resident") },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "challenge-1" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => undefined),
    logout: jest.fn(async () => undefined),
    ...overrides,
  };
}

async function renderSwitcher(session = createSession()) {
  return Object.assign(
    await render(
      <SessionContext.Provider value={session}>
        <RoleSwitcher />
      </SessionContext.Provider>,
    ),
    { session },
  );
}

describe("RoleSwitcher", () => {
  beforeEach(() => mockReplace.mockReset());

  it("renders nothing for one approved role", async () => {
    const session = createSession({
      state: { status: "authenticated", bootstrap: { ...fakeBootstrap("resident"), approvedRoles: ["resident"] } },
    });

    const { queryByRole } = await renderSwitcher(session);

    expect(queryByRole("button")).toBeNull();
  });

  it("shows a dual-role resident only the guard destination", async () => {
    const { getByRole, queryByRole } = await renderSwitcher();

    expect(getByRole("button", { name: "Switch to Guard" })).toBeTruthy();
    expect(queryByRole("button", { name: "Switch to Resident" })).toBeNull();
  });

  it("shows a dual-role guard only the resident destination", async () => {
    const session = createSession({ state: { status: "authenticated", bootstrap: fakeBootstrap("guard") } });
    const { getByRole, queryByRole } = await renderSwitcher(session);

    expect(getByRole("button", { name: "Switch to Resident" })).toBeTruthy();
    expect(queryByRole("button", { name: "Switch to Guard" })).toBeNull();
  });

  it("calls switchRole once and blocks double taps", async () => {
    const pending = deferred<void>();
    const session = createSession({ switchRole: jest.fn(() => pending.promise) });
    const { getByRole } = await renderSwitcher(session);
    const button = getByRole("button", { name: "Switch to Guard" });

    await fireEvent.press(button);
    await fireEvent.press(button);

    expect(session.switchRole).toHaveBeenCalledTimes(1);
    expect(button.props.accessibilityState.disabled).toBe(true);
    await act(async () => pending.resolve());
  });

  it("navigates only after the server returns the requested active role", async () => {
    const pending = deferred<void>();
    const switchRole = jest.fn(() => pending.promise);
    const session = createSession({ switchRole });
    const rendered = await renderSwitcher(session);

    await fireEvent.press(rendered.getByRole("button", { name: "Switch to Guard" }));
    expect(mockReplace).not.toHaveBeenCalled();

    await rendered.rerender(
      <SessionContext.Provider value={createSession({
        state: { status: "authenticated", bootstrap: fakeBootstrap("guard") },
        switchRole,
      })}>
        <RoleSwitcher />
      </SessionContext.Provider>,
    );

    expect(mockReplace).not.toHaveBeenCalled();
    await act(async () => pending.resolve());
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(guard)"));
  });

  it("preserves the original role shell when switching fails", async () => {
    const session = createSession({ switchRole: jest.fn(async () => Promise.reject(new Error("unavailable"))) });
    const { findByText, getByRole } = await renderSwitcher(session);

    await fireEvent.press(getByRole("button", { name: "Switch to Guard" }));

    expect(await findByText("We could not switch roles. Please try again.")).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(getByRole("button", { name: "Switch to Guard" })).toBeTruthy();
  });
});
