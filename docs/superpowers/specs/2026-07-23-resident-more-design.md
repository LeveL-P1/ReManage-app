# Resident More Mobile Design

**Status:** Approved direction carried forward from the resident tab sequence; implement directly in the main ReManage app directory.

## Purpose

Turn the existing permission-filtered Resident catalog into the final high-fidelity bottom tab. The screen should feel like the account-and-services endpoint of the resident app: compact society header, a clear personal/home summary, grouped service rows, and a contained account section at the end. It follows the established Home, Visitors, Community, and Bills palette, spacing, typography, rounded-card geometry, and bottom navigation.

## Scope

- Keep the five-tab Resident navigation and existing active-session permission filtering.
- Preserve all currently permitted ReManage services from `RESIDENT_MODULES`; no Resident feature is removed or made visible without its required permission.
- Replace the generic full-page catalog treatment with an account summary and grouped, card-based service hub.
- Give each More service its own static Expo Router pop-out route. Pop-outs are truthful fixture-backed previews, with no network calls, mutations, or claim that a request was submitted.
- Keep the approved-role switcher available in a dedicated account section.
- Do not modify `app.json`, `package.json`, or `package-lock.json`.

## Screen composition

1. The shared society header fixed above the feed.
2. `More` title and concise service copy.
3. A white home-profile card showing the active unit, society name, member status, and a compact `Account` affordance.
4. Permission-filtered services grouped as `Daily priorities`, `Community & shared life`, and `Governance & records`. Each service is a full-width white row with a teal icon tile, description, and chevron.
5. A small `Account & access` section with the role switcher and a `Need help?` support card.
6. A calm footer that makes the bottom of the long catalog intentional.

## Navigation and data

`ResidentMoreScreen` continues to read the authenticated Resident bootstrap and uses `filterResidentModules` and `groupResidentModules`. A typed More feature catalog maps every non-tab service to a static route under `/(resident)/more/`; `My Bills` and `My Visitors` continue going to their main tabs. Dedicated wrapper routes invoke one reusable pop-out component with an explicit back action.

Each pop-out explains the selected service, presents three fixture-backed capabilities, and labels the action as a preview or coming-soon handoff. No dynamic URL parameters are used.

## Accessibility and verification

- Preserve accessible headings and descriptive button names for service rows, account actions, and the back affordance.
- Continue hiding modules when their permission is absent.
- Test the required More screen inventory, permission filtering, tab navigation, static feature route catalog, and pop-out behavior.
- Run focused More tests, the full suite, TypeScript, lint, and Expo bundle export before review.
