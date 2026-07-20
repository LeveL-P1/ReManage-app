import React from "react";
import { render, waitFor } from "@testing-library/react-native";

import { MobileApiError, type Bootstrap } from "@/platform/api/mobile-api-client";
import {
  deferred,
  FakeCredentialStore,
  FakeMobileApi,
  fakeBootstrap,
  fakeInstallation,
  fakeRoleSwitch,
  fakeSessionIssue,
} from "@/testing/fakes";

import { createSessionController } from "./session-controller";
import { SessionProvider, useSession, type SessionContextValue } from "./session-provider";
import type { SessionController } from "./session-controller";
import type { SessionState } from "./session-reducer";

function unauthorized(): MobileApiError {
  return new MobileApiError(401, "unauthorized", "The access token is no longer valid.", undefined, undefined);
}

function SessionContextProbe({ onValue }: { onValue(value: SessionContextValue): void }): null {
  const value = useSession();
  React.useEffect(() => {
    onValue(value);
  }, [onValue, value]);
  return null;
}

function sessionProviderElement(controller: SessionController, children: React.ReactNode = null): React.ReactElement {
  return React.createElement(
    SessionProvider,
    { controller } as React.ComponentProps<typeof SessionProvider>,
    children,
  );
}

function createProviderController(): { controller: SessionController; restore: jest.Mock<Promise<void>, []> } {
  const state: SessionState = { status: "signed_out" };
  const restore = jest.fn(async () => undefined);
  return {
    restore,
    controller: {
      getState: () => state,
      subscribe: () => () => undefined,
      restore,
      signInWithPassword: async () => undefined,
      requestOtp: async () => ({ challengeId: "challenge-1" }),
      verifyOtp: async () => undefined,
      switchRole: async () => fakeBootstrap("resident"),
      logout: async () => undefined,
    },
  };
}

describe("SessionController", () => {
  let api: FakeMobileApi;
  let credentials: FakeCredentialStore;

  function createController(getInstallation = async () => fakeInstallation) {
    return createSessionController({
      api,
      credentials,
      getInstallation,
    });
  }

  beforeEach(() => {
    api = new FakeMobileApi();
    credentials = new FakeCredentialStore();
  });

  it("moves directly from restoring to signed out when no credential is stored", async () => {
    const controller = createController();

    await controller.restore();

    expect(controller.getState()).toEqual({ status: "signed_out" });
    expect(api.refresh).not.toHaveBeenCalled();
  });

  it("persists a rotated credential before bootstrapping a restored session", async () => {
    credentials = new FakeCredentialStore("stored-renewable");
    api.refreshIssue = fakeSessionIssue({ renewableCredential: "rotated-renewable", accessToken: "restored-access" });
    api.bootstrapResult = fakeBootstrap("guard");
    const controller = createController();

    await controller.restore();

    expect(api.refresh).toHaveBeenCalledWith("stored-renewable");
    expect(credentials.setRenewableCredential).toHaveBeenCalledWith("rotated-renewable");
    expect(api.bootstrap).toHaveBeenCalledWith("restored-access");
    expect(credentials.setRenewableCredential.mock.invocationCallOrder[0]).toBeLessThan(
      api.bootstrap.mock.invocationCallOrder[0],
    );
    expect(controller.getState()).toEqual({ status: "authenticated", bootstrap: api.bootstrapResult });
  });

  it("shares one refresh and rotated credential persistence path between simultaneous restores", async () => {
    credentials = new FakeCredentialStore("stored-renewable");
    const refresh = deferred<ReturnType<typeof fakeSessionIssue>>();
    api.refresh.mockImplementation(() => refresh.promise);
    api.bootstrapResult = fakeBootstrap("guard");
    const controller = createController();

    const firstRestore = controller.restore();
    await waitFor(() => expect(api.refresh).toHaveBeenCalledTimes(1));
    const secondRestore = controller.restore();
    await Promise.resolve();
    expect(api.refresh).toHaveBeenCalledTimes(1);

    refresh.resolve(fakeSessionIssue({ accessToken: "restored-access", renewableCredential: "rotated-renewable" }));
    await Promise.all([firstRestore, secondRestore]);

    expect(credentials.setRenewableCredential).toHaveBeenCalledTimes(1);
    expect(credentials.renewableCredential).toBe("rotated-renewable");
    expect(controller.getState()).toEqual({ status: "authenticated", bootstrap: api.bootstrapResult });
  });

  it("deletes a rejected restored credential and signs out", async () => {
    credentials = new FakeCredentialStore("expired-renewable");
    api.refresh.mockRejectedValueOnce(new Error("expired"));
    const controller = createController();

    await controller.restore();

    expect(credentials.clearCredentials).toHaveBeenCalledTimes(1);
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("signs out without bootstrapping when SecureStore cannot persist a rotated credential", async () => {
    credentials = new FakeCredentialStore("stored-renewable");
    credentials.setRenewableCredential.mockRejectedValueOnce(new Error("secure storage unavailable"));
    const controller = createController();

    await controller.restore();

    expect(api.bootstrap).not.toHaveBeenCalled();
    expect(credentials.clearCredentials).toHaveBeenCalledTimes(1);
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("rejects a second role switch while the first server response is deferred", async () => {
    const firstResponse = deferred<ReturnType<typeof fakeRoleSwitch>>();
    api.switchRole.mockImplementationOnce(() => firstResponse.promise);
    const controller = createController();
    await controller.signInWithPassword("resident@example.com", "password");

    const first = controller.switchRole("guard");
    await Promise.resolve();
    await expect(controller.switchRole("resident")).rejects.toThrow("role switch");

    firstResponse.resolve(fakeRoleSwitch({ accessToken: "guard-access", bootstrap: fakeBootstrap("guard") }));
    await first;

    expect(api.switchRole).toHaveBeenCalledTimes(1);
    expect(controller.getState()).toEqual({ status: "authenticated", bootstrap: fakeBootstrap("guard") });
  });

  it("retries an authorized role change once after a 401 and successful refresh", async () => {
    api.switchRole.mockRejectedValueOnce(unauthorized());
    api.roleSwitchResult = fakeRoleSwitch({ accessToken: "new-access" });
    const controller = createController();
    await controller.signInWithPassword("resident@example.com", "password");

    await controller.switchRole("guard");

    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(api.switchRole).toHaveBeenCalledTimes(2);
    expect(api.switchRole.mock.calls[1]).toEqual(["refreshed-access", "guard"]);
  });

  it("surfaces a second 401 without entering a refresh retry loop", async () => {
    api.switchRole.mockRejectedValue(unauthorized());
    const controller = createController();
    await controller.signInWithPassword("resident@example.com", "password");

    await expect(controller.switchRole("guard")).rejects.toMatchObject({ status: 401 });

    expect(api.refresh).toHaveBeenCalledTimes(1);
    expect(api.switchRole).toHaveBeenCalledTimes(2);
  });

  it("restores the prior authenticated role shell when a role switch fails", async () => {
    const originalBootstrap = fakeBootstrap("resident");
    api.bootstrapResult = originalBootstrap;
    api.switchRole.mockRejectedValueOnce(new Error("role service unavailable"));
    const controller = createController();
    await controller.signInWithPassword("resident@example.com", "password");

    await expect(controller.switchRole("guard")).rejects.toThrow("role service unavailable");

    expect(controller.getState()).toEqual({
      status: "authenticated",
      bootstrap: originalBootstrap,
      roleSwitchError: "We could not switch roles. Please try again.",
    });
    expect(JSON.stringify(controller.getState())).not.toContain("role service unavailable");
  });

  it("persists password-login credentials before bootstrap and keeps tokens out of state", async () => {
    const controller = createController();

    await controller.signInWithPassword("resident@example.com", "password");

    expect(credentials.setRenewableCredential).toHaveBeenCalledWith("password-renewable");
    expect(credentials.setRenewableCredential.mock.invocationCallOrder[0]).toBeLessThan(
      api.bootstrap.mock.invocationCallOrder[0],
    );
    expect(JSON.stringify(controller.getState())).not.toContain("password-access");
    expect(JSON.stringify(controller.getState())).not.toContain("password-renewable");
  });

  it("clears a password-login credential when bootstrap fails from signed out", async () => {
    const controller = createController();
    await controller.restore();
    credentials.clearCredentials.mockClear();
    api.bootstrap.mockRejectedValueOnce(new Error("bootstrap unavailable"));

    await expect(controller.signInWithPassword("resident@example.com", "password")).rejects.toThrow("bootstrap unavailable");

    expect(credentials.renewableCredential).toBeNull();
    expect(credentials.clearCredentials).toHaveBeenCalledTimes(1);
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("does not persist a credential when requesting an OTP", async () => {
    const controller = createController();

    await expect(controller.requestOtp("resident@example.com")).resolves.toEqual({ challengeId: "challenge-1" });

    expect(api.requestOtp).toHaveBeenCalledWith({ identifier: "resident@example.com", installation: fakeInstallation });
    expect(credentials.setRenewableCredential).not.toHaveBeenCalled();
  });

  it("persists OTP-verification credentials before bootstrap", async () => {
    const controller = createController();

    await controller.verifyOtp("challenge-1", "123456");

    expect(credentials.setRenewableCredential).toHaveBeenCalledWith("otp-renewable");
    expect(credentials.setRenewableCredential.mock.invocationCallOrder[0]).toBeLessThan(
      api.bootstrap.mock.invocationCallOrder[0],
    );
  });

  it("clears an OTP-verification credential when bootstrap fails from signed out", async () => {
    const controller = createController();
    await controller.restore();
    credentials.clearCredentials.mockClear();
    api.bootstrap.mockRejectedValueOnce(new Error("bootstrap unavailable"));

    await expect(controller.verifyOtp("challenge-1", "123456")).rejects.toThrow("bootstrap unavailable");

    expect(credentials.renewableCredential).toBeNull();
    expect(credentials.clearCredentials).toHaveBeenCalledTimes(1);
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("uses only server-authoritative role bootstrap and replaces the access token after switching", async () => {
    const initialBootstrap = fakeBootstrap("resident");
    const serverBootstrap: Bootstrap = { ...fakeBootstrap("guard"), permissions: ["guard.patrol.read"] };
    api.bootstrapResult = initialBootstrap;
    api.roleSwitchResult = fakeRoleSwitch({ accessToken: "guard-access", bootstrap: serverBootstrap });
    const controller = createController();
    await controller.signInWithPassword("resident@example.com", "password");

    const switching = controller.switchRole("resident");
    expect(controller.getState()).toEqual({ status: "switching_role", bootstrap: initialBootstrap });
    await expect(switching).resolves.toEqual(serverBootstrap);

    expect(controller.getState()).toEqual({ status: "authenticated", bootstrap: serverBootstrap });
    await controller.switchRole("guard");
    expect(api.switchRole.mock.calls[1]?.[0]).toBe("guard-access");
  });

  it("calls online logout before clearing credentials", async () => {
    credentials = new FakeCredentialStore("stored-renewable");
    const controller = createController();

    await controller.logout();

    expect(api.logout).toHaveBeenCalledWith("stored-renewable");
    expect(credentials.clearCredentials).toHaveBeenCalledTimes(1);
    expect(api.logout.mock.invocationCallOrder[0]).toBeLessThan(credentials.clearCredentials.mock.invocationCallOrder[0]);
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("clears credentials and signs out even when online logout fails", async () => {
    credentials = new FakeCredentialStore("stored-renewable");
    api.logout.mockRejectedValueOnce(new Error("offline"));
    const controller = createController();

    await controller.logout();

    expect(credentials.clearCredentials).toHaveBeenCalledTimes(1);
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("waits for a rotating credential write before revoking the current credential on logout", async () => {
    credentials = new FakeCredentialStore("renewable-r0");
    const rotatedWrite = deferred<void>();
    credentials.setRenewableCredential.mockImplementationOnce(async (value) => {
      await rotatedWrite.promise;
      credentials.renewableCredential = value;
    });
    api.refreshIssue = fakeSessionIssue({ renewableCredential: "renewable-r1" });
    const controller = createController();

    const restoring = controller.restore();
    await waitFor(() => expect(credentials.setRenewableCredential).toHaveBeenCalledWith("renewable-r1"));

    const loggingOut = controller.logout();
    await Promise.resolve();
    expect(api.logout).not.toHaveBeenCalled();

    rotatedWrite.resolve();
    await waitFor(() => expect(api.logout).toHaveBeenCalledWith("renewable-r1"));
    await Promise.all([restoring, loggingOut]);

    expect(api.logout).toHaveBeenCalledTimes(1);
    expect(credentials.renewableCredential).toBeNull();
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("shares one in-flight logout", async () => {
    credentials = new FakeCredentialStore("stored-renewable");
    const onlineLogout = deferred<{ loggedOut: true }>();
    api.logout.mockImplementation(() => onlineLogout.promise);
    const controller = createController();

    const firstLogout = controller.logout();
    const secondLogout = controller.logout();

    expect(secondLogout).toBe(firstLogout);
    await waitFor(() => expect(api.logout).toHaveBeenCalledTimes(1));

    onlineLogout.resolve({ loggedOut: true });
    await firstLogout;
    expect(credentials.renewableCredential).toBeNull();
  });

  it("discards a refresh that completes after logout", async () => {
    api.passwordIssue = fakeSessionIssue({ accessExpiresAt: "1970-01-01T00:00:00.000Z" });
    const refresh = deferred<ReturnType<typeof fakeSessionIssue>>();
    api.refresh.mockImplementation(() => refresh.promise);
    const controller = createController();
    await controller.signInWithPassword("resident@example.com", "password");

    const switching = controller.switchRole("guard");
    await Promise.resolve();
    await controller.logout();
    refresh.resolve(fakeSessionIssue({ accessToken: "late-access", renewableCredential: "late-renewable" }));

    await expect(switching).rejects.toThrow("superseded");
    expect(credentials.renewableCredential).toBeNull();
    expect(api.switchRole).not.toHaveBeenCalled();
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("does not start a role-switch renewal while online logout is still pending", async () => {
    const onlineLogout = deferred<{ loggedOut: true }>();
    api.logout.mockImplementation(() => onlineLogout.promise);
    const controller = createController();
    await controller.signInWithPassword("resident@example.com", "password");

    const loggingOut = controller.logout();
    await Promise.resolve();

    await expect(controller.switchRole("guard")).rejects.toThrow("authenticated session");
    expect(api.refresh).not.toHaveBeenCalled();

    onlineLogout.resolve({ loggedOut: true });
    await loggingOut;
  });

  it("rejects password login while online logout is pending", async () => {
    const onlineLogout = deferred<{ loggedOut: true }>();
    api.logout.mockImplementation(() => onlineLogout.promise);
    const controller = createController();
    await controller.signInWithPassword("resident@example.com", "password");

    const loggingOut = controller.logout();
    await Promise.resolve();

    await expect(controller.signInWithPassword("other@example.com", "other-password")).rejects.toThrow("logout");
    expect(api.passwordLogin).toHaveBeenCalledTimes(1);

    onlineLogout.resolve({ loggedOut: true });
    await loggingOut;
    expect(credentials.renewableCredential).toBeNull();
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("rejects OTP verification while online logout is pending", async () => {
    const onlineLogout = deferred<{ loggedOut: true }>();
    api.logout.mockImplementation(() => onlineLogout.promise);
    const controller = createController();
    await controller.signInWithPassword("resident@example.com", "password");

    const loggingOut = controller.logout();
    await Promise.resolve();

    await expect(controller.verifyOtp("challenge-2", "654321")).rejects.toThrow("logout");
    expect(api.verifyOtp).not.toHaveBeenCalled();

    onlineLogout.resolve({ loggedOut: true });
    await loggingOut;
    expect(credentials.renewableCredential).toBeNull();
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("does not restore while online logout is pending", async () => {
    const onlineLogout = deferred<{ loggedOut: true }>();
    api.logout.mockImplementation(() => onlineLogout.promise);
    const controller = createController();
    await controller.signInWithPassword("resident@example.com", "password");

    const loggingOut = controller.logout();
    await Promise.resolve();
    await controller.restore();

    expect(api.refresh).not.toHaveBeenCalled();
    onlineLogout.resolve({ loggedOut: true });
    await loggingOut;
    expect(credentials.renewableCredential).toBeNull();
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("supersedes an older password login with a newer password login", async () => {
    const firstLogin = deferred<ReturnType<typeof fakeSessionIssue>>();
    const secondLogin = deferred<ReturnType<typeof fakeSessionIssue>>();
    const firstBootstrap = { ...fakeBootstrap("resident"), user: { email: "first@example.com", id: "first", name: "First" } };
    const secondBootstrap = { ...fakeBootstrap("guard"), user: { email: "second@example.com", id: "second", name: "Second" } };
    api.passwordLogin.mockImplementationOnce(() => firstLogin.promise).mockImplementationOnce(() => secondLogin.promise);
    api.bootstrap.mockImplementation((accessToken) => Promise.resolve(accessToken === "second-access" ? secondBootstrap : firstBootstrap));
    const controller = createController();

    const first = controller.signInWithPassword("first@example.com", "first-password");
    await waitFor(() => expect(api.passwordLogin).toHaveBeenCalledTimes(1));
    const firstCompletion = expect(first).rejects.toThrow("superseded");
    const second = controller.signInWithPassword("second@example.com", "second-password");
    await waitFor(() => expect(api.passwordLogin).toHaveBeenCalledTimes(2));
    secondLogin.resolve(fakeSessionIssue({ accessToken: "second-access", renewableCredential: "second-renewable", activeRole: "guard" }));
    await second;
    firstLogin.resolve(fakeSessionIssue({ accessToken: "first-access", renewableCredential: "first-renewable" }));

    await firstCompletion;
    expect(credentials.renewableCredential).toBe("second-renewable");
    expect(controller.getState()).toEqual({ status: "authenticated", bootstrap: secondBootstrap });
  });

  it("supersedes an older password login with a newer OTP verification", async () => {
    const passwordLogin = deferred<ReturnType<typeof fakeSessionIssue>>();
    const otpVerification = deferred<ReturnType<typeof fakeSessionIssue>>();
    const passwordBootstrap = { ...fakeBootstrap("resident"), user: { email: "password@example.com", id: "password", name: "Password" } };
    const otpBootstrap = { ...fakeBootstrap("guard"), user: { email: "otp@example.com", id: "otp", name: "OTP" } };
    api.passwordLogin.mockImplementation(() => passwordLogin.promise);
    api.verifyOtp.mockImplementation(() => otpVerification.promise);
    api.bootstrap.mockImplementation((accessToken) => Promise.resolve(accessToken === "otp-access" ? otpBootstrap : passwordBootstrap));
    const controller = createController();

    const password = controller.signInWithPassword("password@example.com", "password");
    await waitFor(() => expect(api.passwordLogin).toHaveBeenCalledTimes(1));
    const passwordCompletion = expect(password).rejects.toThrow("superseded");
    const otp = controller.verifyOtp("challenge-1", "123456");
    await waitFor(() => expect(api.verifyOtp).toHaveBeenCalledTimes(1));
    otpVerification.resolve(fakeSessionIssue({ accessToken: "otp-access", renewableCredential: "otp-renewable", activeRole: "guard" }));
    await otp;
    passwordLogin.resolve(fakeSessionIssue({ accessToken: "password-access", renewableCredential: "password-renewable" }));

    await passwordCompletion;
    expect(credentials.renewableCredential).toBe("otp-renewable");
    expect(controller.getState()).toEqual({ status: "authenticated", bootstrap: otpBootstrap });
  });

  it("supersedes an older restore with a newer password login", async () => {
    credentials = new FakeCredentialStore("restore-renewable");
    const refresh = deferred<ReturnType<typeof fakeSessionIssue>>();
    const passwordBootstrap = { ...fakeBootstrap("guard"), user: { email: "password@example.com", id: "password", name: "Password" } };
    api.refresh.mockImplementation(() => refresh.promise);
    api.passwordIssue = fakeSessionIssue({ accessToken: "password-access", renewableCredential: "password-renewable", activeRole: "guard" });
    api.bootstrap.mockImplementation((accessToken) => Promise.resolve(accessToken === "password-access" ? passwordBootstrap : fakeBootstrap("resident")));
    const controller = createController();

    const restoring = controller.restore();
    await Promise.resolve();
    await controller.signInWithPassword("password@example.com", "password");
    refresh.resolve(fakeSessionIssue({ accessToken: "restore-access", renewableCredential: "restore-rotated" }));
    await restoring;

    expect(credentials.renewableCredential).toBe("password-renewable");
    expect(controller.getState()).toEqual({ status: "authenticated", bootstrap: passwordBootstrap });
  });

  it("does not issue a password request when logout supersedes installation lookup", async () => {
    const installation = deferred<typeof fakeInstallation>();
    const controller = createController(() => installation.promise);

    const signingIn = controller.signInWithPassword("resident@example.com", "password");
    await Promise.resolve();
    await controller.logout();
    installation.resolve(fakeInstallation);

    await expect(signingIn).rejects.toThrow("superseded");
    expect(api.passwordLogin).not.toHaveBeenCalled();
  });

  it("discards a password login that completes after logout", async () => {
    const login = deferred<ReturnType<typeof fakeSessionIssue>>();
    api.passwordLogin.mockImplementation(() => login.promise);
    const controller = createController();

    const signingIn = controller.signInWithPassword("resident@example.com", "password");
    await Promise.resolve();
    await controller.logout();
    login.resolve(fakeSessionIssue({ accessToken: "late-access", renewableCredential: "late-renewable" }));

    await expect(signingIn).rejects.toThrow("superseded");
    expect(credentials.renewableCredential).toBeNull();
    expect(api.bootstrap).not.toHaveBeenCalled();
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("discards an OTP verification that completes after logout", async () => {
    const verification = deferred<ReturnType<typeof fakeSessionIssue>>();
    api.verifyOtp.mockImplementation(() => verification.promise);
    const controller = createController();

    const verifying = controller.verifyOtp("challenge-1", "123456");
    await Promise.resolve();
    await controller.logout();
    verification.resolve(fakeSessionIssue({ accessToken: "late-access", renewableCredential: "late-renewable" }));

    await expect(verifying).rejects.toThrow("superseded");
    expect(credentials.renewableCredential).toBeNull();
    expect(api.bootstrap).not.toHaveBeenCalled();
    expect(controller.getState()).toEqual({ status: "signed_out" });
  });

  it("reports a recoverable error when local credential cleanup fails", async () => {
    credentials = new FakeCredentialStore("stored-renewable");
    credentials.clearCredentials.mockRejectedValueOnce(new Error("secure storage unavailable"));
    const controller = createController();

    await controller.logout();

    expect(controller.getState()).toEqual({ status: "recoverable_error", message: "Unable to clear local credentials." });
  });

  it("cancels a real deferred restore after provider replacement", async () => {
    const firstApi = new FakeMobileApi();
    const firstCredentials = new FakeCredentialStore("first-renewable");
    const refresh = deferred<ReturnType<typeof fakeSessionIssue>>();
    firstApi.refresh.mockImplementation(() => refresh.promise);
    const firstController = createSessionController({
      api: firstApi,
      credentials: firstCredentials,
      getInstallation: async () => fakeInstallation,
    });
    const second = createProviderController();

    const rendered = await render(
      sessionProviderElement(firstController),
    );
    await waitFor(() => expect(firstApi.refresh).toHaveBeenCalledTimes(1));

    await rendered.rerender(
      sessionProviderElement(second.controller),
    );
    refresh.resolve(fakeSessionIssue({ accessToken: "late-access", renewableCredential: "late-renewable" }));
    await Promise.resolve();
    await Promise.resolve();

    expect(firstCredentials.renewableCredential).toBe("first-renewable");
    expect(firstApi.bootstrap).not.toHaveBeenCalled();
    expect(firstController.getState()).toEqual({ status: "restoring" });
    await waitFor(() => expect(second.restore).toHaveBeenCalledTimes(1));
  });

  it("waits for an outgoing protected-store write before restoring a replacement controller", async () => {
    const sharedCredentials = new FakeCredentialStore("shared-renewable");
    const oldWrite = deferred<void>();
    sharedCredentials.setRenewableCredential.mockImplementationOnce(async (value) => {
      await oldWrite.promise;
      sharedCredentials.renewableCredential = value;
    });
    const firstApi = new FakeMobileApi();
    const secondApi = new FakeMobileApi();
    firstApi.refreshIssue = fakeSessionIssue({ accessToken: "first-access", renewableCredential: "first-rotated" });
    secondApi.refreshIssue = fakeSessionIssue({ accessToken: "second-access", renewableCredential: "second-rotated" });
    const firstController = createSessionController({
      api: firstApi,
      credentials: sharedCredentials,
      getInstallation: async () => fakeInstallation,
    });
    const secondController = createSessionController({
      api: secondApi,
      credentials: sharedCredentials,
      getInstallation: async () => fakeInstallation,
    });

    const rendered = await render(
      sessionProviderElement(firstController),
    );
    await waitFor(() => expect(sharedCredentials.setRenewableCredential).toHaveBeenCalledTimes(1));

    await rendered.rerender(
      sessionProviderElement(secondController),
    );
    await Promise.resolve();
    const refreshesBeforeOldWriteSettles = secondApi.refresh.mock.calls.length;

    oldWrite.resolve();
    await waitFor(() => expect(secondApi.refresh).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(sharedCredentials.renewableCredential).toBe("second-rotated"));

    expect(refreshesBeforeOldWriteSettles).toBe(0);
    expect(firstApi.bootstrap).not.toHaveBeenCalled();
    expect(secondController.getState()).toEqual({ status: "authenticated", bootstrap: secondApi.bootstrapResult });
  });

  it("waits for outgoing remote logout cleanup before restoring a replacement controller", async () => {
    const sharedCredentials = new FakeCredentialStore();
    const onlineLogout = deferred<{ loggedOut: true }>();
    const firstApi = new FakeMobileApi();
    firstApi.logout.mockImplementation(() => onlineLogout.promise);
    const firstController = createSessionController({
      api: firstApi,
      credentials: sharedCredentials,
      getInstallation: async () => fakeInstallation,
    });
    await firstController.signInWithPassword("resident@example.com", "password");

    const replacement = createProviderController();
    replacement.restore.mockImplementation(async () => {
      await sharedCredentials.setRenewableCredential("replacement-renewable");
    });
    const rendered = await render(
      sessionProviderElement(firstController),
    );
    await waitFor(() => expect(firstApi.bootstrap).toHaveBeenCalledTimes(2));

    const loggingOut = firstController.logout();
    await waitFor(() => expect(firstApi.logout).toHaveBeenCalledTimes(1));
    await rendered.rerender(
      sessionProviderElement(replacement.controller),
    );
    await Promise.resolve();
    await Promise.resolve();

    expect(replacement.restore).not.toHaveBeenCalled();
    onlineLogout.resolve({ loggedOut: true });
    await loggingOut;
    await waitFor(() => expect(replacement.restore).toHaveBeenCalledTimes(1));

    expect(sharedCredentials.clearCredentials).toHaveBeenCalledTimes(1);
    expect(sharedCredentials.clearCredentials.mock.invocationCallOrder[0]).toBeLessThan(
      replacement.restore.mock.invocationCallOrder[0],
    );
    expect(sharedCredentials.renewableCredential).toBe("replacement-renewable");
  });

  it("restores a supplied controller again after a rapid A-to-B-to-A handoff", async () => {
    const first = createProviderController();
    const firstCancellation = deferred<void>();
    const cancelFirst = jest.fn(() => firstCancellation.promise);
    const firstController = { ...first.controller, cancelPendingOperations: cancelFirst };
    const second = createProviderController();

    const rendered = await render(
      sessionProviderElement(firstController),
    );
    await waitFor(() => expect(first.restore).toHaveBeenCalledTimes(1));

    await rendered.rerender(
      sessionProviderElement(second.controller),
    );
    await waitFor(() => expect(cancelFirst).toHaveBeenCalledTimes(1));

    await rendered.rerender(
      sessionProviderElement(firstController),
    );
    firstCancellation.resolve();

    await waitFor(() => expect(first.restore).toHaveBeenCalledTimes(2));
    expect(second.restore).not.toHaveBeenCalled();
  });

  it("cancels a real deferred restore after StrictMode provider unmount", async () => {
    const api = new FakeMobileApi();
    const credentials = new FakeCredentialStore("first-renewable");
    const refresh = deferred<ReturnType<typeof fakeSessionIssue>>();
    api.refresh.mockImplementation(() => refresh.promise);
    const controller = createSessionController({
      api,
      credentials,
      getInstallation: async () => fakeInstallation,
    });

    const rendered = await render(
      React.createElement(
        React.StrictMode,
        null,
        sessionProviderElement(controller),
      ),
    );
    await waitFor(() => expect(api.refresh).toHaveBeenCalledTimes(1));

    await rendered.unmount();
    await Promise.resolve();
    refresh.resolve(fakeSessionIssue({ accessToken: "late-access", renewableCredential: "late-renewable" }));
    await Promise.resolve();
    await Promise.resolve();

    expect(credentials.renewableCredential).toBe("first-renewable");
    expect(api.bootstrap).not.toHaveBeenCalled();
    expect(controller.getState()).toEqual({ status: "restoring" });
  });

  it("does not expose credentials through the provider context", async () => {
    const first = createProviderController();
    let value: SessionContextValue | undefined;

    const rendered = await render(
      React.createElement(
        React.StrictMode,
        null,
        sessionProviderElement(first.controller, React.createElement(SessionContextProbe, {
            onValue: (nextValue: SessionContextValue) => (value = nextValue),
          })),
      ),
    );

    await waitFor(() => expect(value).toBeDefined());

    expect(first.restore).toHaveBeenCalledTimes(1);
    expect(Object.keys(value ?? {})).toEqual([
      "state",
      "retryRestore",
      "signInWithPassword",
      "requestOtp",
      "verifyOtp",
      "switchRole",
      "logout",
    ]);
    expect(JSON.stringify(value)).not.toContain("access-token");
    expect(JSON.stringify(value)).not.toContain("renewable-credential");

    const second = createProviderController();
    await rendered.rerender(
      React.createElement(
        React.StrictMode,
        null,
        sessionProviderElement(second.controller, React.createElement(SessionContextProbe, {
            onValue: (nextValue: SessionContextValue) => (value = nextValue),
          })),
      ),
    );

    await waitFor(() => expect(second.restore).toHaveBeenCalledTimes(1));
  });
});
