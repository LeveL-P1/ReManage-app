# Resident More Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the final Resident More tab as a high-fidelity, permission-filtered account-and-services hub with static pop-out screens for every service.

**Architecture:** `ResidentMoreScreen` owns the tab composition and keeps filtering delegated to the existing Resident module catalog. A small typed More feature catalog gives each non-tab service a fixed route and presentation data; one reusable feature-screen component renders all static wrapper routes. The tab-only Bills and Visitors modules keep their existing destinations.

**Tech Stack:** Expo Router, React Native, TypeScript, Jest, React Native Testing Library, `@expo/vector-icons`.

## Global Constraints

- Work directly in `C:\Users\pawan\Projects\ReManage-app`.
- Keep five Resident tabs unchanged and preserve role isolation.
- Use static fixture data only; no API, mutation, or live request claim.
- Use no dynamic URL parameters in Resident routes.
- Preserve permission filtering and leave `app.json`, `package.json`, and `package-lock.json` untouched.
- Leave Git staging and commits under explicit user control.

---

### Task 1: Add typed More service destinations

**Files:**
- Create: `src/features/resident/more/resident-more-feature-catalog.ts`
- Create: `src/features/resident/more/resident-more-feature-catalog.test.ts`

**Interfaces:**
- Consumes: `ResidentModuleDefinition` and `ResidentIconKey` from `src/features/resident/catalog/resident-module-catalog.ts`.
- Produces: `getResidentMoreFeature(moduleId)` and `residentMoreFeatures`, used by the tab and feature screen.

- [ ] **Step 1: Write the failing catalog test**

```ts
expect(getResidentMoreFeature("helpdesk").route).toBe("/(resident)/more/helpdesk");
expect(getResidentMoreFeature("documents").highlights).toHaveLength(3);
expect(getResidentMoreFeature("my-bills")).toBeNull();
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/features/resident/more/resident-more-feature-catalog.test.ts --runInBand`

Expected: failure because the More feature catalog does not exist.

- [ ] **Step 3: Add the typed fixed-route catalog**

```ts
export function getResidentMoreFeature(moduleId: ResidentModuleId) {
  return residentMoreFeatures.find((feature) => feature.moduleId === moduleId) ?? null;
}
```

Include every non-tab resident module and three concise truthful preview highlights per entry.

- [ ] **Step 4: Run the focused test**

Run: `npm test -- src/features/resident/more/resident-more-feature-catalog.test.ts --runInBand`

Expected: PASS.

### Task 2: Redesign the More tab around account and services

**Files:**
- Modify: `src/features/resident/more/resident-more-screen.tsx`
- Modify: `src/features/resident/more/resident-more-screen.test.tsx`

**Interfaces:**
- Consumes: `groupResidentModules`, `getResidentMoreFeature`, session bootstrap, and `RoleSwitcher`.
- Produces: a more visual More tab that routes Bills/Visitors to tabs and all other allowed rows to their static pop-outs.

- [ ] **Step 1: Write failing visual and navigation expectations**

```tsx
expect(screen.getByRole("header", { name: "More" })).toBeTruthy();
expect(screen.getByText("Account & access")).toBeTruthy();
await fireEvent.press(screen.getByRole("button", { name: "Helpdesk" }));
expect(mockPush).toHaveBeenCalledWith("/(resident)/more/helpdesk");
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/features/resident/more/resident-more-screen.test.tsx --runInBand`

Expected: failure because the new heading/account inventory and route behavior are absent.

- [ ] **Step 3: Implement the account-and-services composition**

```tsx
<ResidentSectionHeader title={group.label} />
{group.modules.map((module) => (
  <ResidentContentCard
    key={module.id}
    title={module.label}
    description={module.description}
    icon={module.icon}
    onPress={() => openModule(module)}
  />
))}
```

Add the home-profile card, account/help footer, and static route behavior while retaining the existing empty state and role switcher.

- [ ] **Step 4: Run the focused test**

Run: `npm test -- src/features/resident/more/resident-more-screen.test.tsx --runInBand`

Expected: PASS.

### Task 3: Add reusable pop-outs and static route wrappers

**Files:**
- Create: `src/features/resident/more/resident-more-feature-screen.tsx`
- Create: `src/features/resident/more/resident-more-feature-screen.test.tsx`
- Create: `src/app/(resident)/more/*.tsx` for each fixed More service route

**Interfaces:**
- Consumes: `ResidentMoreFeatureDefinition` and `useRouter`.
- Produces: a common, accessible pop-out body reused by static Expo Router routes.

- [ ] **Step 1: Write the failing pop-out test**

```tsx
expect(screen.getByRole("header", { name: "Helpdesk" })).toBeTruthy();
expect(screen.getByText("This is a guided mobile preview.")).toBeTruthy();
await fireEvent.press(screen.getByRole("button", { name: "Back" }));
expect(mockBack).toHaveBeenCalled();
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- src/features/resident/more/resident-more-feature-screen.test.tsx --runInBand`

Expected: failure because the reusable More feature screen does not exist.

- [ ] **Step 3: Implement the feature screen and wrappers**

```tsx
export default function HelpdeskRoute() {
  return <ResidentMoreFeatureScreen feature={getResidentMoreFeatureOrThrow("helpdesk")} />;
}
```

Create one explicit wrapper per non-tab module. Keep all copy fixture-backed and action labels honest about preview status.

- [ ] **Step 4: Run focused More tests**

Run: `npm test -- src/features/resident/more --runInBand`

Expected: PASS.

### Task 4: Verify the main workspace and hand off for review

**Files:**
- Modify: `docs/superpowers/specs/2026-07-23-resident-more-design.md`
- Modify: `docs/superpowers/plans/2026-07-23-resident-more.md`

- [ ] **Step 1: Run full verification**

Run: `npx jest --runInBand --silent --forceExit`, `npm run typecheck`, `npm run lint`, and `npm run bundle:check`.

Expected: all commands exit successfully.

- [ ] **Step 2: Check scope**

Run: `git status --short` and `rg -n "TBD|TODO|use(?:Global|Local)SearchParams|\\bAD\\b" src/features/resident/more src/app/(resident)/more`.

Expected: only intended More/docs changes beyond known pre-existing files; no production placeholders, dynamic route parameters, or ads.

- [ ] **Step 3: Request review**

Report the static previews, validation evidence, and that no changes were staged or committed. Ask the user to review the More tab.
