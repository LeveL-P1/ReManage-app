import createClient from "openapi-fetch";

import { publicEnvironment } from "@/platform/config/env";

import type { components, paths } from "./generated/mobile-v1";

type Schemas = components["schemas"];

export type PasswordLoginBody = Schemas["PasswordLoginRequestDto"];
export type OtpRequestBody = Schemas["OtpRequestDto"];
export type OtpVerifyBody = Schemas["OtpVerifyDto"];
export type OtpAccepted = Schemas["OtpRequestAcceptedDto"];
export type SessionIssue = Schemas["MobileSessionIssueDto"];
export type Bootstrap = Schemas["MobileBootstrapDto"];
export type MobileRole = Schemas["UpdateMobileActiveRoleDto"]["role"];
export type RoleSwitchResult = Schemas["MobileRoleSwitchDto"];
export type MobileGuardOverview = Schemas["MobileGuardOverviewDto"];
export type MobileGuardVisitor = Schemas["MobileGuardVisitorDto"];
export type MobileGuardVisitorRequest = Schemas["RequestVisitorDto"];
export type MobileGuardPasscodeResult = Schemas["MobileGuardPasscodeResultDto"];
export type MobileResidentVisitor = Schemas["MobileResidentVisitorDto"];
export type MobileResidentVisitors = Schemas["MobileResidentVisitorsDto"];
export type MobileSosResult = Schemas["MobileSosResultDto"];
export type MobileSosRequestBody = Schemas["RaiseMobileSosDto"];
export type MobileNotice = Schemas["MobileNoticeDto"];
export type MobileNoticeList = Schemas["MobileNoticeListDto"];
export type MobileNoticeMarkReadResult = Schemas["MobileNoticeMarkReadDto"];
export type MobileHelpdeskComplaint = Schemas["MobileHelpdeskComplaintDto"];
export type MobileHelpdeskList = Schemas["MobileHelpdeskListDto"];
export type MobileHelpdeskRaiseResult = Schemas["MobileHelpdeskRaiseResultDto"];
export type MobileHelpdeskTransitionResult = Schemas["MobileHelpdeskTransitionResultDto"];
export type MobileHelpdeskRateResult = Schemas["MobileHelpdeskRateResultDto"];
export type MobileBill = Schemas["MobileBillDto"];
export type MobileBillList = Schemas["MobileBillListDto"];
export type MobileBillPayment = Schemas["MobileBillPaymentDto"];
export type MobileBillPayments = Schemas["MobileBillPaymentsDto"];
export type MobileEvent = Schemas["MobileEventDto"];
export type MobileEventList = Schemas["MobileEventListDto"];
export type MobileEventRsvp = Schemas["MobileRsvpResultDto"];
export type MobilePoll = Schemas["MobilePollDto"];
export type MobilePollList = Schemas["MobilePollListDto"];
export type MobileVoteResult = Schemas["MobileVoteResultDto"];
export type MobileDocument = Schemas["MobileDocumentDto"];
export type MobileDocumentList = Schemas["MobileDocumentListDto"];
export type MobileForumThread = Schemas["MobileForumThreadDto"];
export type MobileForumThreadList = Schemas["MobileForumThreadListDto"];
export type MobileForumReply = Schemas["MobileForumReplyDto"];
export type MobileForumReplyList = Schemas["MobileForumReplyListDto"];

export interface MobileApi {
  passwordLogin(body: PasswordLoginBody): Promise<SessionIssue>;
  requestOtp(body: OtpRequestBody): Promise<OtpAccepted>;
  verifyOtp(body: OtpVerifyBody): Promise<SessionIssue>;
  refresh(renewableCredential: string): Promise<SessionIssue>;
  bootstrap(accessToken: string): Promise<Bootstrap>;
  switchRole(accessToken: string, role: MobileRole): Promise<RoleSwitchResult>;
  logout(renewableCredential: string): Promise<{ loggedOut: true }>;
  guardOverview(accessToken: string): Promise<MobileGuardOverview>;
  guardVisitors(accessToken: string, status?: string): Promise<MobileGuardVisitor[]>;
  guardRequestVisitor(accessToken: string, body: MobileGuardVisitorRequest): Promise<MobileGuardVisitor>;
  guardVisitor(accessToken: string, visitorId: string): Promise<MobileGuardVisitor>;
  guardVerifyPasscodeLookup(accessToken: string, passcode: string): Promise<MobileGuardVisitor>;
  guardVerifyPasscode(accessToken: string, visitorId: string, passcode: string): Promise<MobileGuardPasscodeResult>;
  guardCheckIn(accessToken: string, visitorId: string): Promise<MobileGuardVisitor>;
  guardCheckOut(accessToken: string, visitorId: string): Promise<MobileGuardVisitor>;
  residentVisitors(accessToken: string): Promise<MobileResidentVisitors>;
  residentApproveVisitor(accessToken: string, visitorId: string): Promise<MobileResidentVisitor>;
  residentRejectVisitor(accessToken: string, visitorId: string): Promise<MobileResidentVisitor>;
  raiseSos(accessToken: string, body?: MobileSosRequestBody): Promise<MobileSosResult>;
  listNotices(accessToken: string, options?: { category?: string; activeOnly?: boolean }): Promise<MobileNoticeList>;
  unreadNoticeCount(accessToken: string): Promise<{ unreadCount: number }>;
  markNoticeRead(accessToken: string, noticeId: string): Promise<MobileNoticeMarkReadResult>;
  listHelpdesk(accessToken: string, options?: { status?: string }): Promise<MobileHelpdeskList>;
  raiseComplaint(accessToken: string, body: { title: string; description: string; category?: string; priority?: string; mediaUrls?: string[] }): Promise<MobileHelpdeskRaiseResult>;
  transitionComplaint(accessToken: string, complaintId: string, body: { action: string; resolution?: string }): Promise<MobileHelpdeskTransitionResult>;
  rateComplaint(accessToken: string, complaintId: string, body: { rating: number; comment?: string }): Promise<MobileHelpdeskRateResult>;
  listBills(accessToken: string): Promise<MobileBillList>;
  getBill(accessToken: string, billId: string): Promise<MobileBill>;
  getBillPayments(accessToken: string, billId: string): Promise<MobileBillPayments>;
  listEvents(accessToken: string, options?: { status?: string }): Promise<MobileEventList>;
  rsvpEvent(accessToken: string, body: { eventId: string; response: string }): Promise<MobileEventRsvp>;
  listPolls(accessToken: string, options?: { status?: string }): Promise<MobilePollList>;
  votePoll(accessToken: string, pollId: string, optionIndex: number): Promise<MobileVoteResult>;
  listDocuments(accessToken: string): Promise<MobileDocumentList>;
  listForumThreads(accessToken: string, options?: { category?: string }): Promise<MobileForumThreadList>;
  listForumReplies(accessToken: string, threadId: string): Promise<MobileForumReplyList>;
  createForumThread(accessToken: string, body: { title: string; content: string; category?: string }): Promise<{ created: true; threadId: string }>;
  replyForumThread(accessToken: string, threadId: string, content: string): Promise<{ replied: true; replyId: string }>;
}

export interface MobileApiClientOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

type FieldErrors = Record<string, string>;

export class MobileApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId: string | undefined,
    public readonly fieldErrors: FieldErrors | undefined,
  ) {
    super(message);
    this.name = "MobileApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeFieldErrors(value: unknown): FieldErrors | undefined {
  if (!isRecord(value)) return undefined;
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function isJsonContentType(contentType: string): boolean {
  const mediaType = contentType.split(";", 1)[0].trim().toLowerCase();
  return mediaType === "application/json" || mediaType.endsWith("+json");
}

function invalidServerResponse(status: number): MobileApiError {
  return new MobileApiError(
    status,
    "invalid_server_response",
    "The server returned an invalid response.",
    undefined,
    undefined,
  );
}

function errorFromResult(response: Response, error: unknown): MobileApiError {
  const contentType = response.headers.get("content-type") ?? "";
  if (!isJsonContentType(contentType) || !isRecord(error)) return invalidServerResponse(response.status);

  return new MobileApiError(
    response.status,
    typeof error.code === "string" ? error.code : "request_failed",
    typeof error.message === "string" ? error.message : "The request could not be completed.",
    typeof error.requestId === "string" ? error.requestId : undefined,
    normalizeFieldErrors(error.fieldErrors),
  );
}

async function unwrap<T>(result: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  try {
    const { data, error, response } = await result;
    if (error !== undefined) throw errorFromResult(response, error);
    if (data !== undefined) return data;
    throw errorFromResult(response, undefined);
  } catch (error) {
    if (error instanceof MobileApiError) throw error;
    throw invalidServerResponse(0);
  }
}

function bearer(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

function responseValidatingFetch(fetch: typeof globalThis.fetch): typeof globalThis.fetch {
  return async (input, init) => {
    const response = await fetch(input, init);
    if (!response.ok) return response;

    if (!isJsonContentType(response.headers.get("content-type") ?? "")) {
      throw invalidServerResponse(response.status);
    }
    try {
      await response.clone().json();
    } catch {
      throw invalidServerResponse(response.status);
    }
    return response;
  };
}

export function createMobileApi(options: MobileApiClientOptions = {}): MobileApi {
  const client = createClient<paths>({
    baseUrl: options.baseUrl ?? publicEnvironment.apiBaseUrl,
    fetch: responseValidatingFetch(options.fetch ?? globalThis.fetch),
  });

  return {
    passwordLogin: (body) => unwrap(client.POST("/api/mobile/v1/auth/password", { body })),
    requestOtp: (body) => unwrap(client.POST("/api/mobile/v1/auth/otp/request", { body })),
    verifyOtp: (body) => unwrap(client.POST("/api/mobile/v1/auth/otp/verify", { body })),
    refresh: (renewableCredential) =>
      unwrap(client.POST("/api/mobile/v1/session/refresh", { body: { renewableCredential } })),
    bootstrap: (accessToken) =>
      unwrap(client.GET("/api/mobile/v1/session/bootstrap", { headers: bearer(accessToken) })),
    switchRole: (accessToken, role) =>
      unwrap(client.PUT("/api/mobile/v1/session/active-role", { body: { role }, headers: bearer(accessToken) })),
    logout: (renewableCredential) =>
      unwrap(client.POST("/api/mobile/v1/session/logout", { body: { renewableCredential } })),
    guardOverview: (accessToken) =>
      unwrap(client.GET("/api/mobile/v1/guard/gate/overview", { headers: bearer(accessToken) })),
    guardVisitors: (accessToken, status) =>
      unwrap(client.GET("/api/mobile/v1/guard/visitors", {
        headers: bearer(accessToken),
        params: status ? { query: { status } } : undefined,
      })),
    guardRequestVisitor: (accessToken, body) =>
      unwrap(client.POST("/api/mobile/v1/guard/visitors", { body, headers: bearer(accessToken) })),
    guardVisitor: (accessToken, visitorId) =>
      unwrap(client.GET("/api/mobile/v1/guard/visitors/{visitorId}", {
        headers: bearer(accessToken),
        params: { path: { visitorId } },
      })),
    guardVerifyPasscodeLookup: (accessToken, passcode) =>
      unwrap(client.POST("/api/mobile/v1/guard/visitors/passcode/verify", {
        body: { passcode },
        headers: bearer(accessToken),
      })),
    guardVerifyPasscode: (accessToken, visitorId, passcode) =>
      unwrap(client.POST("/api/mobile/v1/guard/visitors/{visitorId}/verify-passcode", {
        body: { passcode },
        headers: bearer(accessToken),
        params: { path: { visitorId } },
      })),
    guardCheckIn: (accessToken, visitorId) =>
      unwrap(client.POST("/api/mobile/v1/guard/visitors/{visitorId}/check-in", {
        headers: bearer(accessToken),
        params: { path: { visitorId } },
      })),
    guardCheckOut: (accessToken, visitorId) =>
      unwrap(client.POST("/api/mobile/v1/guard/visitors/{visitorId}/check-out", {
        headers: bearer(accessToken),
        params: { path: { visitorId } },
      })),
    residentVisitors: (accessToken) =>
      unwrap(client.GET("/api/mobile/v1/resident/visitors", { headers: bearer(accessToken) })),
    residentApproveVisitor: (accessToken, visitorId) =>
      unwrap(client.POST("/api/mobile/v1/resident/visitors/{visitorId}/approve", {
        headers: bearer(accessToken),
        params: { path: { visitorId } },
      })),
    residentRejectVisitor: (accessToken, visitorId) =>
      unwrap(client.POST("/api/mobile/v1/resident/visitors/{visitorId}/reject", {
        headers: bearer(accessToken),
        params: { path: { visitorId } },
      })),
    raiseSos: (accessToken, body = {}) =>
      unwrap(client.POST("/api/mobile/v1/sos/raise", {
        body,
        headers: bearer(accessToken),
      })),
    listNotices: (accessToken, options = {}) =>
      unwrap(client.GET("/api/mobile/v1/notices", {
        headers: bearer(accessToken),
        params: { query: { category: options.category as never, activeOnly: options.activeOnly } },
      })),
    unreadNoticeCount: (accessToken) =>
      unwrap(client.GET("/api/mobile/v1/notices/unread-count", { headers: bearer(accessToken) })),
    markNoticeRead: (accessToken, noticeId) =>
      unwrap(client.POST("/api/mobile/v1/notices/read", {
        body: { noticeId },
        headers: bearer(accessToken),
      })),
    listHelpdesk: (accessToken, options = {}) =>
      unwrap(client.GET("/api/mobile/v1/helpdesk", {
        headers: bearer(accessToken),
        params: { query: { status: options.status as never } },
      })),
    raiseComplaint: (accessToken, body) =>
      unwrap(client.POST("/api/mobile/v1/helpdesk/raise", {
        body: body as never,
        headers: bearer(accessToken),
      })),
    transitionComplaint: (accessToken, complaintId, body) =>
      unwrap(client.POST("/api/mobile/v1/helpdesk/{complaintId}/transition", {
        body: body as never,
        headers: bearer(accessToken),
        params: { path: { complaintId } },
      })),
    rateComplaint: (accessToken, complaintId, body) =>
      unwrap(client.POST("/api/mobile/v1/helpdesk/{complaintId}/rate", {
        body,
        headers: bearer(accessToken),
        params: { path: { complaintId } },
      })),
    listBills: (accessToken) =>
      unwrap(client.GET("/api/mobile/v1/bills", { headers: bearer(accessToken) })),
    getBill: (accessToken, billId) =>
      unwrap(client.GET("/api/mobile/v1/bills/{billId}", {
        headers: bearer(accessToken),
        params: { path: { billId } },
      })),
    getBillPayments: (accessToken, billId) =>
      unwrap(client.GET("/api/mobile/v1/bills/{billId}/payments", {
        headers: bearer(accessToken),
        params: { path: { billId } },
      })),
    listEvents: (accessToken, options = {}) =>
      unwrap(client.GET("/api/mobile/v1/events", {
        headers: bearer(accessToken),
        params: { query: { status: options.status as never } },
      })),
    rsvpEvent: (accessToken, body) =>
      unwrap(client.POST("/api/mobile/v1/events/rsvp", {
        body: body as never,
        headers: bearer(accessToken),
      })),
    listPolls: (accessToken, options = {}) =>
      unwrap(client.GET("/api/mobile/v1/polls", {
        headers: bearer(accessToken),
        params: { query: { status: options.status as never } },
      })),
    votePoll: (accessToken, pollId, optionIndex) =>
      unwrap(client.POST("/api/mobile/v1/polls/vote", {
        body: { pollId, optionIndex },
        headers: bearer(accessToken),
      })),
    listDocuments: (accessToken) =>
      unwrap(client.GET("/api/mobile/v1/documents", { headers: bearer(accessToken) })),
    listForumThreads: (accessToken, options = {}) =>
      unwrap(client.GET("/api/mobile/v1/forum/threads", {
        headers: bearer(accessToken),
        params: { query: { category: options.category as never } },
      })),
    listForumReplies: (accessToken, threadId) =>
      unwrap(client.GET("/api/mobile/v1/forum/threads/{threadId}/replies", {
        headers: bearer(accessToken),
        params: { path: { threadId } },
      })),
    createForumThread: (accessToken, body) =>
      unwrap(client.POST("/api/mobile/v1/forum/threads", {
        body: body as never,
        headers: bearer(accessToken),
      })),
    replyForumThread: (accessToken, threadId, content) =>
      unwrap(client.POST("/api/mobile/v1/forum/threads/reply", {
        body: { threadId, content },
        headers: bearer(accessToken),
      })),
  };
}
