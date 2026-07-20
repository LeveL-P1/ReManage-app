import type { Bootstrap } from "@/platform/api/mobile-api-client";

import { initialSessionState, sessionReducer, type SessionAction, type SessionState } from "./session-reducer";

const bootstrap: Bootstrap = {
  activeRole: "resident",
  approvedRoles: ["resident", "guard"],
  featureFlags: { guardOffline: false, guardShell: true, nativePush: false, residentShell: true },
  notificationPolicy: {
    community: { configurable: true, enabled: false },
    critical: { configurable: false, enabled: true },
    transactional: { configurable: true, enabled: true },
  },
  permissions: ["dashboard.read"],
  society: { id: "society-1", name: "Green Acres" },
  user: { email: "resident@example.com", id: "user-1", name: "Resident" },
};

describe("sessionReducer", () => {
  it("starts in restoring state and transitions to an authenticated public bootstrap", () => {
    expect(initialSessionState).toEqual<SessionState>({ status: "restoring" });

    expect(sessionReducer(initialSessionState, { type: "authenticated", bootstrap })).toEqual<SessionState>({
      status: "authenticated",
      bootstrap,
    });
  });

  it("transitions authenticated sessions through role switching to the returned bootstrap", () => {
    const authenticated: SessionState = {
      status: "authenticated",
      bootstrap,
      roleSwitchError: "We could not switch roles. Please try again.",
    };
    const switchedBootstrap: Bootstrap = { ...bootstrap, activeRole: "guard" };

    const switching = sessionReducer(authenticated, { type: "switching_role" });
    expect(switching).toEqual<SessionState>({ status: "switching_role", bootstrap });
    expect(sessionReducer(switching, { type: "authenticated", bootstrap: switchedBootstrap })).toEqual<SessionState>({
      status: "authenticated",
      bootstrap: switchedBootstrap,
    });
  });

  it("handles signed-out, retry, and recoverable-error transitions", () => {
    const signedOut = sessionReducer(initialSessionState, { type: "signed_out", reason: "expired" });
    expect(signedOut).toEqual<SessionState>({ status: "signed_out", reason: "expired" });
    expect(sessionReducer(signedOut, { type: "restore" })).toEqual<SessionState>({ status: "restoring" });
    expect(sessionReducer(signedOut, { type: "recoverable_error", message: "Network unavailable" })).toEqual<SessionState>({
      status: "recoverable_error",
      message: "Network unavailable",
    });
  });

  it("rejects an authenticated transition without a bootstrap payload", () => {
    const invalidAction = { type: "authenticated" } as unknown as SessionAction;

    expect(() => sessionReducer({ status: "signed_out" }, invalidAction)).toThrow("bootstrap payload");
  });

  it("never copies access tokens into reducer state", () => {
    const action = { type: "authenticated", bootstrap, accessToken: "secret-access-token" } as SessionAction;
    const nextState = sessionReducer({ status: "signed_out" }, action);

    expect(nextState).toEqual<SessionState>({ status: "authenticated", bootstrap });
    expect(JSON.stringify(nextState)).not.toContain("secret-access-token");
  });
});
