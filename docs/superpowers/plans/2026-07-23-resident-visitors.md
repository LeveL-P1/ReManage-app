# Resident Visitors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Resident Visitors placeholder with an arrival-first, fixture-backed screen and dedicated pop-outs that match the approved Home and Community visual system.

**Architecture:** Keep all Visitor-only view models and route metadata inside `src/features/resident/visitors`. The tab screen composes existing shared Resident UI primitives, while a dedicated pop-out component renders every Visitor stack route from the catalog.

**Tech Stack:** Expo Router, React Native, TypeScript, Jest, React Native Testing Library, `@expo/vector-icons`.

## Global Constraints

- Preserve the fixed Resident tab order: Home, Visitors, Community, Bills, More.
- Reuse the approved warm neutral, rounded-card visual system; use no ads or copied MyGate assets.
- Keep all data deterministic fixtures; no fetches, APIs, or simulated mutation success.
- Every Visitor action opens a static Resident stack route.
- Do not commit, merge, or stage this work.

---

### Task 1: Define Visitors fixtures and navigation catalog

**Files:**
- Create: `src/features/resident/visitors/resident-visitors-fixtures.ts`
- Create: `src/features/resident/visitors/resident-visitors-feature-catalog.ts`
- Test: `src/features/resident/visitors/resident-visitors-feature-catalog.test.ts`

**Interfaces:**
- Produces `residentVisitorsFixture`, `ResidentVisitorsViewModel`, `ResidentVisitorFeatureId`, and `getResidentVisitorFeature(id)`.
- Consumed by the Visitor tab screen and all Visitor pop-out routes.

- [ ] **Step 1: Write the failing catalog test**

```ts
expect(getResidentVisitorFeature("invite-guest").route).toBe("/(resident)/visitors/invite-guest");
expect(residentVisitorsFixture.expectedVisitors).toHaveLength(2);
```

- [ ] **Step 2: Run the focused test and verify it fails because the module does not exist.**

Run: `npm test -- resident-visitors-feature-catalog.test.ts`

- [ ] **Step 3: Add the minimal typed catalog and deterministic fixture.**

- [ ] **Step 4: Re-run the focused test and verify it passes.**

Run: `npm test -- resident-visitors-feature-catalog.test.ts`

### Task 2: Compose the Visitors tab

**Files:**
- Create: `src/features/resident/visitors/resident-visitors-screen.tsx`
- Modify: `src/app/(resident)/(tabs)/visitors.tsx`
- Test: `src/features/resident/visitors/resident-visitors-screen.test.tsx`

**Interfaces:**
- Consumes `residentVisitorsFixture` and `getResidentVisitorFeature(id)`.
- Produces `ResidentVisitorsScreen`, rendered by the existing Visitors tab route.

- [ ] **Step 1: Write the failing screen test.**

```tsx
expect(screen.getByText("Today’s visitor updates")).toBeTruthy();
fireEvent.press(screen.getByRole("button", { name: "Invite Guest" }));
expect(mockPush).toHaveBeenLastCalledWith("/(resident)/visitors/invite-guest");
```

- [ ] **Step 2: Run the focused test and verify it fails because the screen does not exist.**

Run: `npm test -- resident-visitors-screen.test.tsx`

- [ ] **Step 3: Implement the screen and route with shared Resident primitives.**

- [ ] **Step 4: Re-run the focused test and verify it passes.**

Run: `npm test -- resident-visitors-screen.test.tsx`

### Task 3: Add Visitor pop-out routes

**Files:**
- Create: `src/features/resident/visitors/resident-visitors-feature-screen.tsx`
- Create: `src/app/(resident)/visitors/pre-approve.tsx`
- Create: `src/app/(resident)/visitors/invite-guest.tsx`
- Create: `src/app/(resident)/visitors/daily-help.tsx`
- Create: `src/app/(resident)/visitors/history.tsx`
- Create: `src/app/(resident)/visitors/updates.tsx`
- Create: `src/app/(resident)/visitors/[visitorId].tsx`
- Test: `src/features/resident/visitors/resident-visitors-feature-screen.test.tsx`

**Interfaces:**
- Consumes `ResidentVisitorFeatureId` and uses `router.back()` for dismissal.
- Produces one static, accessible stack surface per Visitor feature.

- [ ] **Step 1: Write the failing pop-out interaction test.**

```tsx
fireEvent.press(screen.getByRole("button", { name: "Close Invite Guest" }));
expect(mockBack).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run the focused test and verify it fails because the pop-out component does not exist.**

Run: `npm test -- resident-visitors-feature-screen.test.tsx`

- [ ] **Step 3: Implement the reusable pop-out and its static route wrappers.**

- [ ] **Step 4: Re-run the focused test and verify it passes.**

Run: `npm test -- resident-visitors-feature-screen.test.tsx`

### Task 4: Validate the finished tab

**Files:**
- Modify: all Task 1–3 files only if validation exposes a Visitors regression.

- [ ] **Step 1: Run all Visitor-focused tests.**

Run: `npm test -- resident-visitors`

- [ ] **Step 2: Run project type checking and linting.**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Check the final diff and leave it uncommitted for user review.**

Run: `git diff -- src/features/resident/visitors src/app/(resident)/(tabs)/visitors.tsx src/app/(resident)/visitors docs/superpowers`
