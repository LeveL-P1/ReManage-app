import {
  createMobileApi,
  MobileApiError,
  type PasswordLoginBody,
} from "./mobile-api-client";

type FetchCall = [RequestInfo | URL, RequestInit | undefined];

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function fakeFetch(responses: Response[]): jest.Mock<Promise<Response>, [RequestInfo | URL, RequestInit?]> {
  return jest.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
    const response = responses.shift();
    if (!response) throw new Error("Unexpected fetch request");
    return response;
  });
}

function requestPath(call: FetchCall): string {
  const [input] = call;
  return new URL(input instanceof Request ? input.url : String(input)).pathname;
}

function requestHeaders(call: FetchCall): Headers {
  const [input, init] = call;
  return input instanceof Request ? input.headers : new Headers(init?.headers);
}

function requestMethod(call: FetchCall): string | undefined {
  const [input, init] = call;
  return input instanceof Request ? input.method : init?.method;
}

describe("createMobileApi", () => {
  const passwordLogin: PasswordLoginBody = {
    identifier: "resident@example.com",
    installation: {
      appVersion: "1.0.0",
      id: "f4209b65-bbd1-4a92-a4eb-2beb6fcbb3f8",
      platform: "android",
    },
    password: "correct-horse-battery-staple",
  };

  it("posts password login only to the mobile password endpoint", async () => {
    const fetch = fakeFetch([jsonResponse({})]);
    const api = createMobileApi({ baseUrl: "https://api.example.test", fetch });

    await api.passwordLogin(passwordLogin);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(requestPath(fetch.mock.calls[0] as FetchCall)).toBe("/api/mobile/v1/auth/password");
    expect(requestMethod(fetch.mock.calls[0] as FetchCall)).toBe("POST");
  });

  it("posts refresh only to the mobile refresh endpoint", async () => {
    const fetch = fakeFetch([jsonResponse({})]);
    const api = createMobileApi({ baseUrl: "https://api.example.test", fetch });

    await api.refresh("renewable-credential");

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(requestPath(fetch.mock.calls[0] as FetchCall)).toBe("/api/mobile/v1/session/refresh");
    expect(requestMethod(fetch.mock.calls[0] as FetchCall)).toBe("POST");
  });

  it("attaches the supplied bearer token to bootstrap and role switching", async () => {
    const fetch = fakeFetch([jsonResponse({}), jsonResponse({})]);
    const api = createMobileApi({ baseUrl: "https://api.example.test", fetch });

    await api.bootstrap("access-token");
    await api.switchRole("access-token", "resident");

    expect(requestPath(fetch.mock.calls[0] as FetchCall)).toBe("/api/mobile/v1/session/bootstrap");
    expect(requestPath(fetch.mock.calls[1] as FetchCall)).toBe("/api/mobile/v1/session/active-role");
    expect(fetch.mock.calls.map((call) => requestHeaders(call as FetchCall).get("authorization"))).toEqual([
      "Bearer access-token",
      "Bearer access-token",
    ]);
  });

  it("does not expose or send the deprecated society header", async () => {
    const fetch = fakeFetch([jsonResponse({})]);
    const api = createMobileApi({ baseUrl: "https://api.example.test", fetch });

    // @ts-expect-error MobileApi methods intentionally do not accept a society header.
    await api.passwordLogin(passwordLogin, { "x-society-id": "society-1" });

    expect(requestHeaders(fetch.mock.calls[0] as FetchCall).has("x-society-id")).toBe(false);
  });

  it("turns JSON problem responses into typed MobileApiError values", async () => {
    const fetch = fakeFetch([
      jsonResponse(
        {
          code: "invalid_credentials",
          message: "Invalid credentials",
          requestId: "req-123",
          fieldErrors: { password: "Incorrect password" },
        },
        401,
      ),
    ]);
    const api = createMobileApi({ baseUrl: "https://api.example.test", fetch });

    await expect(api.passwordLogin(passwordLogin)).rejects.toEqual(
      expect.objectContaining<Partial<MobileApiError>>({
        status: 401,
        code: "invalid_credentials",
        message: "Invalid credentials",
        requestId: "req-123",
        fieldErrors: { password: "Incorrect password" },
      }),
    );
  });

  it("accepts application/problem+json problem responses", async () => {
    const fetch = fakeFetch([
      new Response(
        JSON.stringify({
          code: "otp_expired",
          message: "The verification code has expired.",
          requestId: "req-problem-123",
          fieldErrors: { code: "Request a new code." },
        }),
        {
          status: 422,
          headers: { "content-type": "application/problem+json" },
        },
      ),
    ]);
    const api = createMobileApi({ baseUrl: "https://api.example.test", fetch });

    await expect(api.passwordLogin(passwordLogin)).rejects.toEqual(
      expect.objectContaining<Partial<MobileApiError>>({
        status: 422,
        code: "otp_expired",
        message: "The verification code has expired.",
        requestId: "req-problem-123",
        fieldErrors: { code: "Request a new code." },
      }),
    );
  });

  it("redacts non-JSON server responses", async () => {
    const fetch = fakeFetch([
      new Response("upstream diagnostic: do not expose", {
        status: 502,
        headers: { "content-type": "text/plain" },
      }),
    ]);
    const api = createMobileApi({ baseUrl: "https://api.example.test", fetch });

    let thrown: unknown;
    try {
      await api.passwordLogin(passwordLogin);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toEqual(
      expect.objectContaining<Partial<MobileApiError>>({ status: 502, code: "invalid_server_response" }),
    );
    expect(thrown).toBeInstanceOf(MobileApiError);
    expect(thrown).not.toHaveProperty("responseText");
    expect(JSON.stringify(thrown)).not.toContain("upstream diagnostic");
  });

  it.each([
    ["a non-JSON success response", new Response("upstream diagnostic: do not expose", { status: 200 })],
    [
      "a malformed JSON success response",
      new Response("{not valid JSON", { status: 200, headers: { "content-type": "application/json" } }),
    ],
  ])("redacts %s that openapi-fetch cannot parse", async (_description, response) => {
    const fetch = fakeFetch([response]);
    const api = createMobileApi({ baseUrl: "https://api.example.test", fetch });

    let thrown: unknown;
    try {
      await api.passwordLogin(passwordLogin);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toEqual(
      expect.objectContaining<Partial<MobileApiError>>({ code: "invalid_server_response" }),
    );
    expect(thrown).toBeInstanceOf(MobileApiError);
    expect(thrown).toHaveProperty("message", "The server returned an invalid response.");
    expect(JSON.stringify(thrown)).not.toContain("upstream diagnostic");
  });
});
