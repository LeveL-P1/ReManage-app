import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";

import { SessionContext, type SessionContextValue } from "@/platform/auth/session-provider";

import { PasswordSignInScreen } from "./password-sign-in-screen";

function createSession(overrides: Partial<SessionContextValue> = {}): SessionContextValue {
  return {
    state: { status: "signed_out" },
    retryRestore: jest.fn(async () => undefined),
    signInWithPassword: jest.fn(async () => undefined),
    requestOtp: jest.fn(async () => ({ challengeId: "opaque-challenge-id" })),
    verifyOtp: jest.fn(async () => undefined),
    switchRole: jest.fn(async () => undefined),
    logout: jest.fn(async () => undefined),
    ...overrides,
  };
}

async function renderScreen(session = createSession(), onOtpChallenge = jest.fn()) {
  return Object.assign(
    await render(
      <SessionContext.Provider value={session}>
        <PasswordSignInScreen onOtpChallenge={onOtpChallenge} />
      </SessionContext.Provider>,
    ),
    { onOtpChallenge, session },
  );
}

describe("PasswordSignInScreen", () => {
  it("requires an email and password before password sign-in", async () => {
    const { getByRole, getByText } = await renderScreen();

    await fireEvent.press(getByRole("button", { name: "Sign in" }));

    expect(getByText("Enter your email address and password.")).toBeTruthy();
  });

  it("normalizes the email before password sign-in", async () => {
    const session = createSession();
    const { getByLabelText, getByRole } = await renderScreen(session);

    await fireEvent.changeText(getByLabelText("Email address"), "  Resident@Example.COM  ");
    await fireEvent.changeText(getByLabelText("Password"), "password");
    await fireEvent.press(getByRole("button", { name: "Sign in" }));

    await waitFor(() => expect(session.signInWithPassword).toHaveBeenCalledWith("resident@example.com", "password"));
  });

  it("uses a secure password field", async () => {
    const { getByLabelText } = await renderScreen();

    expect(getByLabelText("Password").props.secureTextEntry).toBe(true);
  });

  it("submits a password sign-in once while a request is pending", async () => {
    let resolve!: () => void;
    const session = createSession({
      signInWithPassword: jest.fn(
        () =>
          new Promise<void>((complete) => {
            resolve = complete;
          }),
      ),
    });
    const { getByLabelText, getByRole } = await renderScreen(session);

    await fireEvent.changeText(getByLabelText("Email address"), "resident@example.com");
    await fireEvent.changeText(getByLabelText("Password"), "password");
    const signInButton = getByRole("button", { name: "Sign in" });
    await fireEvent.press(signInButton);
    await fireEvent.press(signInButton);

    expect(session.signInWithPassword).toHaveBeenCalledTimes(1);
    expect(getByRole("button", { name: "Signing in" }).props.accessibilityState.disabled).toBe(true);

    await act(async () => resolve());
  });

  it("requests an email code without a password and passes only its challenge id to navigation", async () => {
    const session = createSession({ requestOtp: jest.fn(async () => ({ challengeId: "opaque-challenge-id" })) });
    const { getByLabelText, getByRole, onOtpChallenge } = await renderScreen(session);

    await fireEvent.changeText(getByLabelText("Email address"), " Resident@Example.com ");
    await fireEvent.press(getByRole("button", { name: "Email me a code" }));

    await waitFor(() => expect(session.requestOtp).toHaveBeenCalledWith("resident@example.com"));
    expect(onOtpChallenge).toHaveBeenCalledWith("opaque-challenge-id");
  });

  it("shows a generic message for rejected credentials", async () => {
    const session = createSession({ signInWithPassword: jest.fn(async () => Promise.reject(new Error("invalid credentials"))) });
    const { getByLabelText, getByRole, findByText, queryByText } = await renderScreen(session);

    await fireEvent.changeText(getByLabelText("Email address"), "resident@example.com");
    await fireEvent.changeText(getByLabelText("Password"), "wrong-password");
    await fireEvent.press(getByRole("button", { name: "Sign in" }));

    expect(await findByText("We could not sign you in. Please try again.")).toBeTruthy();
    expect(queryByText("invalid credentials")).toBeNull();
  });

  it("does not offer signup, registration, society selection, or manual role selection", async () => {
    const { queryByText } = await renderScreen();

    expect(queryByText(/sign up|create account|register|select a society|choose a society|resident access|guard access/i)).toBeNull();
  });
});
