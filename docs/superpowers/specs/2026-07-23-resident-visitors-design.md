# Resident Visitors Mobile Design

**Status:** Approved for implementation

## Purpose

Replace the Resident Visitors placeholder with the next high-fidelity ReManage screen. It follows the approved MyGate-inspired composition without copying advertising, branding, imagery, or proprietary content.

## Scope

- Keep the fixed five-tab Resident navigation unchanged.
- Use the same persistent society header, warm neutral canvas, white rounded cards, teal line icons, 16 px gutters, and compact system typography as the approved Home and Community screens.
- Build an arrival-first Visitors feed: visitor summary, visitor actions, expected visits, recent visitor activity, and a calm end state.
- Add stack pop-outs for every new Visitors action. They use honest fixture-backed copy and must not imply a real guest invitation or approval was submitted.
- Do not add APIs, network calls, mutations, advertisements, or native-only dependencies.

## Screen composition

1. The existing society header, above the scrollable feed.
2. A `Visitors` section header with a compact outlined `Pre-Approve` action at the trailing edge.
3. A full-width status card labelled `Today’s visitor updates`; it summarizes expected arrivals, pending approvals, and a clear `View all` affordance.
4. A four-column `Quick visitor actions` row: `Pre-Approve`, `Invite Guest`, `Daily Help`, and `Visitor History`.
5. An `Expected today` list of fixture-backed visitor cards showing name, visit context, expected time, and a readable status pill.
6. A `Recent activity` list with the last entry outcomes.
7. A compact, original caught-up state that gives the screen a deliberate end rather than leaving blank space.

## Navigation and data

`ResidentVisitorsScreen` owns the tab composition. A typed fixture file provides summary, expected-visitor, and history data. A typed feature catalog maps action IDs to static Expo Router routes. Every press targets a resident stack route:

- `/visitors/pre-approve`
- `/visitors/invite-guest`
- `/visitors/daily-help`
- `/visitors/history`
- `/visitors/updates`
- `/visitors/:visitorId`

Each route renders one focused pop-out with a back affordance, concise explanatory copy, and an explicit demo/coming-soon action where appropriate.

## Accessibility and verification

- All icon-only buttons and cards expose accessible roles and descriptive names.
- Buttons remain at least 44 logical pixels where practical.
- Status uses text and an icon/color treatment, not color alone.
- Component tests prove the approved visual inventory renders and presses navigate to each static destination.
- The focused Visitors tests must be written and observed failing before the production screen is added.

## Constraints

- Preserve the Home/Community worktree changes and leave all changes uncommitted.
- Reuse the existing Expo Router and `@expo/vector-icons` dependencies.
- No MyGate ads, logos, copied visual assets, or placeholder ad slots.
