import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";
import { fakeBootstrap } from "@/testing/fakes";

import { OtpVerifyScreen } from "./otp-verify-screen";

function createSession(overrides: Partial<SessionContextValue> = {}): SessionContextValue {
  return {
    state: { status: "signed_out" },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "opaque-challenge-id" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => fakeBootstrap("resident")),
    logout: jest.fn(async () => undefined),
    ...overrides,
  };
}

async function renderScreen(session = createSession(), onBack = jest.fn()) {
  return Object.assign(
    await render(
      <SessionContext.Provider value={session}>
        <OtpVerifyScreen challengeId="opaque-challenge-id" onBack={onBack} />
      </SessionContext.Provider>,
    ),
    { onBack, session },
  );
}

describe("OtpVerifyScreen", () => {
  it("accepts exactly six numeric characters", async () => {
    const { getByLabelText, getByRole } = await renderScreen();
    const code = getByLabelText("One-time code");

    await fireEvent.changeText(code, "12ab345678");

    expect(getByLabelText("One-time code").props.value).toBe("123456");
    await fireEvent.press(getByRole("button", { name: "Verify code" }));
  });

  it("verifies a valid code once while the request is pending", async () => {
    let resolve!: () => void;
    const session = createSession({
      verifyOtp: jest.fn(
        () =>
          new Promise<void>((complete) => {
            resolve = complete;
          }),
      ),
    });
    const { getByLabelText, getByRole } = await renderScreen(session);

    await fireEvent.changeText(getByLabelText("One-time code"), "123456");
    const verifyButton = getByRole("button", { name: "Verify code" });
    await fireEvent.press(verifyButton);
    await fireEvent.press(verifyButton);

    expect(session.verifyOtp).toHaveBeenCalledWith("opaque-challenge-id", "123456");
    expect(session.verifyOtp).toHaveBeenCalledTimes(1);

    await act(async () => resolve());
  });

  it("keeps invalid-code and expired-challenge errors generic, and clears the rejected code", async () => {
    const session = createSession({ verifyOtp: jest.fn(async () => Promise.reject(new Error("challenge expired"))) });
    const { findByText, getByLabelText, getByRole, queryByText } = await renderScreen(session);

    await fireEvent.changeText(getByLabelText("One-time code"), "123456");
    await fireEvent.press(getByRole("button", { name: "Verify code" }));

    expect(await findByText("We could not verify that code. Please try again.")).toBeTruthy();
    expect(queryByText("challenge expired")).toBeNull();
    expect(getByLabelText("One-time code").props.value).toBe("");
  });

  it("does not log or persist the OTP value", async () => {
    const log = jest.spyOn(console, "log").mockImplementation(() => undefined);
    const session = createSession();
    const { getByLabelText, getByRole } = await renderScreen(session);

    await fireEvent.changeText(getByLabelText("One-time code"), "123456");
    await fireEvent.press(getByRole("button", { name: "Verify code" }));

    await waitFor(() => expect(session.verifyOtp).toHaveBeenCalled());
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("returns to sign-in without signing out another session", async () => {
    const session = createSession();
    const { getByRole, onBack } = await renderScreen(session);

    await fireEvent.press(getByRole("button", { name: "Back to sign in" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(session.logout).not.toHaveBeenCalled();
  });
});
