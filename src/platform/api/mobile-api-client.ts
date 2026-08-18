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
  };
}
