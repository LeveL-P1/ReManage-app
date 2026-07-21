# Development Web Demo Authentication Design

**Date:** 2026-07-21

**Status:** User-approved design; implementation has not started

## Purpose

Allow the current Expo web preview to reach the existing Resident and Guard shell screens while the real mobile API is not running locally. This is a development convenience only. It does not add public account registration, create a backend account, send email, or weaken native or production authentication.

## Fixed demo credentials

The existing password form accepts exactly one demo account in a development web preview:

- Email: `demo@remanage.local`
- Password: `ReManageDemo2026!`

The account starts as Resident and has both approved roles. The existing More-tab role switcher can move between Resident and Guard to preview both current role trees.

## Activation boundary

The demo path is active only when both conditions are true:

1. Expo is running in development mode (`__DEV__` is true).
2. The platform is web (`Platform.OS === "web"`).

Every other runtime keeps the existing real `MobileApi`, native installation flow, server bootstrap, and protected credential behavior. The demo is not configured by an `EXPO_PUBLIC_*` value, is not a deploy-time feature flag, and must not become reachable in a production build.

## Architecture

A small development-only `MobileApi` implementation will sit behind the existing `SessionController` interface. It will provide synthetic session issues and bootstrap payloads for the fixed account without any network request.

- `passwordLogin` accepts only the fixed credentials and returns a synthetic session.
- `bootstrap` returns a fixed dual-role demo bootstrap payload.
- `switchRole` returns the requested approved role and a fresh synthetic access value.
- `refresh` accepts only the synthetic renewable credential for the current in-memory session.
- `logout` succeeds locally.
- `requestOtp` and `verifyOtp` remain unavailable in the demo and must never make a network request.

The provider selects this adapter only inside the activation boundary. It supplies a synthetic installation only for the demo adapter so the existing web platform restriction continues to protect real mobile API calls.

## User experience

No Signup screen or account-creation action is added.

The user enters the fixed email and password into the existing Sign in form. In an active web demo, the page displays a concise non-production helper that identifies the demo credentials. The Email me a code action is disabled with an explicit explanation that OTP requires the real native mobile API; it must not fail with a generic error.

After sign-in, the app opens Resident Home. More exposes the existing role switcher; switching to Guard opens Gate. Reloading the web page signs out because web credentials remain intentionally memory-only.

## Safety and privacy rules

- The demo adapter never sends a request, token, password, or installation to `EXPO_PUBLIC_API_BASE_URL`.
- Synthetic credentials and bootstrap data contain no real user, society, or backend data.
- Incorrect credentials receive the existing generic invalid-credentials behavior.
- Native Android and iOS password and OTP flows are unchanged.
- Production builds cannot use the demo path, even if the fixed text is visible in source history.

## Testing and acceptance criteria

Automated tests must prove that:

1. The demo adapter accepts only the fixed email/password pair and returns the expected dual-role bootstrap.
2. Wrong demo credentials reject generically and do not expose implementation details.
3. Demo role switching reaches both Resident and Guard bootstraps.
4. Demo OTP never sends a network request and the web form clearly marks it unavailable.
5. The session provider selects the demo path only for development web; native and non-development paths preserve the real API flow.
6. Existing authentication, session, role-routing, typecheck, and lint checks remain green.

Manual acceptance is entering the fixed credentials in `npm run start`, pressing `w`, observing Resident Home, then using More to open Guard Gate. No API server or email service is required for that preview.

## Non-goals

- Real account provisioning or signup
- Backend/database/migration changes
- SMTP or OTP delivery changes
- Persistent web sessions
- Production, TestFlight, EAS, Android, or iOS demo login

This document changes only the local preview experience. The approved mobile architecture and its requirement for real server-authorized native authentication remain intact.
