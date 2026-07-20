import { queryClient, shouldRetryQuery } from "./query-client";

describe("query retry policy", () => {
  it("does not retry authentication or deterministic client failures", () => {
    for (const status of [400, 401, 403, 404]) {
      expect(shouldRetryQuery(0, { status })).toBe(false);
    }
  });

  it("retries transient and unknown failures exactly once", () => {
    for (const error of [undefined, { status: 408 }, { status: 429 }, { status: 500 }]) {
      expect(shouldRetryQuery(0, error)).toBe(true);
      expect(shouldRetryQuery(1, error)).toBe(false);
    }
  });

  it("configures the shared client with the policy", () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(shouldRetryQuery);
  });
});
