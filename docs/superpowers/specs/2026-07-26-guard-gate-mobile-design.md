# Guard Gate Mobile Design

## Goal

Deliver the first production-connected Guard vertical slice for the Expo app: a mobile-first Gate workflow that covers visitor approval, check-in, and exit while preserving ReManageSociety's tenant, role, audit, and approval rules.

## Product boundary

`ReManageSociety` remains the source of truth for society data, permissions, audit events, and operational state. It exposes new guard-only endpoints under `/api/mobile/v1`. `ReManage-app` remains the Expo client: it renders the workflow, stores mobile session credentials, reads the generated OpenAPI contract, and never calls legacy web routes.

The mobile slice is online-only. `guardOffline` remains false; the client must show a retryable unavailable state instead of queueing visitor operations locally.

## Guard Gate workflow

```text
New or expected visitor
  -> flat lookup or pre-approved passcode verification
  -> resident approval is confirmed server-side
  -> guard explicitly confirms check-in
  -> visitor appears in active visitors
  -> guard explicitly confirms exit
```

### Gate tab

The Gate tab presents the assigned gate, guard identity, live counts for visitors inside, expected visitors, pending approval, and pending parcels. Its primary controls are large, labelled actions:

- `Verify passcode`
- `Log visitor`
- `Approved visitors`
- `Visitors inside`

Each control opens a full-screen stack route. The tab itself remains a scan-friendly operational overview; it does not contain a long form.

### Visitor routes

1. **Log visitor**: Search an active flat by unit, wing, or occupant. Enter visitor name, optional valid ten-digit phone, purpose, and optional vehicle number. Submitting creates a pending approval request and returns to a request-status route.
2. **Request status**: Shows `Awaiting approval`, `Approved`, `Rejected`, `Expired`, or `Unavailable`. It refetches while visible. Only `Approved` exposes the check-in action.
3. **Verify passcode**: Accepts the pre-approved passcode, shows the intended flat and visitor only after server verification, and requires an explicit check-in confirmation.
4. **Approved visitor detail**: Shows the visitor, unit, approval source, and check-in confirmation.
5. **Active visitor detail**: Shows entry time and a single exit confirmation. A visitor can exit only from `in` state.

Short, irreversible actions use a centered modal. Contextual status and retry information use inline cards. The existing shared resident overlay primitives may be generalized only when their visual API can safely serve both roles; Guard must retain its own dark operational token set.

## Rules retained from the web product

- Society, guard identity, and permissions come from the authenticated server session; the client never sends a society identifier or guard identifier as authority.
- A manual visitor request becomes `expected` and waits for resident approval.
- A pre-approved passcode can move an eligible `expected` visitor to `in` only after server validation.
- An approved `expected` visitor can move to `in` only through explicit guard confirmation.
- An `in` visitor can move to `out` only through explicit guard confirmation.
- Blacklist evaluation, approval validity, passcode validity, and duplicate state checks happen on the server.
- Every mutation records the authenticated guard and an audit event.

## Rules redesigned for mobile safety

- Do not surface the legacy direct-entry mode that lets a guard self-approve a visitor. It is not a normal mobile action.
- Do not display resident contact details unless the server grants a minimal, action-specific field.
- Do not show a success state until the mutation response returns the authoritative updated visitor.
- Do not locally queue check-in or exit actions while offline.

## Mobile API contract

The backend contract uses authenticated `/api/mobile/v1` endpoints with a guard-role requirement:

- `GET /guard/gate/overview` returns gate label, current shift summary, and count cards.
- `GET /guard/visitors?state=expected|approved|inside` returns minimised visitor rows suitable for the requested view.
- `POST /guard/visitors/requests` accepts `{ flatQuery, visitorName, phone?, purpose, vehicleNumber? }` and returns an `expected` visitor.
- `GET /guard/visitors/{visitorId}` returns the current action-safe status for the requesting guard's society.
- `POST /guard/visitors/passcode/verify` accepts `{ passcode }` and returns an eligible pre-approved visitor without changing entry state.
- `POST /guard/visitors/{visitorId}/check-in` transitions an eligible approved visitor to `in`.
- `POST /guard/visitors/{visitorId}/check-out` transitions an `in` visitor to `out`.

All mutation endpoints reject wrong role, wrong society, invalid state transition, invalid/expired passcode, inactive membership, and blacklisted visitor cases with stable problem codes. The Expo app maps these codes to concise, non-sensitive status copy.

## Workflow audit rule for all later Guard modules

Before implementing Parcels, Staff, Incidents, SOS, Shift, or Patrol, compare the web flow against this checklist:

1. Preserve server-authoritative entity states and permissions.
2. Preserve required audit, notifications, and recipient confirmation.
3. Redesign any action that depends on a desktop-sized form, hides a dangerous transition, exposes sensitive information, or relies on an unauthenticated legacy route.
4. Reject any workflow that cannot be made tenant-safe and testable through `/api/mobile/v1`.

Current decisions:

- Parcels: preserve log and collected lifecycle; redesign pickup verification and recipient confirmation.
- Staff: preserve attendance lifecycle; redesign entry-code handling around explicit visible current state.
- Incidents and SOS: redesign around escalation, dispatch, audit, and delivery guarantees.
- Shift and Patrol: redesign as separate operational slices after their server contracts are established.

## Acceptance criteria

- A guard sees only Guard navigation and guard-authorised Gate data.
- The Gate tab has accessible labels and four primary, reachable visitor actions.
- A manual request cannot check in before an authoritative approval response.
- A verified passcode cannot check in a visitor until the explicit confirmation action succeeds.
- Exit cannot be offered for any visitor outside `in` state.
- Rejected, expired, unavailable, blocked, and network-failed states are visible and retryable where appropriate.
- Expo component/navigation tests, generated API type checks, backend contract/service tests, lint, typecheck, and iOS/Android/web production bundle checks pass against test-environment data.
