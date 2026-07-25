# Resident Auth Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the approved ReManage resident sign-in and OTP visual polish without changing authentication behavior.

**Architecture:** Keep both screens feature-local and preserve the existing `SessionContext` API. The password screen owns its focused floating-label fields and visibility control; the OTP screen owns the six-digit display, resend countdown, and generic-error modal supplied by the shared resident overlay primitive.

**Tech Stack:** Expo Router, React Native, TypeScript, Jest, React Native Testing Library, `@expo/vector-icons`.

## Global Constraints

- Use the locked `residentTheme` values: surface `#FFFFFF`, accent `#FF5400`, border `#DEDAD3`, ink `#1F2324`, muted `#697071`, and icon `#123D41`.
- Do not add dependencies, assets, signup, social sign-in, society selection, role selection, or API calls.
- Preserve the controlled-beta sign-in and OTP flows, including generic error copy and demo-mode OTP disablement.
- Preserve unrelated uncommitted UI work and do not stage or commit files.

---

### Task 1: Make the password sign-in primary action use the approved accent token

**Files:**
- Modify: `src/features/auth/password-sign-in-screen.test.tsx`
- Modify: `src/features/auth/password-sign-in-screen.tsx`

**Interfaces:**
- Consumes: `PasswordSignInScreen` from `src/features/auth/password-sign-in-screen.tsx`.
- Produces: a Continue button with `residentTheme.accent` visual treatment while retaining the existing `signInWithPassword(email, password)` behavior.

- [x] **Step 1: Write the failing visual contract test**

```tsx
import { StyleSheet } from "react-native";

it("uses the ReManage accent for the Continue action", async () => {
  const { getByRole } = await renderScreen();

  const continueButton = getByRole("button", { name: "Continue" });

  expect(StyleSheet.flatten(continueButton.props.style).backgroundColor).toBe("#FF5400");
});
```

- [x] **Step 2: Run the focused test and verify it fails because the button uses the teal icon token**

Run: `npm test -- password-sign-in-screen.test.tsx`

Expected: FAIL with `Expected: "#FF5400"` and `Received: "#123D41"`.

- [x] **Step 3: Apply the minimal production change**

```tsx
primaryAction: {
  backgroundColor: residentTheme.accent,
  // retain the existing layout properties
},
```

- [x] **Step 4: Re-run the focused password test**

Run: `npm test -- password-sign-in-screen.test.tsx`

Expected: PASS with the existing authentication behavior unchanged.

### Task 2: Validate the existing six-digit OTP interaction and its shared modal integration

**Files:**
- Verify: `src/features/auth/otp-verify-screen.test.tsx`
- Verify: `src/features/auth/otp-verify-screen.tsx`

**Interfaces:**
- Consumes: `verifyOtp(challengeId, code)` from `SessionContext` and `ResidentCenteredModal` from `resident-overlays`.
- Produces: six numeric display boxes, a 45-second resend countdown, and a generic invalid-code modal without exposing server error details.

- [x] **Step 1: Run the focused OTP test suite**

Run: `npm test -- otp-verify-screen.test.tsx`

Expected: PASS; the suite confirms numeric sanitization, pending-request prevention, generic errors, no OTP logging, and safe back navigation.

- [x] **Step 2: Run the combined Auth test suite**

Run: `npm test -- password-sign-in-screen.test.tsx otp-verify-screen.test.tsx`

Expected: PASS with no unrelated suite selected.

### Task 3: Record the completion boundary

**Files:**
- Verify: `src/features/auth/password-sign-in-screen.tsx`
- Verify: `src/features/auth/otp-verify-screen.tsx`
- Verify: `src/features/auth/password-sign-in-screen.test.tsx`
- Verify: `src/features/auth/otp-verify-screen.test.tsx`

**Interfaces:**
- Consumes: the approved Resident UI plan at `C:\\Users\\pawan\\.cursor\\plans\\resident_ui_design_bd0ab9cf.plan.md`.
- Produces: a validated Auth slice; Community routing remains the next unstarted implementation slice.

- [x] **Step 1: Compare the final code against the approved Auth scope**

Confirm white canvas, floating labels, password visibility, orange primary CTA, outlined OTP CTA, six-digit entry, resend countdown, and generic invalid-code modal are all present.

- [x] **Step 2: Leave all work unstaged**

Run: `git status --short`

Expected: Auth changes and unrelated existing UI changes remain unstaged; no commit is created.
