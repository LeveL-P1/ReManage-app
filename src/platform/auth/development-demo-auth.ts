import { Platform } from "react-native";

import type {
  Bootstrap,
  MobileApi,
  MobileRole,
  RoleSwitchResult,
  SessionIssue,
} from "@/platform/api/mobile-api-client";
import type { MobileInstallation } from "./installation";

export const demoCredentials = {
  email: "demo@remanage.local",
  password: "ReManageDemo2026!",
} as const;

export const demoOtpUnavailableMessage = "Email-code sign-in requires the real mobile API.";

export interface SessionRuntime {
  isDevelopment: boolean;
  platform: string;
}

export const developmentDemoInstallation: MobileInstallation = {
  id: "development-web-demo-installation",
  platform: "android",
  appVersion: "0.0.0-demo",
  deviceName: "Development web preview",
};

export function isDevelopmentWebPreview(
  runtime: SessionRuntime = { isDevelopment: __DEV__, platform: Platform.OS },
): boolean {
  return runtime.isDevelopment && runtime.platform === "web";
}

function demoBootstrap(activeRole: MobileRole): Bootstrap {
  return {
    activeRole,
    approvedRoles: ["resident", "guard"],
    featureFlags: { guardOffline: false, guardShell: true, nativePush: false, residentShell: true },
    notificationPolicy: {
      community: { configurable: true, enabled: false },
      critical: { configurable: false, enabled: true },
      transactional: { configurable: true, enabled: true },
    },
    permissions: ["dashboard.read"],
    society: { id: "demo-society", name: "ReManage Demo Society" },
    user: { id: "demo-user", name: "Demo User", email: demoCredentials.email },
  };
}

function demoSessionIssue(activeRole: MobileRole): SessionIssue {
  return {
    accessToken: `demo-access-${activeRole}`,
    accessExpiresAt: "2099-01-01T00:00:00.000Z",
    renewableCredential: "demo-renewable-credential",
    renewableExpiresAt: "2099-02-01T00:00:00.000Z",
    deviceSessionId: "development-web-demo-session",
    activeRole,
  };
}

function invalidCredentials(): Error {
  return new Error("Invalid credentials");
}

export function createDevelopmentDemoMobileApi(): MobileApi {
  let activeRole: MobileRole = "resident";

  return {
    async passwordLogin(body) {
      if (body.identifier.trim().toLowerCase() !== demoCredentials.email || body.password !== demoCredentials.password) {
        throw invalidCredentials();
      }
      activeRole = "resident";
      return demoSessionIssue(activeRole);
    },
    async requestOtp() {
      throw new Error(demoOtpUnavailableMessage);
    },
    async verifyOtp() {
      throw new Error(demoOtpUnavailableMessage);
    },
    async refresh(renewableCredential) {
      if (renewableCredential !== "demo-renewable-credential") throw invalidCredentials();
      return demoSessionIssue(activeRole);
    },
    async bootstrap(accessToken) {
      if (accessToken !== `demo-access-${activeRole}`) throw invalidCredentials();
      return demoBootstrap(activeRole);
    },
    async switchRole(accessToken, role): Promise<RoleSwitchResult> {
      if (accessToken !== `demo-access-${activeRole}`) throw invalidCredentials();
      activeRole = role;
      const issue = demoSessionIssue(activeRole);
      return { accessToken: issue.accessToken, accessExpiresAt: issue.accessExpiresAt, bootstrap: demoBootstrap(activeRole) };
    },
    async logout() {
      return { loggedOut: true } as const;
    },
  };
}
