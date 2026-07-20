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
    switchRole: jest.fn(async () => fakeBootstrap("resident")),
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

function RoleShell({ session }: { session: SessionContextValue }) {
  return (
    <SessionContext.Provider value={session}>
      {session.state.status === "authenticated" ? <RoleSwitcher /> : null}
    </SessionContext.Provider>
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
    const pending = deferred<ReturnType<typeof fakeBootstrap>>();
    const session = createSession({ switchRole: jest.fn(() => pending.promise) });
    const { getByRole } = await renderSwitcher(session);
    const button = getByRole("button", { name: "Switch to Guard" });

    await fireEvent.press(button);
    await fireEvent.press(button);

    expect(session.switchRole).toHaveBeenCalledTimes(1);
    expect(button.props.accessibilityState.disabled).toBe(true);
    await act(async () => pending.resolve(fakeBootstrap("guard")));
  });

  it("navigates only after resolution to the server-authoritative active role", async () => {
    const pending = deferred<ReturnType<typeof fakeBootstrap>>();
    const switchRole = jest.fn(() => pending.promise);
    const session = createSession({ switchRole });
    const rendered = await renderSwitcher(session);

    await fireEvent.press(rendered.getByRole("button", { name: "Switch to Guard" }));
    expect(mockReplace).not.toHaveBeenCalled();

    expect(mockReplace).not.toHaveBeenCalled();
    await act(async () => pending.resolve(fakeBootstrap("resident")));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(resident)"));
  });

  it("retains generic failure feedback after switching unmounts and remounts the resident shell", async () => {
    const pending = deferred<ReturnType<typeof fakeBootstrap>>();
    const switchRole = jest.fn(() => pending.promise);
    const originalBootstrap = fakeBootstrap("resident");
    const rendered = await render(
      <RoleShell session={createSession({
        state: { status: "authenticated", bootstrap: originalBootstrap },
        switchRole,
      })}
      />,
    );

    await fireEvent.press(rendered.getByRole("button", { name: "Switch to Guard" }));
    await rendered.rerender(
      <RoleShell session={createSession({
        state: { status: "switching_role", bootstrap: originalBootstrap },
        switchRole,
      })}
      />,
    );
    expect(rendered.queryByRole("button", { name: "Switch to Guard" })).toBeNull();

    await act(async () => pending.reject(new Error("server implementation detail")));
    await rendered.rerender(
      <RoleShell session={createSession({
        state: {
          status: "authenticated",
          bootstrap: originalBootstrap,
          roleSwitchError: "We could not switch roles. Please try again.",
        },
        switchRole,
      })}
      />,
    );

    expect(await rendered.findByText("We could not switch roles. Please try again.")).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(rendered.getByRole("button", { name: "Switch to Guard" })).toBeTruthy();
  });
});
