import { Platform } from "react-native";

import { RESIDENT_DEMO_PERMISSIONS } from "@/features/resident/catalog/resident-module-catalog";
import type {
  Bootstrap,
  MobileApi,
  MobileGuardVisitorRequest,
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

const guardDemoPermissions = [
  "operations:gate.manage",
  "operations:read",
  "operations:sos.raise",
  "community:read",
] as const;

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
    permissions: activeRole === "resident" ? [...RESIDENT_DEMO_PERMISSIONS] : [...guardDemoPermissions],
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
    async guardOverview() {
      return {
        counts: { expected: 0, inside: 0, pendingApproval: 0, pendingParcels: 0 },
        gateLabel: "Demo Main Gate",
      };
    },
    async guardVisitors() {
      return [];
    },
    async guardRequestVisitor(_accessToken: string, body: MobileGuardVisitorRequest) {
      return {
        arrivedAt: new Date(0).toISOString(),
        flatNumber: body.flatQuery,
        id: "demo-visitor",
        passcodeRequired: false,
        purpose: body.purpose,
        status: "expected" as const,
        visitorName: body.visitorName,
      };
    },
    async guardVisitor(_accessToken: string, visitorId: string) {
      return {
        arrivedAt: new Date(0).toISOString(),
        flatNumber: "A-308",
        id: visitorId,
        passcodeRequired: false,
        purpose: "guest",
        status: "expected" as const,
        visitorName: "Demo Visitor",
      };
    },
    async guardVerifyPasscodeLookup() {
      return {
        arrivedAt: new Date(0).toISOString(),
        flatNumber: "A-308",
        id: "demo-visitor",
        passcodeRequired: true,
        purpose: "guest",
        status: "expected" as const,
        visitorName: "Demo Visitor",
      };
    },
    async guardVerifyPasscode(_accessToken: string, visitorId: string) {
      return { id: visitorId, passcodeVerified: true };
    },
    async guardCheckIn(_accessToken: string, visitorId: string) {
      return {
        arrivedAt: new Date(0).toISOString(),
        entryTime: new Date(0).toISOString(),
        flatNumber: "A-308",
        id: visitorId,
        passcodeRequired: false,
        purpose: "guest",
        status: "inside" as const,
        visitorName: "Demo Visitor",
      };
    },
    async guardCheckOut(_accessToken: string, visitorId: string) {
      return {
        arrivedAt: new Date(0).toISOString(),
        entryTime: new Date(0).toISOString(),
        exitTime: new Date(0).toISOString(),
        flatNumber: "A-308",
        id: visitorId,
        passcodeRequired: false,
        purpose: "guest",
        status: "exited" as const,
        visitorName: "Demo Visitor",
      };
    },
    async residentVisitors() {
      return {
        flatNumber: "A-308",
        visitors: [
          {
            arrivedAt: new Date(0).toISOString(),
            createdAt: new Date(0).toISOString(),
            id: "demo-resident-visitor",
            purpose: "guest",
            status: "pending" as const,
            visitorName: "Demo Visitor",
          },
        ],
      };
    },
    async residentApproveVisitor(_accessToken: string, visitorId: string) {
      return {
        arrivedAt: new Date(0).toISOString(),
        createdAt: new Date(0).toISOString(),
        id: visitorId,
        purpose: "guest",
        status: "approved" as const,
        visitorName: "Demo Visitor",
      };
    },
    async residentRejectVisitor(_accessToken: string, visitorId: string) {
      return {
        arrivedAt: new Date(0).toISOString(),
        createdAt: new Date(0).toISOString(),
        id: visitorId,
        purpose: "guest",
        status: "rejected" as const,
        visitorName: "Demo Visitor",
      };
    },
    async raiseSos() {
      return {
        incidentId: "demo-incident-1",
        severity: "critical" as const,
        acknowledgementRequired: true,
        notificationsSent: 2,
      };
    },
    async listNotices() {
      return {
        notices: [
          {
            id: "demo-notice-1",
            title: "Annual General Meeting",
            body: "The AGM will be held on Sunday at 10 AM in the community hall.",
            category: "meeting" as const,
            postedBy: "Secretary",
            isPinned: true,
            expiresAt: null,
            createdAt: new Date(0).toISOString(),
            isRead: false,
          },
        ],
        unreadCount: 1,
      };
    },
    async unreadNoticeCount() {
      return { unreadCount: 1 };
    },
    async markNoticeRead(_accessToken: string, noticeId: string) {
      return {
        acknowledged: true as const,
        replayed: false,
        noticeId,
      };
    },
    async listHelpdesk() {
      return { complaints: [] };
    },
    async raiseComplaint() {
      return {
        created: true as const,
        complaintId: "demo-complaint-1",
        status: "open" as const,
        priority: "medium" as const,
        category: "general" as const,
        slaDueAt: new Date().toISOString(),
      };
    },
    async transitionComplaint() {
      return {
        transitioned: true as const,
        complaintId: "demo-complaint-1",
        status: "in_progress" as const,
      };
    },
    async rateComplaint() {
      return {
        rated: true as const,
        complaintId: "demo-complaint-1",
        rating: 5,
      };
    },
    async listBills() {
      return {
        bills: [
          {
            id: "demo-bill-1",
            amount: 5000,
            billType: "maintenance" as const,
            period: "2026-08",
            dueDate: new Date().toISOString(),
            status: "pending" as const,
            lateFee: 0,
            gstAmount: 0,
            totalAmount: 5000,
            description: "Monthly maintenance",
            paidAt: null,
            paidVia: null,
            paidAmount: null,
            receiptNumber: null,
            flatNumber: "A-101",
            createdAt: new Date(0).toISOString(),
          },
        ],
        totalPending: 5000,
        totalAmount: 5000,
      };
    },
    async getBill(_accessToken: string, billId: string) {
      return {
        id: billId,
        amount: 5000,
        billType: "maintenance" as const,
        period: "2026-08",
        dueDate: new Date().toISOString(),
        status: "pending" as const,
        lateFee: 0,
        gstAmount: 0,
        totalAmount: 5000,
        description: "Monthly maintenance",
        paidAt: null,
        paidVia: null,
        paidAmount: null,
        receiptNumber: null,
        flatNumber: "A-101",
        createdAt: new Date(0).toISOString(),
      };
    },
    async getBillPayments() {
      return { payments: [] };
    },
  };
}
