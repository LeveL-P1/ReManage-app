# Resident Home and Community Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MyGate-inspired, ReManage-branded Resident Home, Community, and More screens that expose the permission-filtered ReManageSociety Resident module catalog using truthful fixture-backed interactions.

**Architecture:** Add one typed Resident module catalog driven by authenticated bootstrap permissions, then compose three focused feature screens from shared mobile UI primitives. Existing mobile tabs remain the only real navigation targets; unfinished ReManage modules open one accessible feedback sheet, preserving an API-ready boundary without faking backend behavior.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router, TypeScript 6, React 19, Jest 29, Testing Library React Native, `@expo/vector-icons` 15.0.2.

## Global Constraints

- Preserve the locked ReManage palette: `#FEFDDF`, `#FF5400`, `#FFBE00`, `#333333`, and `#FFFFFF`.
- Use MyGate-like proportions, positioning, typography, action-grid density, card radii, alignment, and bottom navigation without copying proprietary assets or content.
- Home uses four action columns; Community uses five action columns.
- Resident tabs are exactly Home, Visitors, Community, Bills, and More in that order.
- Guard tabs remain Gate, Parcels, Incidents, and More.
- Only bootstrap-permitted Resident modules render.
- No committee, treasurer, platform-admin, or Guard modules may appear in the Resident catalog.
- Unfinished workflows show truthful “mobile module coming next” feedback and never simulate success.
- Use deterministic typed fixtures; do not add feature API endpoints in this phase.
- Keep `.superpowers/` out of Git.
- Follow strict RED → GREEN → REFACTOR for each behavior.

---

## File Structure

### Create

- `src/features/resident/catalog/resident-module-catalog.ts` — typed module definitions, Resident demo permissions, filtering, and grouping.
- `src/features/resident/catalog/resident-module-catalog.test.ts` — catalog completeness and isolation tests.
- `src/features/resident/shared/resident-icon.tsx` — typed Ionicons adapter.
- `src/features/resident/shared/resident-ui.tsx` — header, section header, action tile/grid, stat tile, and content card.
- `src/features/resident/shared/resident-feedback-sheet.tsx` — accessible unfinished-module modal.
- `src/features/resident/shared/resident-feedback-sheet.test.tsx` — feedback and dismissal contract.
- `src/features/resident/home/resident-home-fixtures.ts` — deterministic Home view model.
- `src/features/resident/home/resident-home-screen.tsx` and `.test.tsx` — Home composition and contract.
- `src/features/resident/community/resident-community-fixtures.ts` — deterministic Community view model.
- `src/features/resident/community/resident-community-screen.tsx` and `.test.tsx` — Community composition and contract.
- `src/features/resident/more/resident-more-screen.tsx` and `.test.tsx` — grouped catalog and role switcher.
- `src/app/(resident)/(tabs)/community.tsx` — Community route.

### Modify

- `package.json`, `package-lock.json` — direct icon dependency.
- `src/platform/theme/tokens.ts` — Resident neutral, border, muted, and icon tokens.
- `src/platform/auth/development-demo-auth.ts` and `.test.ts` — role-correct demo permissions.
- `src/testing/fakes.ts` — role-correct test bootstrap permissions.
- `src/app/(resident)/(tabs)/index.tsx`, `more.tsx`, `_layout.tsx` — mount screens and five tabs.
- `src/testing/navigation-contract.test.ts` — new Resident order and unchanged Guard contract.

---

### Task 1: Permission-aware Resident module catalog

**Files:**

- Create: `src/features/resident/catalog/resident-module-catalog.ts`
- Create: `src/features/resident/catalog/resident-module-catalog.test.ts`
- Modify: `src/platform/auth/development-demo-auth.ts`
- Modify: `src/platform/auth/development-demo-auth.test.ts`
- Modify: `src/testing/fakes.ts`

**Interfaces:**

- Produces: `ResidentPermission`, `ResidentModuleId`, `ResidentModuleGroup`, `ResidentModuleDefinition`, `RESIDENT_DEMO_PERMISSIONS`, `RESIDENT_MODULES`, `filterResidentModules(permissions)`, and `groupResidentModules(modules)`.
- Consumes: `Bootstrap.permissions: string[]` and existing `MobileRole`.

- [ ] **Step 1: Write the failing catalog tests**

```ts
import {
  RESIDENT_DEMO_PERMISSIONS,
  RESIDENT_MODULES,
  filterResidentModules,
  groupResidentModules,
} from "./resident-module-catalog";

describe("Resident module catalog", () => {
  it("contains every approved ReManage Resident module exactly once", () => {
    expect(RESIDENT_MODULES.map(({ id }) => id)).toEqual([
      "my-bills", "my-visitors", "helpdesk", "sos", "announcements", "parcels",
      "forum", "events", "amenities", "marketplace", "parking", "directory",
      "staff", "society-noc", "meetings", "polls", "documents", "move-in-out",
    ]);
    expect(new Set(RESIDENT_MODULES.map(({ id }) => id)).size).toBe(RESIDENT_MODULES.length);
  });

  it("shows approved Resident modules but not permission-dependent move-in/out", () => {
    const visible = filterResidentModules(RESIDENT_DEMO_PERMISSIONS);
    expect(visible.map(({ id }) => id)).not.toContain("move-in-out");
    expect(visible).toHaveLength(17);
  });

  it("shows move-in/out only with tenant membership permission", () => {
    expect(filterResidentModules([...RESIDENT_DEMO_PERMISSIONS, "tenant:membership.read"]).map(({ id }) => id))
      .toContain("move-in-out");
  });

  it("keeps privileged permissions out of the Resident demo", () => {
    expect(RESIDENT_DEMO_PERMISSIONS).not.toEqual(expect.arrayContaining([
      "operations:gate.manage", "society:finance.manage", "community:notice.manage",
    ]));
  });

  it("groups modules in daily, community, governance order", () => {
    expect(groupResidentModules(filterResidentModules(RESIDENT_DEMO_PERMISSIONS)).map(({ id }) => id))
      .toEqual(["daily", "community", "governance"]);
  });
});
```

- [ ] **Step 2: Run the catalog test and verify RED**

```powershell
npm test -- --runTestsByPath src/features/resident/catalog/resident-module-catalog.test.ts
```

Expected: FAIL because `resident-module-catalog.ts` does not exist.

- [ ] **Step 3: Implement the catalog types and permissions**

```ts
export type ResidentPermission =
  | "dashboard.read" | "society:directory.read" | "society:finance.read"
  | "operations:visitor.respond" | "operations:read" | "operations:booking.manage"
  | "operations:sos.raise" | "community:read" | "community:helpdesk.respond"
  | "community:vote.cast" | "community:rsvp.manage" | "community:post"
  | "tenant:membership.read";

export type ResidentModuleId =
  | "my-bills" | "my-visitors" | "helpdesk" | "sos" | "announcements" | "parcels"
  | "forum" | "events" | "amenities" | "marketplace" | "parking" | "directory"
  | "staff" | "society-noc" | "meetings" | "polls" | "documents" | "move-in-out";

export type ResidentModuleGroup = "daily" | "community" | "governance";
export type ResidentIconKey =
  | "bill" | "visitor" | "helpdesk" | "sos" | "announcement" | "parcel"
  | "forum" | "event" | "amenity" | "marketplace" | "parking" | "directory"
  | "staff" | "noc" | "meeting" | "poll" | "document" | "move";

export type ResidentTabHref =
  | "/(resident)/(tabs)/visitors"
  | "/(resident)/(tabs)/bills";

export interface ResidentModuleDefinition {
  id: ResidentModuleId;
  label: string;
  description: string;
  group: ResidentModuleGroup;
  icon: ResidentIconKey;
  requiredPermissions: readonly ResidentPermission[];
  mobileRoute?: ResidentTabHref;
}

export const RESIDENT_DEMO_PERMISSIONS: readonly ResidentPermission[] = [
  "dashboard.read", "society:directory.read", "society:finance.read",
  "operations:visitor.respond", "operations:read", "operations:booking.manage",
  "operations:sos.raise", "community:read", "community:helpdesk.respond",
  "community:vote.cast", "community:rsvp.manage", "community:post",
] as const;
```

- [ ] **Step 4: Add the exact module inventory and filters**

Create `RESIDENT_MODULES` in this order with these fields:

```ts
export const RESIDENT_MODULES: readonly ResidentModuleDefinition[] = [
  { id: "my-bills", label: "My Bills", description: "Maintenance dues, invoices, and payments", group: "daily", icon: "bill", requiredPermissions: ["society:finance.read"], mobileRoute: "/(resident)/(tabs)/bills" },
  { id: "my-visitors", label: "My Visitors", description: "Guest approvals, invitations, and history", group: "daily", icon: "visitor", requiredPermissions: ["operations:visitor.respond"], mobileRoute: "/(resident)/(tabs)/visitors" },
  { id: "helpdesk", label: "Helpdesk", description: "Complaints, requests, and issue tracking", group: "daily", icon: "helpdesk", requiredPermissions: ["community:helpdesk.respond"] },
  { id: "sos", label: "SOS & Safety", description: "Emergency and security support", group: "daily", icon: "sos", requiredPermissions: ["operations:sos.raise"] },
  { id: "announcements", label: "Announcements", description: "Society notices and circulars", group: "daily", icon: "announcement", requiredPermissions: ["community:read"] },
  { id: "parcels", label: "Parcel Desk", description: "Deliveries, collections, and history", group: "daily", icon: "parcel", requiredPermissions: ["operations:read"] },
  { id: "forum", label: "Discussion Forum", description: "Resident posts and conversations", group: "community", icon: "forum", requiredPermissions: ["community:post"] },
  { id: "events", label: "Events & Calendar", description: "Society programs and RSVP", group: "community", icon: "event", requiredPermissions: ["community:rsvp.manage"] },
  { id: "amenities", label: "Amenity Booking", description: "Book clubhouse and shared spaces", group: "community", icon: "amenity", requiredPermissions: ["operations:booking.manage"] },
  { id: "marketplace", label: "Buy & Sell", description: "Resident marketplace", group: "community", icon: "marketplace", requiredPermissions: ["community:read"] },
  { id: "parking", label: "Parking", description: "Parking slots and registered vehicles", group: "community", icon: "parking", requiredPermissions: ["operations:read"] },
  { id: "directory", label: "Resident Directory", description: "Find and connect with neighbours", group: "community", icon: "directory", requiredPermissions: ["society:directory.read"] },
  { id: "staff", label: "Staff & Daily Help", description: "Helpers, staff, and attendance", group: "community", icon: "staff", requiredPermissions: ["operations:read"] },
  { id: "society-noc", label: "Society NOC", description: "NOC requests and records", group: "governance", icon: "noc", requiredPermissions: ["society:finance.read"] },
  { id: "meetings", label: "Meetings", description: "Agenda, minutes, and resolutions", group: "governance", icon: "meeting", requiredPermissions: ["community:read"] },
  { id: "polls", label: "Polls & Voting", description: "Resident polls and decisions", group: "governance", icon: "poll", requiredPermissions: ["community:vote.cast"] },
  { id: "documents", label: "Document Vault", description: "Society records and documents", group: "governance", icon: "document", requiredPermissions: ["community:read"] },
  { id: "move-in-out", label: "Move-In / Out", description: "Occupancy move requests", group: "governance", icon: "move", requiredPermissions: ["tenant:membership.read"] },
] as const;

const groupLabels = {
  daily: "Daily priorities",
  community: "Community & shared life",
  governance: "Governance & records",
} as const;

export function filterResidentModules(permissions: readonly string[]) {
  const allowed = new Set(permissions);
  return RESIDENT_MODULES.filter((module) => module.requiredPermissions.some((permission) => allowed.has(permission)));
}

export function groupResidentModules(modules: readonly ResidentModuleDefinition[]) {
  return (["daily", "community", "governance"] as const).map((id) => ({
    id, label: groupLabels[id], modules: modules.filter((module) => module.group === id),
  })).filter(({ modules }) => modules.length > 0);
}
```

- [ ] **Step 5: Make development and test bootstraps role-correct**

Import `RESIDENT_DEMO_PERMISSIONS`. Set Resident permissions to its spread value and Guard permissions to:

```ts
const guardDemoPermissions = [
  "operations:gate.manage", "operations:read", "operations:sos.raise", "community:read",
] as const;
```

Extend `development-demo-auth.test.ts` to assert Resident includes `society:finance.read`, Guard includes `operations:gate.manage`, and Guard excludes `society:finance.read`. Apply the same conditional permissions in `fakeBootstrap(role)`.

- [ ] **Step 6: Run focused tests and verify GREEN**

```powershell
npm test -- --runTestsByPath src/features/resident/catalog/resident-module-catalog.test.ts src/platform/auth/development-demo-auth.test.ts
```

Expected: both suites PASS.

- [ ] **Step 7: Commit Task 1**

```powershell
git add -- src/features/resident/catalog src/platform/auth/development-demo-auth.ts src/platform/auth/development-demo-auth.test.ts src/testing/fakes.ts
git commit -m "feat(app): add resident module catalog"
```

---

### Task 2: Shared Resident UI primitives and feedback sheet

**Files:**

- Modify: `package.json`, `package-lock.json`
- Modify: `src/platform/theme/tokens.ts`
- Create: `src/features/resident/shared/resident-icon.tsx`
- Create: `src/features/resident/shared/resident-ui.tsx`
- Create: `src/features/resident/shared/resident-feedback-sheet.tsx`
- Create: `src/features/resident/shared/resident-feedback-sheet.test.tsx`

**Interfaces:**

- Consumes: `ResidentIconKey` and `ResidentModuleDefinition` from Task 1.
- Produces: `ResidentIcon`, `ResidentSocietyHeader`, `ResidentSectionHeader`, `ResidentActionTile`, `ResidentActionGrid`, `ResidentStatTile`, `ResidentContentCard`, and `ResidentFeedbackSheet`.

- [ ] **Step 1: Add the direct Expo icon dependency**

```powershell
npm install @expo/vector-icons@^15.0.2
```

Expected: only the direct icon dependency and lock metadata change; Expo and React versions stay fixed.

- [ ] **Step 2: Write the failing feedback-sheet test**

```tsx
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { RESIDENT_MODULES } from "@/features/resident/catalog/resident-module-catalog";
import { ResidentFeedbackSheet } from "./resident-feedback-sheet";

describe("ResidentFeedbackSheet", () => {
  it("describes an unfinished module and dismisses accessibly", async () => {
    const onDismiss = jest.fn();
    const helpdesk = RESIDENT_MODULES.find(({ id }) => id === "helpdesk")!;
    const screen = await render(<ResidentFeedbackSheet module={helpdesk} onDismiss={onDismiss} />);
    expect(screen.getByText("Helpdesk")).toBeTruthy();
    expect(screen.getByText("Complaints, requests, and issue tracking")).toBeTruthy();
    expect(screen.getByText("This mobile module is coming in the next ReManage phase.")).toBeTruthy();
    await fireEvent.press(screen.getByRole("button", { name: "Close module details" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 3: Run the feedback test and verify RED**

```powershell
npm test -- --runTestsByPath src/features/resident/shared/resident-feedback-sheet.test.tsx
```

Expected: FAIL because the feedback component does not exist.

- [ ] **Step 4: Extend Resident theme tokens**

Add to `residentTheme` without changing existing values:

```ts
canvas: "#EEEAE3",
header: "#F4F1EC",
muted: "#697071",
border: "#DEDAD3",
ink: "#1F2324",
icon: "#123D41",
```

- [ ] **Step 5: Implement the typed icon adapter**

```tsx
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { ResidentIconKey } from "@/features/resident/catalog/resident-module-catalog";

const iconNames: Record<ResidentIconKey, ComponentProps<typeof Ionicons>["name"]> = {
  bill: "card-outline", visitor: "person-add-outline", helpdesk: "chatbox-ellipses-outline",
  sos: "warning-outline", announcement: "megaphone-outline", parcel: "cube-outline",
  forum: "chatbubbles-outline", event: "calendar-outline", amenity: "business-outline",
  marketplace: "bag-handle-outline", parking: "car-outline", directory: "book-outline",
  staff: "people-outline", noc: "document-attach-outline", meeting: "clipboard-outline",
  poll: "stats-chart-outline", document: "folder-open-outline", move: "swap-horizontal-outline",
};

export function ResidentIcon({ name, color, size = 24 }: { name: ResidentIconKey; color?: string; size?: number }) {
  return <Ionicons color={color} name={iconNames[name]} size={size} />;
}
```

- [ ] **Step 6: Implement shared geometry primitives**

Use these exact contracts in `resident-ui.tsx`:

```tsx
export interface ResidentActionTileProps {
  accessibilityLabel?: string;
  icon: ResidentIconKey;
  label: string;
  onPress(): void;
  columns: 4 | 5;
}

export function ResidentActionGrid({ children }: { children: ReactNode }) {
  return <View style={styles.actionGrid}>{children}</View>;
}

export function ResidentActionTile(props: ResidentActionTileProps) {
  const width = props.columns === 5 ? "18%" : "22%";
  return (
    <Pressable
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      accessibilityRole="button"
      onPress={props.onPress}
      style={({ pressed }) => [styles.actionWrap, { opacity: pressed ? 0.72 : 1, width }]}
    >
      <View style={styles.actionIcon}><ResidentIcon color={residentTheme.icon} name={props.icon} /></View>
      <Text numberOfLines={2} style={styles.actionLabel}>{props.label}</Text>
    </Pressable>
  );
}
```

Also implement:

- `ResidentSocietyHeader({ unit, societyName, onSearch, onNotifications, onProfile })` with three 44px controls and icon-only accessibility labels.
- `ResidentSectionHeader({ title, actionLabel?, onAction? })` with an accessibility header.
- `ResidentStatTile({ label, value, detail? })`.
- `ResidentContentCard({ title, description, icon?, accent?, onPress? })` with pressed state when interactive.

Use `StyleSheet.create` with 16px horizontal screen padding, white 16–20px-radius cards, charcoal text, muted secondary text, 58px icon tiles, and no shadow heavier than Android elevation 1.

- [ ] **Step 7: Implement the feedback modal**

Use React Native `Modal` with `transparent`, `animationType="fade"`, `onRequestClose={onDismiss}`, a dismissible backdrop, an inner sheet with `accessibilityViewIsModal`, the exact tested copy, and a 48px orange button labeled “Close module details”. Return `null` when `module` is `null`.

- [ ] **Step 8: Run focused tests and typecheck**

```powershell
npm test -- --runTestsByPath src/features/resident/shared/resident-feedback-sheet.test.tsx
npm run typecheck
```

Expected: test PASS and TypeScript exit 0.

- [ ] **Step 9: Commit Task 2**

```powershell
git add -- package.json package-lock.json src/platform/theme/tokens.ts src/features/resident/shared
git commit -m "feat(app): add resident dashboard primitives"
```

---

### Task 3: Resident Home screen

**Files:**

- Create: `src/features/resident/home/resident-home-fixtures.ts`
- Create: `src/features/resident/home/resident-home-screen.tsx`
- Create: `src/features/resident/home/resident-home-screen.test.tsx`
- Modify: `src/app/(resident)/(tabs)/index.tsx`

**Interfaces:**

- Consumes: authenticated `Bootstrap`, Task 1 catalog/filtering, Task 2 primitives and feedback sheet.
- Produces: `ResidentHomeViewModel`, `residentHomeFixture`, and `ResidentHomeScreen`.

- [ ] **Step 1: Write the failing Home tests**

Wrap the screen in `SessionContext.Provider` with `fakeBootstrap("resident")`; mock `expo-router` with `push: mockPush`. Assert:

```tsx
expect(screen.getByText("Your society, at a glance")).toBeTruthy();
for (const label of ["Pay bill", "Approve visitor", "Raise complaint", "Raise SOS"]) {
  expect(screen.getByRole("button", { name: label })).toBeTruthy();
}
expect(screen.getByText("Today")).toBeTruthy();
expect(screen.getByText("Recent activity")).toBeTruthy();
expect(screen.getByText("From your community")).toBeTruthy();

await fireEvent.press(screen.getByRole("button", { name: "Pay bill" }));
expect(mockPush).toHaveBeenCalledWith("/(resident)/(tabs)/bills");
await fireEvent.press(screen.getByRole("button", { name: "Approve visitor" }));
expect(mockPush).toHaveBeenCalledWith("/(resident)/(tabs)/visitors");
await fireEvent.press(screen.getByRole("button", { name: "Raise complaint" }));
expect(screen.getByText("This mobile module is coming in the next ReManage phase.")).toBeTruthy();
```

Add a permission test using only `society:finance.read` that renders Pay bill but not the other three actions.

Add an empty-state test by passing `{ ...residentHomeFixture, activity: [] }` to `ResidentHomeScreen` and asserting “No recent activity yet.” Press the header Search button and assert a mocked `Alert.alert` receives `"Search"` and `"Resident search is coming in the next ReManage phase."`.

- [ ] **Step 2: Run the Home test and verify RED**

```powershell
npm test -- --runTestsByPath src/features/resident/home/resident-home-screen.test.tsx
```

Expected: FAIL because `ResidentHomeScreen` does not exist.

- [ ] **Step 3: Add the typed Home fixture**

```ts
export interface ResidentHomeViewModel {
  unit: string;
  heroTitle: string;
  heroMessage: string;
  heroStatus: string;
  stats: readonly { id: string; label: string; value: string; detail: string }[];
  dues: { amount: string; dueLabel: string };
  activity: readonly { id: string; title: string; detail: string; icon: "visitor" | "parcel" }[];
  community: { title: string; detail: string };
  notice: { title: string; detail: string; body: string };
}

export const residentHomeFixture: ResidentHomeViewModel = {
  unit: "A-308",
  heroTitle: "Your society, at a glance",
  heroMessage: "Everything important in one place.",
  heroStatus: "All clear today",
  stats: [
    { id: "visitors", label: "Visitors", value: "2", detail: "Expected today" },
    { id: "parcels", label: "Parcels", value: "1", detail: "At the gate" },
    { id: "dues", label: "Outstanding", value: "₹2,850", detail: "Due 30 July" },
  ],
  dues: { amount: "₹2,850", dueLabel: "Maintenance due in 8 days" },
  activity: [
    { id: "visitor-riya", title: "Visitor approved", detail: "Riya Sharma · 10:42 AM", icon: "visitor" },
    { id: "parcel-gate", title: "Parcel at the gate", detail: "Collect from security", icon: "parcel" },
  ],
  community: { title: "Sunday monsoon meetup", detail: "Clubhouse · 5:30 PM · 18 interested" },
  notice: { title: "Water tank cleaning notice", detail: "Society Office · 1 hour ago", body: "Supply will pause from 11 AM to 1 PM this Saturday." },
};
```

- [ ] **Step 4: Implement and mount Home**

Expose `ResidentHomeScreen({ viewModel = residentHomeFixture }: { viewModel?: ResidentHomeViewModel })`. It reads authenticated `bootstrap.permissions`, filters `my-bills`, `my-visitors`, `helpdesk`, and `sos`, routes implemented modules, and stores unfinished modules for `ResidentFeedbackSheet`. Render the action labels with this explicit mobile mapping:

```ts
const quickActionLabels = {
  "my-bills": "Pay bill",
  "my-visitors": "Approve visitor",
  helpdesk: "Raise complaint",
  sos: "Raise SOS",
} as const;
```

Render one `ScrollView` in this order: society header, charcoal hero, Quick Actions, Today stats, dues card, Recent activity, From your community, notice preview. Route community preview to `/(resident)/(tabs)/community` and dues to Bills.

Wire Search, Notifications, and Profile header controls to truthful native alerts. Render “No recent activity yet.” when `viewModel.activity` is empty.

Mount it with:

```tsx
import { ResidentHomeScreen } from "@/features/resident/home/resident-home-screen";
export default function ResidentHomeRoute() { return <ResidentHomeScreen />; }
```

- [ ] **Step 5: Run Home tests and typecheck**

```powershell
npm test -- --runTestsByPath src/features/resident/home/resident-home-screen.test.tsx
npm run typecheck
```

Expected: Home suite PASS and TypeScript exit 0.

- [ ] **Step 6: Commit Task 3**

```powershell
git add -- src/features/resident/home 'src/app/(resident)/(tabs)/index.tsx'
git commit -m "feat(app): build resident home dashboard"
```

---

### Task 4: Resident Community screen

**Files:**

- Create: `src/features/resident/community/resident-community-fixtures.ts`
- Create: `src/features/resident/community/resident-community-screen.tsx`
- Create: `src/features/resident/community/resident-community-screen.test.tsx`
- Create: `src/app/(resident)/(tabs)/community.tsx`

**Interfaces:**

- Consumes: session permissions, module catalog, shared primitives, and feedback sheet.
- Produces: `ResidentCommunityViewModel`, `residentCommunityFixture`, and `ResidentCommunityScreen`.

- [ ] **Step 1: Write the failing Community tests**

Wrap with an authenticated Resident session and assert:

```tsx
const labels = [
  "Helpdesk", "Announcements", "Discussion Forum", "Events & Calendar", "Amenity Booking",
  "Resident Directory", "Staff & Daily Help", "Buy & Sell", "Parking", "More",
];
for (const label of labels) expect(screen.getByRole("button", { name: label })).toBeTruthy();
for (const heading of ["Happening nearby", "Find your circle", "Safety & support", "Governance highlights"]) {
  expect(screen.getByText(heading)).toBeTruthy();
}
expect(screen.getByText("Part of ReManage for 1 month")).toBeTruthy();

await fireEvent.press(screen.getByRole("button", { name: "More" }));
expect(mockPush).toHaveBeenCalledWith("/(resident)/(tabs)/more");
await fireEvent.press(screen.getByRole("button", { name: "Helpdesk" }));
expect(screen.getByText("This mobile module is coming in the next ReManage phase.")).toBeTruthy();
```

Add a permission test that removes `community:rsvp.manage` and confirms Events & Calendar is absent while More remains.

- [ ] **Step 2: Run Community test and verify RED**

```powershell
npm test -- --runTestsByPath src/features/resident/community/resident-community-screen.test.tsx
```

Expected: FAIL because Community files do not exist.

- [ ] **Step 3: Add the typed Community fixture**

```ts
export interface ResidentCommunityViewModel {
  unit: string;
  stats: readonly { id: string; label: string; value: string }[];
  event: { title: string; detail: string };
  hostPrompt: { title: string; detail: string };
  safety: { title: string; detail: string };
  dues: { amount: string; detail: string };
  tenure: string;
}

export const residentCommunityFixture: ResidentCommunityViewModel = {
  unit: "A-308",
  stats: [
    { id: "homes", label: "Homes", value: "86" },
    { id: "pets", label: "Pets", value: "24" },
    { id: "directory", label: "Directory", value: "92%" },
  ],
  event: { title: "Sunday monsoon meetup", detail: "Clubhouse · 5:30 PM · 18 interested" },
  hostPrompt: { title: "Host a community activity", detail: "Propose a class, game, or resident gathering" },
  safety: { title: "Raise SOS", detail: "Contact society security immediately" },
  dues: { amount: "₹2,850 society dues", detail: "Invoice available · Due 30 July" },
  tenure: "Part of ReManage for 1 month",
};
```

- [ ] **Step 4: Implement and mount Community**

Use this ordered module set:

```ts
const communityActionIds = [
  "helpdesk", "announcements", "forum", "events", "amenities",
  "directory", "staff", "marketplace", "parking",
] as const;
```

Expose `ResidentCommunityScreen({ viewModel = residentCommunityFixture }: { viewModel?: ResidentCommunityViewModel })`. Filter against bootstrap permissions, render one `ResidentActionGrid` with each `ResidentActionTile columns={5}`, and add More as the tenth action. Compose fixture-backed sections in the approved order. Use feedback for unfinished modules, route dues to Bills, and route More to More. Wire Search, Notifications, and Profile header controls to the same truthful native alerts used by Home.

Mount with:

```tsx
import { ResidentCommunityScreen } from "@/features/resident/community/resident-community-screen";
export default function ResidentCommunityRoute() { return <ResidentCommunityScreen />; }
```

- [ ] **Step 5: Run Community tests and typecheck**

```powershell
npm test -- --runTestsByPath src/features/resident/community/resident-community-screen.test.tsx
npm run typecheck
```

Expected: Community suite PASS and TypeScript exit 0.

- [ ] **Step 6: Commit Task 4**

```powershell
git add -- src/features/resident/community 'src/app/(resident)/(tabs)/community.tsx'
git commit -m "feat(app): build resident community screen"
```

---

### Task 5: Resident More catalog and five-tab navigation

**Files:**

- Create: `src/features/resident/more/resident-more-screen.tsx`
- Create: `src/features/resident/more/resident-more-screen.test.tsx`
- Modify: `src/app/(resident)/(tabs)/more.tsx`
- Modify: `src/app/(resident)/(tabs)/_layout.tsx`
- Modify: `src/testing/navigation-contract.test.ts`

**Interfaces:**

- Consumes: catalog filters/groups, feedback sheet, shared cards, and `RoleSwitcher`.
- Produces: `ResidentMoreScreen` and the final Resident tab contract.

- [ ] **Step 1: Write failing More and navigation tests**

```tsx
expect(screen.getByText("Daily priorities")).toBeTruthy();
expect(screen.getByText("Community & shared life")).toBeTruthy();
expect(screen.getByText("Governance & records")).toBeTruthy();
expect(screen.getByRole("button", { name: "My Bills" })).toBeTruthy();
expect(screen.getByRole("button", { name: "Resident Directory" })).toBeTruthy();
expect(screen.queryByRole("button", { name: "Move-In / Out" })).toBeNull();
expect(screen.getByRole("button", { name: "Switch to Guard" })).toBeTruthy();
```

Rerender with `tenant:membership.read` added and assert Move-In / Out appears. Press My Bills and expect Bills navigation. Press Document Vault and expect the feedback sheet.

Render with an empty permission list and assert “No Resident services are available for this account.” while the RoleSwitcher remains available.

In `navigation-contract.test.ts`, set:

```ts
const residentLabels = ["Home", "Visitors", "Community", "Bills", "More"];
```

Add an order check that extracts each `title: "Label"` index and expects ascending indices.

- [ ] **Step 2: Run tests and verify RED**

```powershell
npm test -- --runTestsByPath src/features/resident/more/resident-more-screen.test.tsx src/testing/navigation-contract.test.ts
```

Expected: FAIL because More is a placeholder and Community is absent from tabs.

- [ ] **Step 3: Implement and mount More**

Filter and group modules from authenticated bootstrap permissions. Render one scroll view containing society header, “All Resident services,” grouped `ResidentContentCard` rows, `RoleSwitcher`, feedback sheet, and bottom clearance. Route modules with `mobileRoute`; show feedback for all others. When no groups remain, render “No Resident services are available for this account.” Wire header controls to the same truthful native alerts used by Home and Community.

Mount with:

```tsx
import { ResidentMoreScreen } from "@/features/resident/more/resident-more-screen";
export default function ResidentMoreRoute() { return <ResidentMoreScreen />; }
```

- [ ] **Step 4: Style five Resident tabs**

Use this ordered configuration:

```tsx
const tabs = [
  { name: "index", title: "Home", icon: "home-outline", activeIcon: "home" },
  { name: "visitors", title: "Visitors", icon: "people-outline", activeIcon: "people" },
  { name: "community", title: "Community", icon: "chatbubbles-outline", activeIcon: "chatbubbles" },
  { name: "bills", title: "Bills", icon: "card-outline", activeIcon: "card" },
  { name: "more", title: "More", icon: "grid-outline", activeIcon: "grid" },
] as const;
```

Render `Tabs.Screen` entries in that order. Use orange active tint, muted inactive tint, white background, 62px height, 9px labels, a neutral top border, and icon plus text selection.

- [ ] **Step 5: Run focused tests and typecheck**

```powershell
npm test -- --runTestsByPath src/features/resident/more/resident-more-screen.test.tsx src/testing/navigation-contract.test.ts
npm run typecheck
```

Expected: both suites PASS and TypeScript exit 0.

- [ ] **Step 6: Commit Task 5**

```powershell
git add -- src/features/resident/more 'src/app/(resident)/(tabs)/more.tsx' 'src/app/(resident)/(tabs)/_layout.tsx' src/testing/navigation-contract.test.ts
git commit -m "feat(app): expose resident service catalog"
```

---

### Task 6: Full verification and visual fidelity pass

**Files:**

- Modify only files introduced or modified by Tasks 1–5 when a verification command exposes an in-scope defect.

**Interfaces:**

- Consumes: completed Resident catalog and screens.
- Produces: verified UI with no known in-scope regressions.

- [ ] **Step 1: Run all Resident-focused tests**

```powershell
npm test -- --runTestsByPath src/features/resident/catalog/resident-module-catalog.test.ts src/features/resident/shared/resident-feedback-sheet.test.tsx src/features/resident/home/resident-home-screen.test.tsx src/features/resident/community/resident-community-screen.test.tsx src/features/resident/more/resident-more-screen.test.tsx src/testing/navigation-contract.test.ts src/platform/auth/development-demo-auth.test.ts
```

Expected: all listed suites PASS with zero failures.

- [ ] **Step 2: Run complete automated gates**

```powershell
npm test
npm run typecheck
npm run lint
npm run bundle:check
```

Expected: each command exits 0. For any failure, record the exact output, add a focused regression when behavior is wrong, fix only in-scope code, then rerun the complete gate.

- [ ] **Step 3: Run and inspect the web preview**

```powershell
npm run web
```

Use the existing development demo credentials. Inspect at approximately 390×844 and at 320px width. Confirm the compact header alignment, four-column Home grid, five-column Community grid, two-line labels without clipping, consistent card edges, five-item tab bar, modal fit, and complete bottom-of-scroll content.

- [ ] **Step 4: Verify repository scope**

```powershell
git status --short
git diff --check
git diff --stat HEAD~5..HEAD
```

Expected: no `.superpowers/`, ReManageSociety, or unrelated files in commits or working changes.

- [ ] **Step 5: Commit visual corrections only when required**

```powershell
git add -- src/features/resident src/platform/theme/tokens.ts 'src/app/(resident)/(tabs)'
git commit -m "fix(app): refine resident dashboard fidelity"
```

Do not create an empty commit when visual inspection required no source changes.

- [ ] **Step 6: Review final evidence**

Re-read `docs/superpowers/specs/2026-07-22-resident-home-community-design.md`. Verify every acceptance criterion against the implementation, focused/full test output, lint, typecheck, bundle export, and inspected viewports. Report exact pass counts, commands, commits, and any unrelated baseline failure.
