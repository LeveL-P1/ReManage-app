# Guard Gate Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an authenticated Guard Gate visitor lifecycle—request approval, verify a pre-approved passcode, check in, and check out—through ReManageSociety's mobile API and the Expo app.

**Architecture:** Extend the existing `codex/mobile-api-foundation` backend worktree with a Guard-only `/api/mobile/v1/guard` module that uses `MobileSessionGuard` and server-derived society/role context. Regenerate the Expo OpenAPI client, then replace the Guard placeholder with a dark, mobile-first Gate tab and stack pop-outs that render only server-authoritative visitor states.

**Tech Stack:** NestJS + Fastify + Prisma + Vitest + OpenAPI; Expo 57 + Expo Router + React Native + React Query + Jest.

## Global Constraints

- Mobile requests use only `/api/mobile/v1`; never call legacy `/api/guard`, `/api/v1`, or browser-cookie endpoints.
- Mobile society, guard identity, permission role, and audit actor are derived from `MobileSessionGuard`; no client-supplied authority identifiers are accepted.
- `guardOffline` remains `false`; mutations are online-only and are never queued locally.
- Keep the legacy web direct-entry path out of mobile UI and mobile API.
- Use the existing ReManage mobile access-token/session model and the controlled one-society test environment.
- Each task is verified before its focused commit. Do not stage unrelated work.

---

## File structure

### ReManageSociety (`C:\tmp\remanage-mobile-foundation-api`)

- `apps/api/src/mobile/guard/dto/mobile-guard.dto.ts`: validated request DTOs and response schemas.
- `apps/api/src/mobile/guard/mobile-guard.controller.ts`: `/api/mobile/v1/guard` HTTP surface.
- `apps/api/src/mobile/guard/mobile-guard.service.ts`: state-transition and problem-code policy.
- `apps/api/src/mobile/guard/mobile-guard.repository.ts`: society-scoped Prisma reads and mutations.
- `apps/api/src/mobile/guard/*.test.ts`: controller, service, and repository guard regression coverage.
- `apps/api/src/mobile/mobile-api.module.ts`: Guard controller/provider registration.

### ReManage-app (`C:\Users\pawan\Projects\ReManage-app`)

- `src/platform/api/generated/mobile-v1.ts`: regenerated typed mobile contract.
- `src/features/guard/gate/guard-gate-api.ts`: typed request/query adapter over the generated client.
- `src/features/guard/gate/guard-gate-fixtures.ts`: test-only API response builders.
- `src/features/guard/gate/guard-gate-screen.tsx`: Gate overview and four primary controls.
- `src/features/guard/gate/guard-visitor-flow-screen.tsx`: reusable request/status/passcode/detail stack UI.
- `src/features/guard/gate/*.test.tsx`: screen, transition, and accessibility tests.
- `src/app/(guard)/(tabs)/index.tsx`: Gate tab entrypoint.
- `src/app/(guard)/gate/*.tsx`: full-screen Guard stack routes.
- `src/app/(guard)/_layout.tsx`: stack declarations for the new Gate routes.

## Task 1: Establish Guard mobile contract and server policy

**Files:**

- Create: `apps/api/src/mobile/guard/dto/mobile-guard.dto.ts`
- Create: `apps/api/src/mobile/guard/mobile-guard.controller.ts`
- Create: `apps/api/src/mobile/guard/mobile-guard.service.ts`
- Create: `apps/api/src/mobile/guard/mobile-guard.repository.ts`
- Create: `apps/api/src/mobile/guard/mobile-guard.service.test.ts`
- Create: `apps/api/src/mobile/guard/mobile-guard.controller.test.ts`
- Modify: `apps/api/src/mobile/mobile-api.module.ts`

**Interfaces:**

- Consumes: `MobileSessionGuard` and `MobileAuthenticatedRequest` from `src/mobile/session` and `src/mobile/common`.
- Produces: `MobileGuardService` methods `overview`, `listVisitors`, `requestVisitor`, `getVisitor`, `verifyPasscode`, `checkIn`, and `checkOut`.

- [ ] **Step 1: Write failing Guard service tests**

```ts
it("does not accept a client supplied society ID", async () => {
  await expect(service.requestVisitor(guardSession, { flatQuery: "A-308", visitorName: "Maya", purpose: "guest" })).resolves.toMatchObject({ status: "expected" });
  expect(repository.requestVisitor).toHaveBeenCalledWith(expect.objectContaining({ societyId: guardSession.societyId }));
});

it("rejects a check-in before resident approval", async () => {
  repository.findVisitor.mockResolvedValue({ id: "visitor_1", status: "expected", residentResponse: null });
  await expect(service.checkIn(guardSession, "visitor_1")).rejects.toMatchObject({ code: "visitor_not_approved" });
});
```

- [ ] **Step 2: Run the focused tests and confirm they fail because the Guard module does not exist**

Run: `npx vitest run apps/api/src/mobile/guard/mobile-guard.service.test.ts apps/api/src/mobile/guard/mobile-guard.controller.test.ts`

Expected: FAIL with missing module or missing `MobileGuardService`.

- [ ] **Step 3: Implement the service and repository with server-derived context**

```ts
async checkIn(session: MobileSession, visitorId: string) {
  const visitor = await this.repository.findVisitor(session.societyId, visitorId);
  if (!visitor || visitor.status !== "expected" || visitor.residentResponse !== "approved") {
    throw mobileProblem("visitor_not_approved", "Visitor approval is required before check-in.");
  }
  return this.repository.markEntered(session.societyId, visitorId, session.userId);
}
```

The repository filters every query by `session.societyId`, records the authenticated guard as the action actor, checks blacklist/passcode validity before transitions, and returns minimal mobile DTOs. The request endpoint creates only `expected` records; it never accepts an entry-mode field.

- [ ] **Step 4: Implement the guarded controller routes and OpenAPI decorators**

```ts
@Controller("api/mobile/v1/guard")
@UseFilters(MobileProblemFilter)
export class MobileGuardController {
  @Post("visitors/:visitorId/check-in")
  @UseGuards(MobileSessionGuard)
  checkIn(@Req() request: MobileAuthenticatedRequest, @Param("visitorId") visitorId: string) {
    return this.guards.checkIn(requireGuardSession(request), visitorId);
  }
}
```

Register the controller and providers in `MobileApiModule`. Every endpoint rejects a session whose active role is not `guard` with the existing mobile problem format.

- [ ] **Step 5: Run backend focused verification**

Run: `npx vitest run apps/api/src/mobile/guard/mobile-guard.service.test.ts apps/api/src/mobile/guard/mobile-guard.controller.test.ts apps/api/src/mobile/session/mobile-session.guard.test.ts && npm run typecheck`

Expected: all focused tests and backend TypeScript check pass.

- [ ] **Step 6: Commit the backend contract implementation**

```bash
git add apps/api/src/mobile/guard apps/api/src/mobile/mobile-api.module.ts
git commit -m "feat(mobile-api): add guard visitor lifecycle"
```

## Task 2: Publish the contract and regenerate the Expo client

**Files:**

- Modify: `contracts/mobile-v1.openapi.json`
- Modify: `src/platform/api/generated/mobile-v1.ts`
- Test: `src/platform/api/mobile-api-client.test.ts`

**Interfaces:**

- Consumes: Swagger output from `MobileGuardController`.
- Produces: typed `paths` entries for the seven Guard endpoint families under `/api/mobile/v1/guard`.

- [ ] **Step 1: Write a failing client contract assertion**

```ts
type GuardOverview = paths["/api/mobile/v1/guard/gate/overview"]["get"]["responses"][200]["content"]["application/json"];
const overview: GuardOverview = { gateLabel: "Main Gate", counts: { inside: 1, expected: 2, pendingApproval: 1, pendingParcels: 3 } };
expect(overview.gateLabel).toBe("Main Gate");
```

- [ ] **Step 2: Run the client contract test and confirm it fails because the route type is absent**

Run: `npm test -- --runInBand src/platform/api/mobile-api-client.test.ts`

Expected: FAIL at TypeScript compilation or missing route type.

- [ ] **Step 3: Serve the backend API and synchronise the mobile repository contract**

```bash
# ReManageSociety worktree, with configured test-environment variables
npm run dev:api
# ReManage-app
$env:MOBILE_OPENAPI_URL="http://localhost:4000/docs-json"; npm run api:sync
```

The generated contract contains only mobile endpoints and does not expose legacy Guard request fields such as `societyId`, `guardId`, or `entryMode`.

- [ ] **Step 4: Run contract and generated-type verification**

Run: `npm run api:check && npm run typecheck && npm test -- --runInBand src/platform/api/mobile-api-client.test.ts`

Expected: contract check, generated typecheck, and client test pass.

- [ ] **Step 5: Commit contract changes in each repository**

```bash
# ReManage-app
git add contracts/mobile-v1.openapi.json src/platform/api/generated/mobile-v1.ts src/platform/api/mobile-api-client.test.ts
git commit -m "chore(api): sync guard gate contract"
```

## Task 3: Build typed Expo Guard Gate data layer

**Files:**

- Create: `src/features/guard/gate/guard-gate-api.ts`
- Create: `src/features/guard/gate/guard-gate-fixtures.ts`
- Create: `src/features/guard/gate/guard-gate-api.test.ts`

**Interfaces:**

- Consumes: generated Guard `paths` types and authenticated client from `src/platform/api/mobile-api-client.ts`.
- Produces: `getGuardOverview`, `listGuardVisitors`, `requestGuardVisitor`, `verifyGuardPasscode`, `checkInGuardVisitor`, and `checkOutGuardVisitor`.

- [ ] **Step 1: Write failing adapter tests for request payload minimisation and problem-code mapping**

```ts
await requestGuardVisitor(client, { flatQuery: "A-308", visitorName: "Maya Shah", purpose: "guest" });
expect(client.POST).toHaveBeenCalledWith("/api/mobile/v1/guard/visitors/requests", {
  body: { flatQuery: "A-308", visitorName: "Maya Shah", purpose: "guest" },
});
```

- [ ] **Step 2: Run the adapter test and confirm it fails because the adapter is absent**

Run: `npm test -- --runInBand src/features/guard/gate/guard-gate-api.test.ts`

Expected: FAIL with missing module.

- [ ] **Step 3: Implement the adapter and test fixtures**

The adapter reads only the generated contract paths, throws a typed mobile problem for non-2xx responses, and maps `visitor_not_approved`, `visitor_blocked`, `passcode_invalid`, `passcode_expired`, `visitor_state_invalid`, and `service_unavailable` to display-safe states. Fixtures model `expected`, approved `expected`, `in`, `out`, rejected, and unavailable results.

- [ ] **Step 4: Run focused adapter verification**

Run: `npm test -- --runInBand src/features/guard/gate/guard-gate-api.test.ts && npm run typecheck`

Expected: adapter test and app typecheck pass.

- [ ] **Step 5: Commit the typed client layer**

```bash
git add src/features/guard/gate/guard-gate-api.ts src/features/guard/gate/guard-gate-fixtures.ts src/features/guard/gate/guard-gate-api.test.ts
git commit -m "feat(guard): add typed gate API client"
```

## Task 4: Replace the Gate placeholder with overview and routes

**Files:**

- Create: `src/features/guard/gate/guard-gate-screen.tsx`
- Create: `src/features/guard/gate/guard-gate-screen.test.tsx`
- Create: `src/app/(guard)/gate/log-visitor.tsx`
- Create: `src/app/(guard)/gate/verify-passcode.tsx`
- Create: `src/app/(guard)/gate/approved-visitors.tsx`
- Create: `src/app/(guard)/gate/visitors-inside.tsx`
- Modify: `src/app/(guard)/(tabs)/index.tsx`
- Modify: `src/app/(guard)/_layout.tsx`

**Interfaces:**

- Consumes: `getGuardOverview` and Expo Router.
- Produces: Gate overview with reachable route controls `Log visitor`, `Verify passcode`, `Approved visitors`, and `Visitors inside`.

- [ ] **Step 1: Write the failing Gate overview test**

```tsx
expect(screen.getByRole("header", { name: "Gate" })).toBeTruthy();
for (const label of ["Log visitor", "Verify passcode", "Approved visitors", "Visitors inside"]) {
  expect(screen.getByRole("button", { name: label })).toBeTruthy();
}
await fireEvent.press(screen.getByRole("button", { name: "Log visitor" }));
expect(mockPush).toHaveBeenCalledWith("/(guard)/gate/log-visitor");
```

- [ ] **Step 2: Run the Gate overview test and confirm it fails against `GuardShellScreen`**

Run: `npm test -- --runInBand src/features/guard/gate/guard-gate-screen.test.tsx`

Expected: FAIL because the Gate overview and action routes do not exist.

- [ ] **Step 3: Implement the operational overview**

Render guard and gate context, count cards, retryable loading/unavailable state, and the four 52px minimum action controls with Guard token colours. Keep all controls accessible. Do not display resident phone/email data.

- [ ] **Step 4: Run focused navigation verification**

Run: `npm test -- --runInBand src/features/guard/gate/guard-gate-screen.test.tsx src/testing/navigation-contract.test.ts`

Expected: Gate overview and navigation tests pass.

- [ ] **Step 5: Commit the Gate overview**

```bash
git add src/features/guard/gate/guard-gate-screen.tsx src/features/guard/gate/guard-gate-screen.test.tsx src/app/(guard)/_layout.tsx src/app/(guard)/(tabs)/index.tsx src/app/(guard)/gate
git commit -m "feat(guard): add gate overview routes"
```

## Task 5: Implement visitor action pop-outs and state-safe confirmations

**Files:**

- Create: `src/features/guard/gate/guard-visitor-flow-screen.tsx`
- Create: `src/features/guard/gate/guard-visitor-flow-screen.test.tsx`
- Modify: `src/app/(guard)/gate/log-visitor.tsx`
- Modify: `src/app/(guard)/gate/verify-passcode.tsx`
- Modify: `src/app/(guard)/gate/approved-visitors.tsx`
- Modify: `src/app/(guard)/gate/visitors-inside.tsx`

**Interfaces:**

- Consumes: Guard adapter functions and the shared modal primitive.
- Produces: routes that submit a request, poll/read its state, verify a passcode, confirm check-in, and confirm check-out.

- [ ] **Step 1: Write failing visitor-flow tests**

```tsx
await fireEvent.press(screen.getByRole("button", { name: "Request resident approval" }));
expect(requestGuardVisitor).toHaveBeenCalledWith(expect.anything(), { flatQuery: "A-308", visitorName: "Maya Shah", purpose: "guest" });
expect(screen.getByText("Awaiting approval")).toBeTruthy();

expect(screen.queryByRole("button", { name: "Check in visitor" })).toBeNull();
rerender(<GuardVisitorFlowScreen visitor={approvedVisitor} mode="approved" />);
expect(screen.getByRole("button", { name: "Check in visitor" })).toBeTruthy();
```

- [ ] **Step 2: Run the visitor-flow test and confirm it fails because the screen is absent**

Run: `npm test -- --runInBand src/features/guard/gate/guard-visitor-flow-screen.test.tsx`

Expected: FAIL with missing component.

- [ ] **Step 3: Implement each flow with server-authoritative transitions**

`Log visitor` submits only the minimal request body and navigates to request status. `Verify passcode` calls verify before rendering the visitor and opens a confirmation modal before check-in. `Approved visitors` exposes check-in only when the returned state is approved `expected`. `Visitors inside` exposes exit only when state is `in`. Each request handles unavailable, blocked, rejected, expired, and invalid-state problem codes without exposing raw backend errors.

- [ ] **Step 4: Run focused flow verification**

Run: `npm test -- --runInBand src/features/guard/gate/guard-visitor-flow-screen.test.tsx src/features/guard/gate/guard-gate-screen.test.tsx`

Expected: all visitor flow tests pass.

- [ ] **Step 5: Commit the visitor pop-outs**

```bash
git add src/features/guard/gate/guard-visitor-flow-screen.tsx src/features/guard/gate/guard-visitor-flow-screen.test.tsx src/app/(guard)/gate
git commit -m "feat(guard): add visitor lifecycle pop-outs"
```

## Task 6: Cross-repository release verification

**Files:**

- Modify: `docs/superpowers/plans/2026-07-26-guard-gate-vertical-slice.md` to tick verified tasks.

**Interfaces:**

- Consumes: committed backend API, generated contract, and committed Expo Gate flow.
- Produces: reproducible test-environment release evidence.

- [ ] **Step 1: Run backend contract and API checks**

Run from `C:\tmp\remanage-mobile-foundation-api`: `npm run typecheck && npx vitest run apps/api/src/mobile/guard apps/api/src/mobile/session`

Expected: exit code 0 with no Guard or mobile-session failures.

- [ ] **Step 2: Run Expo regression and production bundle checks**

Run from `C:\Users\pawan\Projects\ReManage-app`: `npm test -- --runInBand && npm run api:check && npm run typecheck && npm run lint && npm run bundle:check`

Expected: all tests, API contract check, typecheck, lint, and iOS/Android/web export exit 0.

- [ ] **Step 3: Verify test-environment Guard lifecycle manually**

Use a Guard session in the configured beta test society: create a visitor request, approve it from a Resident session, check in from a Guard session, and check out from a Guard session. Confirm each action appears only in the correct society and role state.

- [ ] **Step 4: Commit the verified plan checklist**

```bash
git add docs/superpowers/plans/2026-07-26-guard-gate-vertical-slice.md
git commit -m "docs: record guard gate verification"
```
