import type {
  Bootstrap,
  MobileApi,
  MobileRole,
  OtpAccepted,
  PasswordLoginBody,
  RoleSwitchResult,
  SessionIssue,
} from "@/platform/api/mobile-api-client";
import type { CredentialStore } from "@/platform/auth/credential-store";
import type { MobileInstallation } from "@/platform/auth/installation";

export const fakeInstallation: MobileInstallation = {
  id: "installation-1",
  platform: "android",
  appVersion: "1.0.0",
  deviceName: "Pixel 9",
};

export function fakeBootstrap(role: MobileRole = "resident"): Bootstrap {
  return {
    activeRole: role,
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
}

export function fakeSessionIssue(overrides: Partial<SessionIssue> = {}): SessionIssue {
  return {
    accessExpiresAt: "2099-01-01T00:00:00.000Z",
    accessToken: "access-token",
    activeRole: "resident",
    deviceSessionId: "device-session-1",
    renewableCredential: "renewable-credential",
    renewableExpiresAt: "2099-02-01T00:00:00.000Z",
    ...overrides,
  };
}

export function fakeRoleSwitch(overrides: Partial<RoleSwitchResult> = {}): RoleSwitchResult {
  return {
    accessExpiresAt: "2099-01-01T00:00:00.000Z",
    accessToken: "switched-access-token",
    bootstrap: fakeBootstrap("guard"),
    ...overrides,
  };
}

export class FakeCredentialStore implements CredentialStore {
  renewableCredential: string | null;
  installationId: string | null = fakeInstallation.id;

  readonly getRenewableCredential = jest.fn(async () => this.renewableCredential);
  readonly setRenewableCredential = jest.fn(async (value: string) => {
    this.renewableCredential = value;
  });
  readonly clearCredentials = jest.fn(async () => {
    this.renewableCredential = null;
  });
  readonly getInstallationId = jest.fn(async () => this.installationId);
  readonly setInstallationId = jest.fn(async (value: string) => {
    this.installationId = value;
  });
  readonly purgeDeviceState = jest.fn(async () => {
    this.renewableCredential = null;
    this.installationId = null;
  });

  constructor(renewableCredential: string | null = null) {
    this.renewableCredential = renewableCredential;
  }
}

export class FakeMobileApi implements MobileApi {
  passwordIssue = fakeSessionIssue({ renewableCredential: "password-renewable", accessToken: "password-access" });
  otpIssue = fakeSessionIssue({ renewableCredential: "otp-renewable", accessToken: "otp-access" });
  refreshIssue = fakeSessionIssue({ renewableCredential: "rotated-renewable", accessToken: "refreshed-access" });
  bootstrapResult = fakeBootstrap();
  roleSwitchResult = fakeRoleSwitch();
  otpAccepted: OtpAccepted = { accepted: true, challengeId: "challenge-1" };

  readonly passwordLogin = jest.fn(async (_body: PasswordLoginBody) => this.passwordIssue);
  readonly requestOtp = jest.fn(async (_body) => this.otpAccepted);
  readonly verifyOtp = jest.fn(async (_body) => this.otpIssue);
  readonly refresh = jest.fn(async (_renewableCredential: string) => this.refreshIssue);
  readonly bootstrap = jest.fn(async (_accessToken: string) => this.bootstrapResult);
  readonly switchRole = jest.fn(async (_accessToken: string, _role: MobileRole) => this.roleSwitchResult);
  readonly logout = jest.fn(async (_renewableCredential: string) => ({ loggedOut: true }) as const);
}

export function deferred<T>(): { promise: Promise<T>; resolve(value: T): void; reject(reason?: unknown): void } {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
