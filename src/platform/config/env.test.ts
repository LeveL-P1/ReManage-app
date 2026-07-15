import { readPublicEnvironment } from "./env";

describe("public environment", () => {
  it("accepts only an HTTP API base URL", () => {
    expect(
      readPublicEnvironment({ EXPO_PUBLIC_API_BASE_URL: "https://api.remanage.test" }),
    ).toEqual({ apiBaseUrl: "https://api.remanage.test" });
  });

  it("rejects missing and non-HTTP values", () => {
    expect(() => readPublicEnvironment({})).toThrow("EXPO_PUBLIC_API_BASE_URL");
    expect(() =>
      readPublicEnvironment({ EXPO_PUBLIC_API_BASE_URL: "file:///tmp/api" }),
    ).toThrow("http or https");
  });
});
