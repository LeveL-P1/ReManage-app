import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode } from "react";

import { createMobileApi, type MobileRole } from "@/platform/api/mobile-api-client";

import { createCredentialStore } from "./credential-store";
import { createSessionController, type SessionController } from "./session-controller";
import type { SessionState } from "./session-reducer";

export interface SessionContextValue {
  state: SessionState;
  retryRestore(): Promise<void>;
  signInWithPassword(identifier: string, password: string): Promise<void>;
  requestOtp(identifier: string): Promise<{ challengeId: string }>;
  verifyOtp(challengeId: string, code: string): Promise<void>;
  switchRole(role: MobileRole): Promise<void>;
  logout(): Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export interface SessionProviderProps {
  children: ReactNode;
  controller?: SessionController;
}

type LifecycleCancellableSessionController = SessionController & {
  cancelPendingOperations(): void | Promise<void>;
};

function cancelPendingOperations(controller: SessionController): Promise<void> {
  const candidate = controller as Partial<LifecycleCancellableSessionController>;
  return Promise.resolve(candidate.cancelPendingOperations?.());
}

export function SessionProvider({ children, controller: suppliedController }: SessionProviderProps): ReactNode {
  const controller = useMemo(
    () => suppliedController ?? createSessionController({ api: createMobileApi(), credentials: createCredentialStore() }),
    [suppliedController],
  );
  const state = useSyncExternalStore(controller.subscribe, controller.getState, controller.getState);
  const restoredController = useRef<SessionController | null>(null);
  const activeController = useRef<SessionController | null>(null);
  const lifecycleVersion = useRef(0);
  const pendingCancellations = useRef(new Map<SessionController, Promise<void>>());

  const quiesceController = useCallback((candidate: SessionController): Promise<void> => {
    const pending = pendingCancellations.current.get(candidate);
    if (pending) return pending;

    if (restoredController.current === candidate) restoredController.current = null;
    let cancellation!: Promise<void>;
    cancellation = cancelPendingOperations(candidate)
      .catch(() => undefined)
      .finally(() => {
        if (pendingCancellations.current.get(candidate) === cancellation) {
          pendingCancellations.current.delete(candidate);
        }
      });
    pendingCancellations.current.set(candidate, cancellation);
    return cancellation;
  }, []);

  useEffect(() => {
    const handoff = activeController.current && activeController.current !== controller
      ? quiesceController(activeController.current)
      : Promise.resolve();
    activeController.current = controller;
    const version = lifecycleVersion.current + 1;
    lifecycleVersion.current = version;
    const currentCancellation = pendingCancellations.current.get(controller) ?? Promise.resolve();
    void Promise.all([handoff, currentCancellation]).then(() => {
      if (lifecycleVersion.current !== version || activeController.current !== controller) return;
      if (restoredController.current === controller) return;
      restoredController.current = controller;
      void controller.restore();
    });
    return () => {
      void Promise.resolve().then(() => {
        if (lifecycleVersion.current === version && activeController.current === controller) {
          void quiesceController(controller);
          activeController.current = null;
        }
      });
    };
  }, [controller, quiesceController]);

  const value = useMemo<SessionContextValue>(
    () => ({
      state,
      retryRestore: () => controller.restore(),
      signInWithPassword: (identifier, password) => controller.signInWithPassword(identifier, password),
      requestOtp: (identifier) => controller.requestOtp(identifier),
      verifyOtp: (challengeId, code) => controller.verifyOtp(challengeId, code),
      switchRole: (role) => controller.switchRole(role),
      logout: () => controller.logout(),
    }),
    [controller, state],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used within a SessionProvider.");
  return value;
}
