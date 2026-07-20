import type { Bootstrap } from "@/platform/api/mobile-api-client";

export type SessionState =
  | { status: "restoring" }
  | { status: "signed_out"; reason?: string }
  | { status: "authenticated"; bootstrap: Bootstrap; roleSwitchError?: string }
  | { status: "switching_role"; bootstrap: Bootstrap }
  | { status: "recoverable_error"; message: string };

export type SessionAction =
  | { type: "restore" }
  | { type: "signed_out"; reason?: string }
  | { type: "authenticated"; bootstrap: Bootstrap; roleSwitchError?: string }
  | { type: "switching_role" }
  | { type: "recoverable_error"; message: string };

export const initialSessionState: SessionState = { status: "restoring" };

function bootstrapFrom(action: SessionAction): Bootstrap {
  if (action.type !== "authenticated" || !action.bootstrap) {
    throw new Error("An authenticated session requires a bootstrap payload.");
  }
  return action.bootstrap;
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "restore":
      return initialSessionState;
    case "signed_out":
      return action.reason ? { status: "signed_out", reason: action.reason } : { status: "signed_out" };
    case "authenticated": {
      const bootstrap = bootstrapFrom(action);
      return action.roleSwitchError
        ? { status: "authenticated", bootstrap, roleSwitchError: action.roleSwitchError }
        : { status: "authenticated", bootstrap };
    }
    case "switching_role":
      return state.status === "authenticated" ? { status: "switching_role", bootstrap: state.bootstrap } : state;
    case "recoverable_error":
      return { status: "recoverable_error", message: action.message };
  }
}
