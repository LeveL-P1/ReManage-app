# Resident UI QA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the completed Resident UI shell pass its component test suite while preserving the approved screen designs.

**Architecture:** The shared pop-out header owns contextual close-button accessibility labels for Bills and Visitors routes. Community keeps both the five-column Directory action and the richer Directory card, but assigns each a unique accessible name.

**Tech Stack:** Expo Router, React Native, TypeScript, Jest, React Native Testing Library.

## Global Constraints

- Do not add dependencies, API calls, assets, or change fixture data.
- Preserve the current shared `ResidentPopOutHeader` visual layout and all existing routes.
- Keep the existing Auth work aside; do not modify its source or tests in this QA task.
- Leave all changes unstaged and do not create a commit.

---

### Task 1: Restore contextual close labels through the shared pop-out header

**Files:**
- Modify: `src/features/resident/shared/resident-overlays.tsx`
- Verify: `src/features/resident/bills/resident-bills-feature-screen.test.tsx`
- Verify: `src/features/resident/visitors/resident-visitors-feature-screen.test.tsx`

**Interfaces:**
- Consumes: `title`, `backLabel`, and `onBack` passed to `ResidentPopOutHeader`.
- Produces: `Close <title>` for the default close control and preserves explicit non-close labels such as `Back`.

- [x] **Step 1: Run the two existing feature-screen tests as the failing regression contract**

Run: `npm test -- resident-bills-feature-screen.test.tsx resident-visitors-feature-screen.test.tsx`

Expected: FAIL because the shared header currently exposes only `Close` instead of `Close Pay society dues` and `Close Invite Guest`.

- [x] **Step 2: Apply the minimal shared-label rule**

```tsx
accessibilityLabel={backLabel === "Close" ? `Close ${title}` : backLabel}
```

- [x] **Step 3: Re-run the two feature-screen tests**

Run: `npm test -- resident-bills-feature-screen.test.tsx resident-visitors-feature-screen.test.tsx`

Expected: PASS with both routes calling `router.back()`.

### Task 2: Give the Community directory card an unambiguous accessible name

**Files:**
- Modify: `src/features/resident/community/resident-community-screen.test.tsx`
- Modify: `src/features/resident/community/resident-community-screen.tsx`

**Interfaces:**
- Consumes: the Community action-tile label `Resident Directory` and the directory-card interaction.
- Produces: a tile named `Resident Directory` and a rich directory card named `Open Resident Directory`, both routing to the directory feature.

- [x] **Step 1: Update the test contract before production code**

```tsx
expect(screen.getByRole("button", { name: "Resident Directory" })).toBeTruthy();
expect(screen.getByRole("button", { name: "Open Resident Directory" })).toBeTruthy();
```

- [x] **Step 2: Run the focused Community test and verify it fails because the card still shares the tile label**

Run: `npm test -- resident-community-screen.test.tsx`

Expected: FAIL because no control is named `Open Resident Directory`.

- [x] **Step 3: Apply the card-only accessibility-label change**

```tsx
accessibilityLabel="Open Resident Directory"
```

- [x] **Step 4: Re-run the focused Community test**

Run: `npm test -- resident-community-screen.test.tsx`

Expected: PASS with the Directory action tile still named `Resident Directory`.

### Task 3: Run the Resident UI regression gate

**Files:**
- Verify: `src/features/resident/community/resident-community-screen.test.tsx`
- Verify: `src/features/resident/bills/resident-bills-feature-screen.test.tsx`
- Verify: `src/features/resident/visitors/resident-visitors-feature-screen.test.tsx`

**Interfaces:**
- Consumes: the completed shared shell and Community screen behavior.
- Produces: a green full app test run with the focused Auth suite retained.

- [x] **Step 1: Run the full test suite**

Run: `npm test`

Expected: PASS with all Resident UI component tests green.

- [x] **Step 2: Inspect the unstaged worktree**

Run: `git diff --check` and `git status --short`

Expected: no whitespace errors; all existing and new work remains unstaged.
