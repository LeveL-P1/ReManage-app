# Development Web Demo Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the Expo development web preview authenticate one fixed demo account into the existing Resident and Guard shell screens without a backend, email, Signup screen, or production access.

**Architecture:** A small local `MobileApi` implementation supplies synthetic session and bootstrap data only when the runtime is both Expo development and web. `SessionProvider` selects that adapter and a synthetic installation at that exact boundary; all other runtimes keep the current real API and native installation behavior. The existing password form remains the entry point, while its web-demo presentation makes the credentials visible and disables OTP with an explicit explanation.

**Tech Stack:** Expo SDK 57, Expo Router, React Native, TypeScript, Jest Expo, React Native Testing Library.

## Global Constraints

- Keep public Signup, registration, real account provisioning, backend/database/migration, SMTP, and OTP-delivery work out of scope.
- Enable demo authentication only when `__DEV__ === true` and `Platform.OS === "web"`; never use an `EXPO_PUBLIC_*` flag.
- Use exactly `demo@remanage.local` and `ReManageDemo2026!` for the synthetic account.
- The demo adapter must make no HTTP request and contain no real user, society, token, or backend data.
- Existing Android/iOS password and OTP behavior must stay unchanged.
- Web credentials remain memory-only; reloading the browser signs the demo out.
- Preserve existing user changes, do not touch the separate backend worktree, and never stage or commit `.superpowers/`.
- Do not stage or commit any file; the user handles Git commits manually.

---

## File structure

| File | Responsibility |
| --- | --- |
| `src/platform/auth/development-demo-auth.ts` | Owns the fixed credentials, runtime guard, synthetic installation, and no-network `MobileApi` implementation. |
| `src/platform/auth/development-demo-auth.test.ts` | Proves credential matching, fake session behavior, role switching, OTP rejection, and runtime-guard rules. |
| `src/platform/auth/session-runtime.ts` | Builds the default session controller and selects the demo adapter only at the approved runtime boundary. |
| `src/platform/auth/session-runtime.test.ts` | Proves the demo path never constructs the real API and other runtimes preserve the real API path. |
| `src/platform/auth/session-provider.tsx` | Uses the runtime session-controller factory without changing its public context API. |
| `src/features/auth/password-sign-in-screen.tsx` | Displays the local demo credentials and makes OTP explicitly unavailable only in demo mode. |
| `src/features/auth/password-sign-in-screen.test.tsx` | Verifies demo helper copy, disabled OTP, and unchanged normal password/OTP behavior. |
| `src/app/(auth)/sign-in.tsx` | Passes the runtime demo state into the existing sign-in screen. |

---

### Task 1: Add the no-network development demo API

**Files:**
- Create: `src/platform/auth/development-demo-auth.ts`
- Create: `src/platform/auth/development-demo-auth.test.ts`

**Consumes:** `MobileApi`, `Bootstrap`, `MobileRole`, `SessionIssue`, and `RoleSwitchResult` from `src/platform/api/mobile-api-client.ts`; `MobileInstallation` from `src/platform/auth/installation.ts`.

**Produces:** `demoCredentials`, `demoOtpUnavailableMessage`, `developmentDemoInstallation`, `isDevelopmentWebPreview(runtime?)`, and `createDevelopmentDemoMobileApi()` for runtime selection and sign-in UI.

- [ ] **Step 1: Write failing adapter and runtime-guard tests**

Create `src/platform/auth/development-demo-auth.test.ts` with these tests before production code exists:

```ts
import { createDevelopmentDemoMobileApi, demoCredentials, demoOtpUnavailableMessage, developmentDemoInstallation, isDevelopmentWebPreview } from "./development-demo-auth";

describe("development demo authentication", () => {
  it("is available only for development web", () => {
    expect(isDevelopmentWebPreview({ isDevelopment: true, platform: "web" })).toBe(true);
    expect(isDevelopmentWebPreview({ isDevelopment: false, platform: "web" })).toBe(false);
    expect(isDevelopmentWebPreview({ isDevelopment: true, platform: "android" })).toBe(false);
  });

  it("issues a resident demo session only for the fixed credentials", async () => {
    const api = createDevelopmentDemoMobileApi();
    await expect(api.passwordLogin({ identifier: demoCredentials.email, password: demoCredentials.password, installation: developmentDemoInstallation }))
      .resolves.toEqual(expect.objectContaining({ activeRole: "resident", renewableCredential: expect.any(String) }));
    await expect(api.passwordLogin({ identifier: demoCredentials.email, password: "wrong-password", installation: developmentDemoInstallation }))
      .rejects.toThrow("Invalid credentials");
  });

  it("returns a dual-role bootstrap and switches to Guard without network access", async () => {
    const api = createDevelopmentDemoMobileApi();
    const issue = await api.passwordLogin({ identifier: demoCredentials.email, password: demoCredentials.password, installation: developmentDemoInstallation });
    await expect(api.bootstrap(issue.accessToken)).resolves.toEqual(expect.objectContaining({ activeRole: "resident", approvedRoles: ["resident", "guard"] }));
    await expect(api.switchRole(issue.accessToken, "guard")).resolves.toEqual(expect.objectContaining({ bootstrap: expect.objectContaining({ activeRole: "guard" }) }));
  });

  it("rejects demo OTP rather than sending an email request", async () => {
    const api = createDevelopmentDemoMobileApi();
    await expect(api.requestOtp({ identifier: demoCredentials.email, installation: developmentDemoInstallation }))
      .rejects.toThrow(demoOtpUnavailableMessage);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it is red**

Run:

```powershell
npm test -- src/platform/auth/development-demo-auth.test.ts
```

Expected: FAIL because `development-demo-auth.ts` does not exist.

- [ ] **Step 3: Implement the minimal demo adapter**

Create `src/platform/auth/development-demo-auth.ts` with this exact boundary and behavior:

```ts
import { Platform } from "react-native";

import type { Bootstrap, MobileApi, MobileRole, RoleSwitchResult, SessionIssue } from "@/platform/api/mobile-api-client";
import type { MobileInstallation } from "./installation";

export const demoCredentials = {
  email: "demo@remanage.local",
  password: "ReManageDemo2026!",
} as const;

export const demoOtpUnavailableMessage = "Email-code sign-in requires the real mobile API.";

export interface SessionRuntime {
  isDevelopment: boolean;
  platform: string;
}

export const developmentDemoInstallation: MobileInstallation = {
  id: "development-web-demo-installation",
  platform: "android",
  appVersion: "0.0.0-demo",
  deviceName: "Development web preview",
};

export function isDevelopmentWebPreview(runtime: SessionRuntime = { isDevelopment: __DEV__, platform: Platform.OS }): boolean {
  return runtime.isDevelopment && runtime.platform === "web";
}

function demoBootstrap(activeRole: MobileRole): Bootstrap {
  return {
    activeRole,
    approvedRoles: ["resident", "guard"],
    featureFlags: { guardOffline: false, guardShell: true, nativePush: false, residentShell: true },
    notificationPolicy: {
      community: { configurable: true, enabled: false },
      critical: { configurable: false, enabled: true },
      transactional: { configurable: true, enabled: true },
    },
    permissions: ["dashboard.read"],
    society: { id: "demo-society", name: "ReManage Demo Society" },
    user: { id: "demo-user", name: "Demo User", email: demoCredentials.email },
  };
}

function demoSessionIssue(activeRole: MobileRole): SessionIssue {
  return {
    accessToken: `demo-access-${activeRole}`,
    accessExpiresAt: "2099-01-01T00:00:00.000Z",
    renewableCredential: "demo-renewable-credential",
    renewableExpiresAt: "2099-02-01T00:00:00.000Z",
    deviceSessionId: "development-web-demo-session",
    activeRole,
  };
}

function invalidCredentials(): Error {
  return new Error("Invalid credentials");
}

export function createDevelopmentDemoMobileApi(): MobileApi {
  let activeRole: MobileRole = "resident";
  return {
    async passwordLogin(body) {
      if (body.identifier.trim().toLowerCase() !== demoCredentials.email || body.password !== demoCredentials.password) throw invalidCredentials();
      activeRole = "resident";
      return demoSessionIssue(activeRole);
    },
    async requestOtp() { throw new Error(demoOtpUnavailableMessage); },
    async verifyOtp() { throw new Error(demoOtpUnavailableMessage); },
    async refresh(renewableCredential) {
      if (renewableCredential !== "demo-renewable-credential") throw invalidCredentials();
      return demoSessionIssue(activeRole);
    },
    async bootstrap(accessToken) {
      if (accessToken !== `demo-access-${activeRole}`) throw invalidCredentials();
      return demoBootstrap(activeRole);
    },
    async switchRole(accessToken, role): Promise<RoleSwitchResult> {
      if (accessToken !== `demo-access-${activeRole}`) throw invalidCredentials();
      activeRole = role;
      const issue = demoSessionIssue(activeRole);
      return { accessToken: issue.accessToken, accessExpiresAt: issue.accessExpiresAt, bootstrap: demoBootstrap(activeRole) };
    },
    async logout() { return { loggedOut: true } as const; },
  };
}
```

Do not import `fetch`, `openapi-fetch`, `publicEnvironment`, or a backend URL into this file.

- [ ] **Step 4: Run the focused test and confirm it is green**

Run:

```powershell
npm test -- src/platform/auth/development-demo-auth.test.ts
```

Expected: PASS with four tests, including the fixed-credential and no-OTP assertions.

- [ ] **Step 5: Review only this task's diff**

Run:

```powershell
git diff --check -- src/platform/auth/development-demo-auth.ts src/platform/auth/development-demo-auth.test.ts
git diff -- src/platform/auth/development-demo-auth.ts src/platform/auth/development-demo-auth.test.ts
```

Expected: no whitespace errors; no staged files and no commit.

---

### Task 2: Select the demo adapter only in development web mode

**Files:**
- Create: `src/platform/auth/session-runtime.ts`
- Create: `src/platform/auth/session-runtime.test.ts`
- Modify: `src/platform/auth/session-provider.tsx:3-39`

**Consumes:** `createDevelopmentDemoMobileApi`, `developmentDemoInstallation`, `isDevelopmentWebPreview`, `SessionRuntime` from Task 1; `createMobileApi`, `createCredentialStore`, and `createSessionController`.

**Produces:** `createRuntimeSessionController(runtime?, credentials?, createRealApi?)`, used by `SessionProvider` and tested without a real network connection.

- [ ] **Step 1: Write failing runtime-selection tests**

Create `src/platform/auth/session-runtime.test.ts`:

```ts
import { FakeCredentialStore, FakeMobileApi } from "@/testing/fakes";
import { demoCredentials } from "./development-demo-auth";
import { createRuntimeSessionController } from "./session-runtime";

describe("createRuntimeSessionController", () => {
  it("uses the local demo path on development web without constructing the real API", async () => {
    const createRealApi = jest.fn(() => new FakeMobileApi());
    const controller = createRuntimeSessionController({ isDevelopment: true, platform: "web" }, new FakeCredentialStore(), createRealApi);

    await controller.signInWithPassword(demoCredentials.email, demoCredentials.password);

    expect(createRealApi).not.toHaveBeenCalled();
    expect(controller.getState()).toEqual(expect.objectContaining({ status: "authenticated", bootstrap: expect.objectContaining({ activeRole: "resident" }) }));
  });

  it("keeps the real API path outside development web", () => {
    const createRealApi = jest.fn(() => new FakeMobileApi());

    createRuntimeSessionController({ isDevelopment: false, platform: "web" }, new FakeCredentialStore(), createRealApi);
    createRuntimeSessionController({ isDevelopment: true, platform: "android" }, new FakeCredentialStore(), createRealApi);

    expect(createRealApi).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it is red**

Run:

```powershell
npm test -- src/platform/auth/session-runtime.test.ts
```

Expected: FAIL because `session-runtime.ts` does not exist.

- [ ] **Step 3: Implement the runtime factory and use it from the provider**

Create `src/platform/auth/session-runtime.ts`:

```ts
import { createMobileApi, type MobileApi } from "@/platform/api/mobile-api-client";

import { createCredentialStore, type CredentialStore } from "./credential-store";
import { createDevelopmentDemoMobileApi, developmentDemoInstallation, isDevelopmentWebPreview, type SessionRuntime } from "./development-demo-auth";
import { createSessionController, type SessionController } from "./session-controller";

export function createRuntimeSessionController(
  runtime?: SessionRuntime,
  credentials: CredentialStore = createCredentialStore(),
  createRealApi: () => MobileApi = createMobileApi,
): SessionController {
  if (isDevelopmentWebPreview(runtime)) {
    return createSessionController({
      api: createDevelopmentDemoMobileApi(),
      credentials,
      getInstallation: async () => developmentDemoInstallation,
    });
  }
  return createSessionController({ api: createRealApi(), credentials });
}
```

In `src/platform/auth/session-provider.tsx`, replace the default controller construction:

```ts
import { createRuntimeSessionController } from "./session-runtime";

const controller = useMemo(
  () => suppliedController ?? createRuntimeSessionController(),
  [suppliedController],
);
```

Remove the now-unused imports of `createMobileApi`, `createCredentialStore`, and `createSessionController`. Do not change `SessionContextValue`, lifecycle behavior, or supplied-controller support.

- [ ] **Step 4: Run the focused tests and confirm they are green**

Run:

```powershell
npm test -- src/platform/auth/session-runtime.test.ts src/platform/auth/session-controller.test.ts
```

Expected: PASS; the existing controller concurrency, session-restoration, logout, and role-switch tests remain unchanged.

- [ ] **Step 5: Review only this task's diff**

Run:

```powershell
git diff --check -- src/platform/auth/session-runtime.ts src/platform/auth/session-runtime.test.ts src/platform/auth/session-provider.tsx
git diff -- src/platform/auth/session-runtime.ts src/platform/auth/session-runtime.test.ts src/platform/auth/session-provider.tsx
```

Expected: no whitespace errors; no staged files and no commit.

---

### Task 3: Make the demo credentials discoverable and OTP explicitly unavailable

**Files:**
- Modify: `src/features/auth/password-sign-in-screen.tsx:1-153`
- Modify: `src/features/auth/password-sign-in-screen.test.tsx:1-111`
- Modify: `src/app/(auth)/sign-in.tsx:1-15`

**Consumes:** `demoCredentials` and `demoOtpUnavailableMessage` in the sign-in screen, plus `isDevelopmentWebPreview` in the auth route, from Task 1.

**Produces:** An unchanged normal password/OTP form plus a `demoMode` presentation that displays credentials and disables OTP without an attempted request.

- [ ] **Step 1: Write failing demo-presentation tests**

Extend `src/features/auth/password-sign-in-screen.test.tsx` so `renderScreen` accepts an optional `demoMode` argument and add:

```ts
it("shows development demo credentials and disables OTP without sending a request", async () => {
  const session = createSession();
  const { getByRole, getByText } = await renderScreen(session, jest.fn(), true);

  expect(getByText("Web demo credentials: demo@remanage.local / ReManageDemo2026!")).toBeTruthy();
  const otpButton = getByRole("button", { name: "Email code unavailable in web demo" });
  expect(otpButton.props.accessibilityState.disabled).toBe(true);

  await fireEvent.press(otpButton);
  expect(session.requestOtp).not.toHaveBeenCalled();
});
```

Keep the existing OTP success test with `demoMode` false or omitted so native behavior remains covered.

- [ ] **Step 2: Run the focused test and confirm it is red**

Run:

```powershell
npm test -- src/features/auth/password-sign-in-screen.test.tsx
```

Expected: FAIL because the current component has no demo helper copy or demo-mode OTP state.

- [ ] **Step 3: Implement the minimal screen and route changes**

Update the screen props and render logic:

```tsx
import { demoCredentials, demoOtpUnavailableMessage } from "@/platform/auth/development-demo-auth";

export interface PasswordSignInScreenProps {
  demoMode?: boolean;
  onOtpChallenge(challengeId: string): void;
}

export function PasswordSignInScreen({ demoMode = false, onOtpChallenge }: PasswordSignInScreenProps) {
  // Keep all existing state and handlers. Add this beside isPending:
  const otpDisabled = isPending || demoMode;

  // Render this after the existing account-provisioning copy:
  {demoMode ? <Text style={styles.demoHint}>Web demo credentials: {demoCredentials.email} / {demoCredentials.password}</Text> : null}

  // Replace only the OTP Pressable fields with:
  <Pressable
    accessibilityLabel={demoMode ? "Email code unavailable in web demo" : "Email me a code"}
    accessibilityRole="button"
    accessibilityState={{ disabled: otpDisabled }}
    disabled={otpDisabled}
    onPress={() => void handleOtpRequest()}
    style={({ pressed }) => [styles.secondaryAction, (pressed || otpDisabled) && styles.secondaryActionPressed, otpDisabled && styles.disabled]}
  >
    <Text style={styles.secondaryActionText}>{demoMode ? demoOtpUnavailableMessage : pendingAction === "otp" ? "Sending code…" : "Email me a code"}</Text>
  </Pressable>
```

Add a `demoHint` style using the existing resident text color, `fontSize: 14`, and `lineHeight: 20`.

In `src/app/(auth)/sign-in.tsx`, pass the runtime guard to the existing screen:

```tsx
import { isDevelopmentWebPreview } from "@/platform/auth/development-demo-auth";

<PasswordSignInScreen
  demoMode={isDevelopmentWebPreview()}
  onOtpChallenge={(challengeId) => router.push({ pathname: "/(auth)/otp", params: { challengeId } })}
/>
```

Do not add a signup link, a demo-only route, a role-selection control, or a real OTP fallback.

- [ ] **Step 4: Run focused UI and navigation tests**

Run:

```powershell
npm test -- src/features/auth/password-sign-in-screen.test.tsx src/features/session/role-switcher.test.tsx src/testing/navigation-contract.test.ts
```

Expected: PASS; demo OTP is disabled, normal OTP still requests a challenge, and Resident/Guard navigation remains role-isolated.

- [ ] **Step 5: Run full verification and manual preview acceptance**

Run:

```powershell
npm test
npm run typecheck
npm run lint
```

Expected: all test suites, TypeScript, and lint pass.

Then run:

```powershell
npm run start
```

Press `w`, enter `demo@remanage.local` and `ReManageDemo2026!`, and verify:

1. Resident Home opens.
2. More exposes Switch to Guard.
3. Guard Gate opens after switching.
4. Reloading returns to Sign in.
5. Email code is visibly unavailable and no request is attempted.

- [ ] **Step 6: Review final scope without staging or committing**

Run:

```powershell
git diff --check
git status --short
```

Expected: only this plan's app, test, and documentation files are newly modified; existing `.gitignore`, `expo-env.d.ts`, and `.superpowers/` changes remain untouched; no files are staged and no commit is created.
