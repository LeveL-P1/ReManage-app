import type { Bootstrap, MobileApi, MobileRole, SessionIssue } from "@/platform/api/mobile-api-client";

import type { CredentialStore } from "./credential-store";
import { getOrCreateInstallation, type MobileInstallation } from "./installation";
import { initialSessionState, sessionReducer, type SessionAction, type SessionState } from "./session-reducer";

export interface SessionController {
  getState(): SessionState;
  subscribe(listener: (state: SessionState) => void): () => void;
  restore(): Promise<void>;
  signInWithPassword(identifier: string, password: string): Promise<void>;
  requestOtp(identifier: string): Promise<{ challengeId: string }>;
  verifyOtp(challengeId: string, code: string): Promise<void>;
  switchRole(role: MobileRole): Promise<Bootstrap>;
  logout(): Promise<void>;
}

export interface SessionControllerDependencies {
  api: MobileApi;
  credentials: CredentialStore;
  getInstallation?: () => Promise<MobileInstallation>;
}

function isUnauthorized(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error && error.status === 401;
}

class SessionOperationSupersededError extends Error {
  constructor() {
    super("Session operation was superseded.");
    this.name = "SessionOperationSupersededError";
  }
}

export class MobileSessionController implements SessionController {
  private state: SessionState = initialSessionState;
  private readonly listeners = new Set<(state: SessionState) => void>();
  private accessToken: string | null = null;
  private accessExpiresAt: string | null = null;
  private refreshInFlight: Promise<void> | null = null;
  private refreshGeneration: number | null = null;
  private restoreInFlight: Promise<void> | null = null;
  private restoreGeneration: number | null = null;
  private roleSwitchInFlight: Promise<Bootstrap> | null = null;
  private sessionGeneration = 0;
  private credentialMutations: Promise<void> = Promise.resolve();
  private logoutInFlight: Promise<void> | null = null;
  private logoutInProgress = false;
  private readonly getInstallation: () => Promise<MobileInstallation>;

  constructor(
    private readonly dependencies: SessionControllerDependencies,
  ) {
    this.getInstallation = dependencies.getInstallation ?? (() => getOrCreateInstallation(dependencies.credentials));
  }

  readonly getState = (): SessionState => this.state;

  readonly subscribe = (listener: (state: SessionState) => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  async restore(): Promise<void> {
    if (this.logoutInProgress) return;
    if (this.restoreInFlight) {
      if (this.restoreGeneration === this.sessionGeneration) return this.restoreInFlight;
      try {
        await this.restoreInFlight;
      } catch {
        // A stale restore is expected to settle without affecting the current generation.
      }
      if (this.logoutInProgress) return;
      return this.restore();
    }

    const generation = this.beginSessionEstablishment();
    let restorePromise!: Promise<void>;
    restorePromise = this.restoreSession(generation).finally(() => {
      if (this.restoreInFlight === restorePromise) {
        this.restoreInFlight = null;
        this.restoreGeneration = null;
      }
    });
    this.restoreInFlight = restorePromise;
    this.restoreGeneration = generation;
    return restorePromise;
  }

  private async restoreSession(generation: number): Promise<void> {
    this.dispatch({ type: "restore" });
    try {
      await this.refreshAccess(generation);
      await this.bootstrapCurrentAccess(generation);
    } catch {
      if (this.isCurrent(generation)) await this.signOutLocally();
    }
  }

  async signInWithPassword(identifier: string, password: string): Promise<void> {
    const generation = this.beginSessionEstablishment();
    try {
      const installation = await this.getInstallation();
      this.ensureSessionEstablishmentCurrent(generation);
      const issue = await this.dependencies.api.passwordLogin({
        identifier,
        password,
        installation,
      });
      this.ensureCurrent(generation);
      await this.establishSession(issue, generation);
    } catch (error) {
      if (this.isCurrent(generation)) await this.signOutLocally();
      throw error;
    }
  }

  async requestOtp(identifier: string): Promise<{ challengeId: string }> {
    const accepted = await this.dependencies.api.requestOtp({
      identifier,
      installation: await this.getInstallation(),
    });
    return { challengeId: accepted.challengeId };
  }

  async verifyOtp(challengeId: string, code: string): Promise<void> {
    const generation = this.beginSessionEstablishment();
    try {
      const installation = await this.getInstallation();
      this.ensureSessionEstablishmentCurrent(generation);
      const issue = await this.dependencies.api.verifyOtp({
        challengeId,
        code,
        installation,
      });
      this.ensureCurrent(generation);
      await this.establishSession(issue, generation);
    } catch (error) {
      if (this.isCurrent(generation)) await this.signOutLocally();
      throw error;
    }
  }

  async switchRole(role: MobileRole): Promise<Bootstrap> {
    if (this.roleSwitchInFlight) throw new Error("A role switch is already in progress.");
    if (this.state.status !== "authenticated" || !this.accessToken) {
      throw new Error("An authenticated session is required to switch roles.");
    }
    const generation = this.sessionGeneration;
    const switchPromise = this.performRoleSwitch(role, generation);
    this.roleSwitchInFlight = switchPromise;
    try {
      return await switchPromise;
    } finally {
      if (this.roleSwitchInFlight === switchPromise) this.roleSwitchInFlight = null;
    }
  }

  logout(): Promise<void> {
    if (this.logoutInFlight) return this.logoutInFlight;

    let logoutPromise!: Promise<void>;
    logoutPromise = this.performLogout().finally(() => {
      if (this.logoutInFlight === logoutPromise) this.logoutInFlight = null;
    });
    this.logoutInFlight = logoutPromise;
    return logoutPromise;
  }

  private async performLogout(): Promise<void> {
    this.logoutInProgress = true;
    this.invalidateSession();
    try {
      await this.credentialMutations;
      const renewableCredential = await this.dependencies.credentials.getRenewableCredential();
      if (renewableCredential) await this.dependencies.api.logout(renewableCredential);
    } catch {
      // Local cleanup is required even when the network logout request cannot complete.
    } finally {
      this.invalidateSession();
      await this.clearLocalCredentials();
      this.logoutInProgress = false;
    }
  }

  async cancelPendingOperations(): Promise<void> {
    this.invalidateSession();
    const pending = [this.refreshInFlight, this.restoreInFlight, this.credentialMutations, this.logoutInFlight].filter(
      (operation): operation is Promise<void> => operation !== null,
    );
    await Promise.allSettled(pending);
  }

  private async performRoleSwitch(role: MobileRole, generation: number): Promise<Bootstrap> {
    this.dispatch({ type: "switching_role" });
    try {
      const result = await this.runAuthorized((accessToken) => this.dependencies.api.switchRole(accessToken, role), generation);
      this.ensureCurrent(generation);
      this.clearAccessToken();
      this.accessToken = result.accessToken;
      this.accessExpiresAt = result.accessExpiresAt;
      this.dispatch({ type: "authenticated", bootstrap: result.bootstrap });
      return result.bootstrap;
    } catch (error) {
      if (this.isCurrent(generation)) {
        this.dispatch({ type: "recoverable_error", message: "Unable to switch roles." });
      }
      throw error;
    }
  }

  private dispatch(action: SessionAction): void {
    this.state = sessionReducer(this.state, action);
    for (const listener of this.listeners) listener(this.state);
  }

  private async establishSession(issue: SessionIssue, generation: number): Promise<void> {
    await this.acceptSessionIssue(issue, generation);
    await this.bootstrapCurrentAccess(generation);
  }

  private async acceptSessionIssue(issue: SessionIssue, generation: number): Promise<void> {
    this.ensureCurrent(generation);
    try {
      await this.enqueueCredentialMutation(() => this.dependencies.credentials.setRenewableCredential(issue.renewableCredential));
    } catch (error) {
      if (this.isCurrent(generation)) await this.signOutLocally();
      throw error;
    }
    this.ensureCurrent(generation);
    this.accessToken = issue.accessToken;
    this.accessExpiresAt = issue.accessExpiresAt;
  }

  private async bootstrapCurrentAccess(generation: number): Promise<void> {
    this.ensureCurrent(generation);
    const bootstrap = await this.dependencies.api.bootstrap(this.currentAccessToken());
    this.ensureCurrent(generation);
    this.dispatch({ type: "authenticated", bootstrap });
  }

  private async runAuthorized<T>(operation: (accessToken: string) => Promise<T>, generation: number): Promise<T> {
    const accessToken = await this.ensureCurrentAccess(generation);
    try {
      return await operation(accessToken);
    } catch (error) {
      if (!isUnauthorized(error)) throw error;
      this.ensureCurrent(generation);
      await this.refreshAccess(generation);
      return operation(await this.ensureCurrentAccess(generation));
    }
  }

  private async ensureCurrentAccess(generation: number): Promise<string> {
    this.ensureCurrent(generation);
    if (!this.accessToken || this.isExpired()) await this.refreshAccess(generation);
    this.ensureCurrent(generation);
    return this.currentAccessToken();
  }

  private currentAccessToken(): string {
    if (!this.accessToken) throw new Error("An access token is required for this operation.");
    return this.accessToken;
  }

  private isExpired(): boolean {
    return !this.accessExpiresAt || Number.isNaN(Date.parse(this.accessExpiresAt)) || Date.parse(this.accessExpiresAt) <= Date.now();
  }

  private refreshAccess(generation: number): Promise<void> {
    this.ensureCurrent(generation);
    return this.refreshForGeneration(generation);
  }

  private async refreshForGeneration(generation: number): Promise<void> {
    if (this.refreshInFlight) {
      if (this.refreshGeneration === generation) return this.refreshInFlight;
      try {
        await this.refreshInFlight;
      } catch {
        // The stale refresh was invalidated; the current generation may now start its own refresh.
      }
      this.ensureCurrent(generation);
      return this.refreshForGeneration(generation);
    }

    let refreshPromise!: Promise<void>;
    refreshPromise = this.refreshSession(generation).finally(() => {
      if (this.refreshInFlight === refreshPromise) {
        this.refreshInFlight = null;
        this.refreshGeneration = null;
      }
    });
    this.refreshInFlight = refreshPromise;
    this.refreshGeneration = generation;
    return refreshPromise;
  }

  private async refreshSession(generation: number): Promise<void> {
    const renewableCredential = await this.dependencies.credentials.getRenewableCredential();
    this.ensureCurrent(generation);
    if (!renewableCredential) {
      await this.signOutLocally();
      throw new Error("No renewable credential is available.");
    }

    try {
      const issue = await this.dependencies.api.refresh(renewableCredential);
      this.ensureCurrent(generation);
      await this.acceptSessionIssue(issue, generation);
    } catch (error) {
      if (this.isCurrent(generation)) await this.signOutLocally();
      throw error;
    }
  }

  private clearAccessToken(): void {
    this.accessToken = null;
    this.accessExpiresAt = null;
  }

  private async signOutLocally(): Promise<void> {
    this.invalidateSession();
    await this.clearLocalCredentials();
  }

  private invalidateSession(): void {
    this.sessionGeneration += 1;
    this.clearAccessToken();
    this.roleSwitchInFlight = null;
  }

  private isCurrent(generation: number): boolean {
    return generation === this.sessionGeneration;
  }

  private ensureCurrent(generation: number): void {
    if (!this.isCurrent(generation)) throw new SessionOperationSupersededError();
  }

  private beginSessionEstablishment(): number {
    if (this.logoutInProgress) throw new Error("A logout is in progress.");
    this.invalidateSession();
    return this.sessionGeneration;
  }

  private ensureSessionEstablishmentCurrent(generation: number): void {
    if (this.logoutInProgress) throw new Error("A logout is in progress.");
    this.ensureCurrent(generation);
  }

  private enqueueCredentialMutation(operation: () => Promise<void>): Promise<void> {
    const mutation = this.credentialMutations.then(operation, operation);
    this.credentialMutations = mutation.catch(() => undefined);
    return mutation;
  }

  private async clearLocalCredentials(): Promise<void> {
    try {
      await this.enqueueCredentialMutation(() => this.dependencies.credentials.clearCredentials());
    } catch {
      this.dispatch({ type: "recoverable_error", message: "Unable to clear local credentials." });
      return;
    }
    this.dispatch({ type: "signed_out" });
  }
}

export function createSessionController(dependencies: SessionControllerDependencies): SessionController {
  return new MobileSessionController(dependencies);
}
