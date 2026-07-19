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

export interface MobileApi {
  passwordLogin(body: PasswordLoginBody): Promise<SessionIssue>;
  requestOtp(body: OtpRequestBody): Promise<OtpAccepted>;
  verifyOtp(body: OtpVerifyBody): Promise<SessionIssue>;
  refresh(renewableCredential: string): Promise<SessionIssue>;
  bootstrap(accessToken: string): Promise<Bootstrap>;
  switchRole(accessToken: string, role: MobileRole): Promise<RoleSwitchResult>;
  logout(renewableCredential: string): Promise<{ loggedOut: true }>;
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
  };
}
