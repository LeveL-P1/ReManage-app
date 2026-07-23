# Resident Bills Mobile Design

**Status:** Approved to implement directly in the main ReManage app directory.

## Purpose

Replace the Resident Bills placeholder with a payment-focused ReManage screen that carries the visual rhythm of the supplied society-payments reference: compact society header, spacious white payment card, clear amount hierarchy, and a prominent yellow primary action. It must not copy advertising, proprietary illustrations, brand marks, or claim that a payment was processed.

## Scope

- Keep the five-tab Resident navigation unchanged.
- Preserve the shared Home, Visitors, and Community header, warm canvas, typography, rounded-card geometry, and bottom-tab behavior.
- Use deterministic fixture data only. Bills data is explicitly a mobile preview until live finance APIs are wired.
- Add static Bills pop-out routes for Pay Now, invoices, payment history, payment help, and the listed invoice.
- Do not touch `app.json`, `package.json`, or `package-lock.json`.

## Bills tab composition

1. Existing society header above the scrollable feed.
2. `My Bills` title with a compact outlined `View invoices` action.
3. Full-width dues card: small `CURRENT DUES` eyebrow, current amount, due-date copy, and a yellow `Pay now` button with a receipt icon.
4. Four-column quick-actions row: `Pay dues`, `Invoices`, `History`, and `Payment Help`.
5. `Latest invoice` white card with bill period, amount, due date, and a status pill.
6. `Payment activity` card showing fixture-backed receipt and reminder activity.
7. `Payments made simpler` compact informational card and a calm up-to-date ending.

## Data and navigation

`ResidentBillsScreen` composes the tab. `resident-bills-fixtures.ts` owns deterministic dues, invoice, and activity view models. `resident-bills-feature-catalog.ts` owns static action metadata and routes:

- `/(resident)/bills/pay-now`
- `/(resident)/bills/invoices`
- `/(resident)/bills/history`
- `/(resident)/bills/help`
- `/(resident)/bills/july-2026`

Pop-outs render focused, accessible informational screens with a back affordance. The primary payment action clearly states that no live payment is created in this preview.

## Verification

- Test fixture/catalog routes before production code exists.
- Test the Bills screen’s required visual inventory and action navigation.
- Test the shared Bills pop-out dismissal behavior.
- Run focused Bills tests, the full suite, typecheck, lint, and Expo bundle export after implementation.
