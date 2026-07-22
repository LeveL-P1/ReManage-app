# Resident Home and Community Mobile Design

**Date:** 2026-07-22

**Status:** Approved conversational design; awaiting written-spec review

**Mobile repository:** `C:\Users\pawan\Projects\ReManage-app`

**Web/backend source:** `C:\Users\pawan\Projects\ReManageSociety`

## 1. Purpose

Replace the Resident placeholder experience in the ReManage Expo application with a polished Home screen, a dedicated Community screen, and a complete Resident module catalog. The visual composition should feel recognizably close to the supplied MyGate reference screenshots while using ReManage branding, ReManageSociety feature names, original content, and royalty-free icons.

This phase is a fixture-backed mobile UI implementation. It establishes trustworthy navigation, permission filtering, reusable presentation components, and clear feedback for modules whose mobile workflows are not implemented yet. It does not add feature APIs or pretend that unavailable backend mutations succeeded.

## 2. Approved scope

This phase delivers:

- A polished Resident Home screen from top to bottom.
- A polished Resident Community screen from top to bottom.
- A fifth Resident bottom tab for Community.
- A redesigned Resident More screen containing the complete permission-filtered Resident catalog.
- Reusable Resident UI components and typed fixture data.
- Real navigation for existing mobile destinations.
- Consistent demo feedback for unfinished module destinations.
- Tests for permission filtering, navigation, layout contracts, interactions, and accessibility labels.

The implementation represents all Resident-facing ReManageSociety modules in the mobile information architecture, but only Home, Community, and More receive complete screen implementations in this phase.

## 3. Non-goals

- Implementing every ReManageSociety workflow end to end.
- Adding or changing ReManageSociety backend endpoints.
- Simulating successful payments, visitor approvals, complaints, posts, bookings, votes, or emergency delivery.
- Copying MyGate advertisements, logos, illustrations, text, or proprietary assets.
- Adding committee, treasurer, platform-admin, or guard modules to the Resident catalog.
- Reworking the existing authentication or role-switch architecture.
- Changing the Guard navigation shell.

## 4. Source-of-truth alignment

The Resident module inventory is derived from the current ReManageSociety sources:

- `packages/ux-core/src/index.ts` for navigation definitions and quick actions.
- `packages/security/src/permission-policy.ts` for Resident permissions.
- `src/app/(dashboard)/dashboard/page.tsx` for the current Resident dashboard priorities and quick-access modules.
- `src/lib/navigation/legacy-role-bridge.ts` for role-to-permission behavior.
- `src/lib/navigation/use-persona-nav.ts` for existing Resident bottom-navigation priorities.

The mobile implementation owns a local, typed presentation catalog rather than importing web code. Catalog entries preserve the web product's labels, permission identifiers, and intent while using mobile route identifiers and mobile-safe presentation metadata.

## 5. Navigation model

The Resident bottom navigation becomes:

1. Home
2. Visitors
3. Community
4. Bills
5. More

Community is inserted between Visitors and Bills. Existing Visitors, Bills, and More route groups remain role-isolated. The navigation test must continue proving that Resident routes cannot mount Guard screens and Guard routes cannot mount Resident screens.

Home, Community, and More use the active authenticated Resident bootstrap. The screens do not accept a role through URL parameters and do not create a combined Resident/Guard dashboard.

## 6. Visual direction

### 6.1 Reference fidelity

The approved direction is “Balanced ReManage” with high visual fidelity to the supplied MyGate screenshots:

- Compact society-and-flat header with search, notifications, and profile actions.
- Warm neutral canvas.
- Large rounded white content cards.
- Square rounded icon buttons with labels underneath.
- Four action columns on Home.
- Five action columns in the Community action grid.
- Dense but readable vertical spacing.
- Bold system typography comparable to the references.
- Fixed five-item bottom navigation.
- Prominent section headings with compact trailing actions.
- Consistent left edges, card padding, grid gaps, and baseline alignment.

The implementation must not be a pixel-for-pixel copy. ReManage colors, text, module hierarchy, and iconography remain distinct.

### 6.2 Brand tokens

The existing Resident palette remains authoritative:

- Cream: `#FEFDDF`
- Orange: `#FF5400`
- Yellow: `#FFBE00`
- Charcoal: `#333333`
- White: `#FFFFFF`

The screen may add named neutral surface and muted-text tokens derived for this feature, but it must not replace the locked ReManage palette.

### 6.3 Typography and geometry

- Use platform system typography on Android and iOS.
- Section titles use bold or heavy system weight and clear hierarchy.
- Secondary text remains readable and does not drop below an accessible mobile size.
- Interactive targets are at least 44 by 44 logical pixels.
- Cards use approximately 16 to 24 logical-pixel radii depending on hierarchy.
- Icon tiles are consistent squares with centered line icons.
- Labels may wrap to two lines when necessary; important module names must not be silently truncated.
- Content respects safe-area and bottom-tab insets.

### 6.4 Icons and assets

Use royalty-free, open-source line icons from the Expo-compatible icon ecosystem. Add the icon package as a direct dependency if it is imported directly. No network-fetched runtime artwork is required for this phase.

## 7. Resident Home screen

The Home scroll sequence is:

1. Society header
2. Resident summary hero
3. Quick Actions
4. Today summary
5. Outstanding dues card
6. Recent activity
7. Community preview
8. Recent notice or post preview
9. Bottom content clearance

### 7.1 Header

The compact header shows:

- Flat or unit identifier
- Society name
- Search action
- Notification action
- Resident profile action

Actions are accessible and pressable. Search, notifications, and profile use clear demo feedback unless an existing destination is available.

### 7.2 Hero

The hero communicates the day's status without advertising. It uses a charcoal ReManage surface, cream text, and a yellow status accent. It may contain a greeting, society context, and a concise “all clear” or priority message from fixtures.

### 7.3 Genuine ReManage quick actions

The four Home quick actions mirror the ReManageSociety quick-action catalog:

- Pay bill
- Approve visitor
- Raise complaint
- Raise SOS

Pay bill opens Bills. Approve visitor opens Visitors. Raise complaint and Raise SOS open the shared unfinished-module feedback surface in this phase.

### 7.4 Today summary and priority cards

The summary shows fixture-backed counts for Visitors, Parcels, and Outstanding dues. The following cards use ReManage content:

- Outstanding maintenance due
- Visitor approval or arrival activity
- Parcel arrival activity
- Recent announcement
- Community event or discussion preview

All values are explicitly demo fixtures and cannot be interpreted as live society data.

## 8. Resident Community screen

The Community scroll sequence is:

1. Society header
2. Community summary statistics
3. Community Actions
4. Happening Nearby
5. Find Your Circle
6. Safety and support
7. Governance highlights
8. Society dues reminder
9. Membership tenure
10. Bottom content clearance

### 8.1 Community Actions grid

The primary action grid uses five columns and MyGate-like square buttons. It includes:

- Helpdesk
- Announcements
- Discussion Forum
- Events & Calendar
- Amenity Booking
- Resident Directory
- Staff & Daily Help
- Buy & Sell
- Parking
- More

The More action opens the complete Resident catalog rather than expanding an uncontrolled inline list.

### 8.2 Community content sections

- Happening Nearby shows an event fixture and a host-activity prompt.
- Find Your Circle exposes Resident Directory and Staff & Daily Help without inventing personal data.
- Safety and support exposes Raise SOS and a non-emergency security-support prompt.
- Governance highlights expose Meetings, Polls & Voting, and Document Vault.
- Society dues link to Bills.
- Membership tenure is fixture-backed informational copy.

## 9. Resident More screen and complete module catalog

More becomes a grouped Resident catalog plus the existing role switcher. It presents only entries allowed by the active bootstrap permissions.

### 9.1 Home and daily priorities

- My Bills
- My Visitors
- Helpdesk
- SOS & Safety
- Announcements
- Parcel Desk

### 9.2 Community and shared life

- Discussion Forum
- Events & Calendar
- Amenity Booking
- Buy & Sell
- Parking
- Resident Directory
- Staff & Daily Help

### 9.3 Governance and records

- Society NOC
- Meetings
- Polls & Voting
- Document Vault

### 9.4 Permission-dependent items

- Move-In / Out appears only when the bootstrap includes its required permission.

The catalog does not expose management, finance-administration, committee, treasurer, platform, or Guard destinations to Resident users.

## 10. Module catalog and permission filtering

Create one typed Resident module catalog. Each entry includes:

- Stable module ID
- ReManage display label
- Short description
- Icon key
- Presentation group
- Required permission identifiers
- Optional implemented mobile route
- Optional home/community placement metadata

Filtering rules:

1. Read permissions from the authenticated Resident bootstrap.
2. Keep a module when any configured required permission is present, matching the existing ReManageSociety navigation policy semantics.
3. Hide modules with no satisfied permission.
4. Never treat a local tile press as authorization.
5. Real backend endpoints must continue performing server authorization when those workflows are implemented.

The development web-preview bootstrap must include the authentic Resident permission set required to demonstrate the approved catalog. It must remain Resident-scoped and must not acquire management or Guard permissions.

## 11. Data model and fixtures

Typed fixture data supplies:

- Resident and society display context
- Hero status
- Visitor count
- Parcel count
- Outstanding dues
- Recent activity
- Announcements
- Community event
- Discussion preview
- Directory completion summary
- Membership tenure

Fixture values live outside presentation components. Components consume view models so future `/api/mobile/v1/resident/*` responses can replace fixtures without restructuring the screens.

Fixture data is deterministic for tests. It contains no copied MyGate advertising, private user data, or implication that an actual payment, approval, or emergency request occurred.

## 12. Reusable component boundaries

Create focused components for:

- Resident society header
- Section heading
- Quick-action grid and tile
- Summary-stat row
- Content/action card
- Module catalog section and row
- Unfinished-module feedback sheet

Home and Community own their screen composition. More owns the grouped catalog composition. Shared components contain presentation and interaction contracts but no role-specific permission decisions beyond receiving already-filtered module data.

Files should remain small enough to understand independently. Do not replace the existing `ResidentShellScreen` until Visitors and Bills no longer depend on it.

## 13. Interaction behavior

### 13.1 Implemented destinations

- Home tab opens Home.
- Visitors tab and visitor actions open Visitors.
- Community tab opens Community.
- Bills tab and bill actions open Bills.
- More and Community's More action open More.

### 13.2 Unfinished destinations

Pressing an unfinished module opens one consistent accessible feedback sheet. The sheet contains:

- Module name
- Short ReManage description
- Clear statement that the mobile workflow is coming in a later phase
- Dismiss action

It does not display success language, fake records, or a disabled-looking dead control.

### 13.3 Press states

- Every interactive tile and card has visible pressed feedback.
- Icon-only header controls have accessibility labels.
- The active tab is indicated by icon, label, and color rather than color alone.
- Long content remains scrollable and is not obscured by the bottom tab bar.

## 14. Loading, error, and empty behavior

This phase uses synchronous fixtures, so it does not introduce network loading or retry flows. It must still avoid fragile rendering:

- Empty fixture lists render concise empty-state cards.
- Missing optional text is omitted without leaving broken spacing.
- Missing permissions remove the module before layout.
- Unsupported action IDs fail safely through the shared feedback surface during development rather than silently doing nothing.
- Existing global session restoration and recoverable-error screens remain unchanged.

## 15. Accessibility

- Use semantic headings where supported.
- Provide accessibility roles and labels for buttons, icon-only actions, cards, tabs, and the modal sheet.
- Maintain at least 44 by 44 logical-pixel targets.
- Support platform text scaling without clipped primary labels.
- Do not rely on color alone for selection, urgency, or availability.
- Keep screen-reader order aligned with visual order.
- Respect safe-area and bottom-navigation insets.

## 16. Testing strategy

### 16.1 Unit tests

- Resident module catalog contains the approved ReManage modules.
- Permission filtering includes allowed Resident modules.
- Permission filtering excludes unavailable, committee-only, and Guard modules.
- Move-In / Out appears only when its required permission exists.
- Fixture data conforms to the declared view-model types.
- Development demo bootstrap exposes the intended Resident permissions and no privileged permissions.

### 16.2 Component tests

- Home renders all approved sections in order.
- Community renders the five-column action inventory and approved sections.
- More renders grouped, permission-filtered modules and the role switcher.
- Implemented actions route to their existing tabs.
- Unfinished actions open the feedback sheet with the correct module content.
- Feedback sheet dismisses accessibly.
- Empty fixture lists render their empty state.

### 16.3 Navigation contract tests

- Resident bottom navigation contains Home, Visitors, Community, Bills, and More in order.
- Guard navigation remains Gate, Parcels, Incidents, and More.
- Resident sources contain no Guard routes or role query parameters.
- Guard sources contain no Resident routes.

### 16.4 Verification commands

- Focused Jest tests for the new catalog and screens
- Full `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run bundle:check`
- Visual inspection at a phone-sized viewport and a narrow web viewport

## 17. Acceptance criteria

- Home and Community visibly follow the approved MyGate-like proportions, positioning, typography, action-grid density, card radii, alignment, and bottom navigation.
- All text, branding, fixtures, icons, and module priorities are ReManage-specific.
- Home uses the four genuine ReManage Resident quick actions.
- Community uses a five-column action grid and exposes the approved community modules.
- More exposes the complete allowed Resident module catalog and keeps the role switcher.
- The module catalog is filtered by authenticated bootstrap permissions.
- Existing Visitors and Bills routes remain functional.
- Unimplemented module presses show truthful, accessible feedback.
- Resident and Guard navigation remain isolated.
- No MyGate advertisements, logos, illustrations, or proprietary assets are added.
- Focused and full verification gates pass, or any unrelated baseline failure is reported with evidence.
