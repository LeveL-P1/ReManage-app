# Resident Bills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Resident Bills placeholder with an invoice-first payment screen and truthful static pop-outs.

**Architecture:** Create a focused Bills feature folder for fixtures, route metadata, the tab composition, and generic pop-outs. Keep Expo Router wrappers under `src/app/(resident)/bills`; the existing tab wrapper mounts the new screen.

**Tech Stack:** Expo Router, React Native, TypeScript, Jest, React Native Testing Library, `@expo/vector-icons`.

## Global Constraints

- Work directly in `C:\Users\pawan\Projects\ReManage-app`.
- Do not modify `app.json`, `package.json`, or `package-lock.json`.
- Use only deterministic fixtures and never simulate a completed payment.
- Preserve Resident/Guard route isolation and use only static Bills routes.
- Leave Git staging and committing to the user unless they explicitly request it.

---

### Task 1: Add Bills fixtures and route catalog

**Files:**
- Create: `src/features/resident/bills/resident-bills-fixtures.ts`
- Create: `src/features/resident/bills/resident-bills-feature-catalog.ts`
- Test: `src/features/resident/bills/resident-bills-feature-catalog.test.ts`

**Interfaces:**
- Produces `residentBillsFixture`, `ResidentBillsViewModel`, `ResidentBillsFeatureId`, and `getResidentBillsFeature(id)`.

- [ ] Write a failing test that asserts the fixture has one latest invoice and `pay-now` maps to `/(resident)/bills/pay-now`.
- [ ] Run `npm test -- resident-bills-feature-catalog.test.ts` and verify the module-missing failure.
- [ ] Implement the minimal catalog and fixture.
- [ ] Re-run the focused test and verify it passes.

### Task 2: Compose the Bills tab

**Files:**
- Create: `src/features/resident/bills/resident-bills-screen.tsx`
- Modify: `src/app/(resident)/(tabs)/bills.tsx`
- Test: `src/features/resident/bills/resident-bills-screen.test.tsx`

**Interfaces:**
- Consumes the Bills fixture/catalog and produces `ResidentBillsScreen`.

- [ ] Write a failing test for the dues card, Pay now button, quick actions, latest invoice, and static action navigation.
- [ ] Run `npm test -- resident-bills-screen.test.tsx` and verify the screen-missing failure.
- [ ] Implement the invoice-first composition using the shared Resident header and action grid.
- [ ] Re-run the focused test and verify it passes.

### Task 3: Add Bills pop-outs

**Files:**
- Create: `src/features/resident/bills/resident-bills-feature-screen.tsx`
- Create: `src/app/(resident)/bills/pay-now.tsx`
- Create: `src/app/(resident)/bills/invoices.tsx`
- Create: `src/app/(resident)/bills/history.tsx`
- Create: `src/app/(resident)/bills/help.tsx`
- Create: `src/app/(resident)/bills/july-2026.tsx`
- Test: `src/features/resident/bills/resident-bills-feature-screen.test.tsx`

**Interfaces:**
- Consumes `ResidentBillsFeatureId`; renders accessible close and return actions.

- [ ] Write a failing pop-out close test.
- [ ] Run `npm test -- resident-bills-feature-screen.test.tsx` and verify the component-missing failure.
- [ ] Implement the generic pop-out and static wrappers.
- [ ] Re-run the focused test and verify it passes.

### Task 4: Verify Bills scope

**Files:**
- Modify only Bills files if validation exposes a Bills regression.

- [ ] Run focused Bills tests, full tests, typecheck, lint, and `npm run bundle:check`.
- [ ] Confirm `git diff --name-only` excludes `app.json`, `package.json`, and `package-lock.json` from this phase’s Bills changes.
