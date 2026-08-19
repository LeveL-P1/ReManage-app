import type {
  Bootstrap,
  MobileApi,
  MobileRole,
  OtpAccepted,
  PasswordLoginBody,
  RoleSwitchResult,
  SessionIssue,
} from "@/platform/api/mobile-api-client";
import { RESIDENT_DEMO_PERMISSIONS } from "@/features/resident/catalog/resident-module-catalog";
import type { CredentialStore } from "@/platform/auth/credential-store";
import type { MobileInstallation } from "@/platform/auth/installation";

export const fakeInstallation: MobileInstallation = {
  id: "installation-1",
  platform: "android",
  appVersion: "1.0.0",
  deviceName: "Pixel 9",
};

const guardDemoPermissions = [
  "operations:gate.manage",
  "operations:read",
  "operations:sos.raise",
  "community:read",
] as const;

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
    permissions: role === "resident" ? [...RESIDENT_DEMO_PERMISSIONS] : [...guardDemoPermissions],
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
  readonly guardOverview = jest.fn(async () => ({
    counts: { expected: 0, inside: 0, pendingApproval: 0, pendingParcels: 0 },
    gateLabel: "Main Gate",
  }));
  readonly guardVisitors = jest.fn(async () => []);
  readonly guardRequestVisitor = jest.fn(async (_accessToken, body) => ({
    arrivedAt: new Date(0).toISOString(),
    flatNumber: body.flatQuery,
    id: "visitor-1",
    passcodeRequired: false,
    purpose: body.purpose,
    status: "expected" as const,
    visitorName: body.visitorName,
  }));
  readonly guardVisitor = jest.fn(async (_accessToken, visitorId) => ({
    arrivedAt: new Date(0).toISOString(),
    flatNumber: "A-308",
    id: visitorId,
    passcodeRequired: false,
    purpose: "guest",
    status: "expected" as const,
    visitorName: "Maya",
  }));
  readonly guardVerifyPasscode = jest.fn(async (_accessToken, visitorId) => ({ id: visitorId, passcodeVerified: true }));
  readonly guardVerifyPasscodeLookup = jest.fn(async (_accessToken, _passcode) => ({
    arrivedAt: new Date(0).toISOString(),
    flatNumber: "A-308",
    id: "visitor-1",
    passcodeRequired: true,
    purpose: "guest",
    status: "expected" as const,
    visitorName: "Maya",
  }));
  readonly guardCheckIn = jest.fn(async (_accessToken, visitorId) => ({
    arrivedAt: new Date(0).toISOString(),
    entryTime: new Date(0).toISOString(),
    flatNumber: "A-308",
    id: visitorId,
    passcodeRequired: false,
    purpose: "guest",
    status: "inside" as const,
    visitorName: "Maya",
  }));
  readonly guardCheckOut = jest.fn(async (_accessToken, visitorId) => ({
    arrivedAt: new Date(0).toISOString(),
    entryTime: new Date(0).toISOString(),
    exitTime: new Date(0).toISOString(),
    flatNumber: "A-308",
    id: visitorId,
    passcodeRequired: false,
    purpose: "guest",
    status: "exited" as const,
    visitorName: "Maya",
  }));
  readonly residentVisitors = jest.fn(async () => ({
    flatNumber: "A-308",
    visitors: [],
  }));
  readonly residentApproveVisitor = jest.fn(async (_accessToken, visitorId) => ({
    arrivedAt: new Date(0).toISOString(),
    createdAt: new Date(0).toISOString(),
    id: visitorId,
    purpose: "guest",
    status: "approved" as const,
    visitorName: "Maya",
  }));
  readonly residentRejectVisitor = jest.fn(async (_accessToken, visitorId) => ({
    arrivedAt: new Date(0).toISOString(),
    createdAt: new Date(0).toISOString(),
    id: visitorId,
    purpose: "guest",
    status: "rejected" as const,
    visitorName: "Maya",
  }));
  readonly raiseSos = jest.fn(async () => ({
    incidentId: "demo-incident-1",
    severity: "critical" as const,
    acknowledgementRequired: true,
    notificationsSent: 2,
  }));
  readonly listNotices = jest.fn(async () => ({
    notices: [],
    unreadCount: 0,
  }));
  readonly unreadNoticeCount = jest.fn(async () => ({ unreadCount: 0 }));
  readonly markNoticeRead = jest.fn(async (_accessToken, noticeId: string) => ({
    acknowledged: true as const,
    replayed: false,
    noticeId,
  }));
  readonly listHelpdesk = jest.fn(async () => ({ complaints: [] }));
  readonly raiseComplaint = jest.fn(async () => ({
    created: true as const,
    complaintId: "demo-complaint-1",
    status: "open" as const,
    priority: "medium" as const,
    category: "general" as const,
    slaDueAt: new Date().toISOString(),
  }));
  readonly transitionComplaint = jest.fn(async () => ({
    transitioned: true as const,
    complaintId: "demo-complaint-1",
    status: "in_progress" as const,
  }));
  readonly rateComplaint = jest.fn(async () => ({
    rated: true as const,
    complaintId: "demo-complaint-1",
    rating: 5,
  }));
  readonly listBills = jest.fn(async () => ({
    bills: [],
    totalPending: 0,
    totalAmount: 0,
  }));
  readonly getBill = jest.fn(async (_accessToken, billId: string) => ({
    id: billId,
    amount: 5000,
    billType: "maintenance" as const,
    period: "2026-08",
    dueDate: new Date().toISOString(),
    status: "pending" as const,
    lateFee: 0,
    gstAmount: 0,
    totalAmount: 5000,
    description: null,
    paidAt: null,
    paidVia: null,
    paidAmount: null,
    receiptNumber: null,
    flatNumber: "A-101",
    createdAt: new Date().toISOString(),
  }));
  readonly getBillPayments = jest.fn(async () => ({ payments: [] }));
  readonly listEvents = jest.fn(async () => ({ events: [] }));
  readonly rsvpEvent = jest.fn(async () => ({ rsvp: true, replayed: false, eventId: "event-1", response: "attending" as const }));
  readonly listPolls = jest.fn(async () => ({ polls: [] }));
  readonly votePoll = jest.fn(async () => ({ voted: true, replayed: false, pollId: "poll-1", optionIndex: 0 }));
  readonly listDocuments = jest.fn(async () => ({ documents: [] }));
  readonly listForumThreads = jest.fn(async () => ({ threads: [] }));
  readonly listForumReplies = jest.fn(async () => ({ replies: [] }));
  readonly createForumThread = jest.fn(async () => ({ created: true as const, threadId: "thread-1" }));
  readonly replyForumThread = jest.fn(async () => ({ replied: true as const, replyId: "reply-1" }));
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
