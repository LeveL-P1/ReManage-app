import {
  createDevelopmentDemoMobileApi,
  demoCredentials,
  demoOtpUnavailableMessage,
  developmentDemoInstallation,
  isDevelopmentWebPreview,
} from "./development-demo-auth";

describe("development demo authentication", () => {
  it("is available only for development web", () => {
    expect(isDevelopmentWebPreview({ isDevelopment: true, platform: "web" })).toBe(true);
    expect(isDevelopmentWebPreview({ isDevelopment: false, platform: "web" })).toBe(false);
    expect(isDevelopmentWebPreview({ isDevelopment: true, platform: "android" })).toBe(false);
  });

  it("issues a resident demo session only for the fixed credentials", async () => {
    const api = createDevelopmentDemoMobileApi();

    await expect(
      api.passwordLogin({
        identifier: demoCredentials.email,
        password: demoCredentials.password,
        installation: developmentDemoInstallation,
      }),
    ).resolves.toEqual(expect.objectContaining({ activeRole: "resident", renewableCredential: expect.any(String) }));
    await expect(
      api.passwordLogin({
        identifier: demoCredentials.email,
        password: "wrong-password",
        installation: developmentDemoInstallation,
      }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("returns a dual-role bootstrap and switches to Guard without network access", async () => {
    const api = createDevelopmentDemoMobileApi();
    const issue = await api.passwordLogin({
      identifier: demoCredentials.email,
      password: demoCredentials.password,
      installation: developmentDemoInstallation,
    });

    await expect(api.bootstrap(issue.accessToken)).resolves.toEqual(
      expect.objectContaining({
        activeRole: "resident",
        approvedRoles: ["resident", "guard"],
        permissions: expect.arrayContaining(["society:finance.read"]),
      }),
    );

    const switched = await api.switchRole(issue.accessToken, "guard");
    expect(switched.bootstrap).toEqual(
      expect.objectContaining({
        activeRole: "guard",
        permissions: expect.arrayContaining(["operations:gate.manage"]),
      }),
    );
    expect(switched.bootstrap.permissions).not.toContain("society:finance.read");
  });

  it("rejects demo OTP rather than sending an email request", async () => {
    const api = createDevelopmentDemoMobileApi();

    await expect(
      api.requestOtp({ identifier: demoCredentials.email, installation: developmentDemoInstallation }),
    ).rejects.toThrow(demoOtpUnavailableMessage);
  });
});
