# ReManage — Design → Code Handoff

Handoff for building the redesigned screens into the **ReManage-app** Expo (React Native + TypeScript) codebase.

## What you're building from

Three HTML prototypes (visual references only — do **not** copy their markup/runtime):

| File | Contents |
| --- | --- |
| `design/ReManage Prototype.dc.html` | **Resident** interactive app — Home, Bills, Community (Posts), Visitors, Notifications inbox, Amenities, Notices, + pre-approve / new-post sheets |
| `design/ReManage Guard Prototype.dc.html` | **Guard** interactive app — Gate console, Parcels, Entry log, My shift, + add-visitor (notify) sheet |
| `design/ReManage Screens.dc.html` | Static option board (turns 1–5): notification inbox, settings, push, bills, visitors, SOS, guard console (light + dark night-shift), helpdesk, amenity, community, notices |

Ignore `support.js`, `<helmet>`, `<x-import>`, `data-*` handlers — that's prototype plumbing. Read only the **inline-styled markup** for structure, spacing, color and icon choices.

## Ground rules

1. **Reuse existing tokens.** Every color in the prototypes maps to `src/platform/theme/tokens.ts`. Never hardcode hex — import from tokens. Add a token only if the value below is missing.
2. **Icons:** the prototypes draw inline SVGs; in RN use **Ionicons** (`@expo/vector-icons`), the app's existing set. Mapping table per screen below.
3. **Match layout, spacing, radii, type weight** to the prototype. Cards are radius 18–22, pills 999, hairline borders `#efece4` on cream.
4. Build screens under the existing feature folders; follow the patterns in the neighbouring `*-screen.tsx` files (shell, SectionList, `resident-ui.tsx` primitives).

## Token map (prototype hex → tokens.ts)

| Prototype value | Token | Use |
| --- | --- | --- |
| `#fefddf` / `#faf8f2` | `cream` / surface | screen background |
| `#ff5400` | `primary` | accent, CTAs, active tab |
| `#ffbe00` | (amber) | community / warnings |
| `#1c1a17` | text/ink | headings, dark buttons |
| `#8a8377` / `#a89f90` | muted | secondary text, kickers |
| `#efece4` | border | card hairline |
| `#fff5ef` / `#f6e6da` | primarySoft-ish | unread / at-gate tint |
| `#17915a` / `#e8f5ee` | success | paid, handed-over |
| `#d3341f` / `#fdeceb` | danger | SOS, decline |
| `#2b7fd4` / `#e9f2fd` | info | visitor avatars |

> Verify each against `tokens.ts` before adding; several already exist (`primary`, `primarySoft`, `secondary`, `cream`).

## Screen-by-screen

### RESIDENT — `src/features/resident/`

**Home** (`home/resident-home-screen.tsx` — extend existing)
- Greeting header + bell w/ unread badge (badge count from notifications store).
- "At your gate" approval card (primary-soft tint): Approve = primary fill, Decline = ghost + danger X. Approve/decline removes card, decrements bell badge.
- Dues card: primary gradient, tap → Bills tab.
- Quick-action grid 3×2: Visitors, Bills, Community, Amenities, Notices, SOS (SOS = danger-tint tile).
- Recent notice row.

**Bills** (`bills/bills-screen.tsx` — extend)
- Primary-gradient balance hero: total due, due-date pill, Pay button.
- Breakdown card (maintenance / water / late fee, late fee in danger).
- Pay method rows (UPI selected = 2px primary border + check; card unselected).
- Paid history rows (success check icon).
- Pay success = hero flips to green confirmation.

**Community / Posts** (new: `posts/`)
- Compose prompt row → opens new-post sheet (category chips + message).
- Post cards: avatar initials, name · flat, time, category tag, body, like (toggles primary) + comment counts.

**Visitors** (`visitors/`)
- Segmented: At gate / Expected / History.
- At-gate: live "waiting" card (Approve / decline). Empty state when none: house icon + "No one at the gate".
- Expected: guest card w/ passcode, Share pass / Cancel.
- Pre-approve (+ button) → bottom sheet: type chips (Guest/Delivery/Cab/Help), name, date, arrives, Generate pass.

**Notifications** (`home/resident-notifications-screen.tsx` — extend)
- Filter pills All / Unread N.
- Grouped SectionList Today / Earlier.
- Rows: category-colored icon tile, title (bold name), body, dot for unread, unread rows on primary-soft tint. Inline Approve/Pay on actionable rows.
- Mark all read clears dots + tint + badge.

**Notification settings** (new)
- Category switches (Visitors, Bills, Security **locked on**, Community, Notices).
- Delivery: Push, Email digest, Quiet hours (10pm–7am) row.
- Footnote: SOS always comes through.

**Amenities** (`amenities/`) — clubhouse hero, date row, selectable slot chips (one active = primary; disabled = strikethrough), price summary, Book & pay.

**Notices** (`notices/`) — Pinned section (primary-soft), then This week cards w/ dept-colored icon.

**SOS** (new, dark screen `#1c1614`) — hold-to-alert circular button (danger radial + pulse rings), share-live-location toggle, quick-call tiles (Gate/Ambulance/Fire).

### GUARD — `src/features/guard/`

**Gate console** (`gate/guard-gate-screen.tsx` — extend)
- Header: Gate 2 + GUARD badge, guard name + shift end, bell.
- Add visitor (primary) / Scan QR (white) action pair.
- "Awaiting resident" card → resolves to Approved when resident approves (listen to visitor status).
- "Inside now" list with dwell time.
- Add-visitor sheet = verify flow → "Notify resident" (push to resident's 1a/1c).
- **Night-shift dark variant** exists in `ReManage Screens.dc.html` #5a (`#16130f` ground, warm accents kept) — gate by time-of-day or a theme flag.

**Parcels** (`parcels/`) — Held / Handed tallies; holding cards w/ Notify (→ "Notified" pill) + Handed-over (collapses card, updates counts).

**Entry log** (`log/`) — All / Inside / Exited filter; rows w/ status dot + INSIDE/EXITED.

**My shift** (`me/`) — profile, entries/on-duty stats, settings rows, End shift.

## Suggested prompts for Claude Code

Build one screen at a time:

```
Read design/ReManage Prototype.dc.html and src/platform/theme/tokens.ts.
Build the resident Home screen in src/features/resident/home/ as React Native.
Match the prototype's layout, spacing, card radii and icon choices. Use tokens
for all colors (no hex literals) and Ionicons for icons. Follow the component
patterns in resident-ui.tsx and the existing *-screen.tsx files. Wire the
Approve/Decline card to remove itself and decrement the bell badge.
```

```
Now the Bills screen (src/features/resident/bills/bills-screen.tsx), same rules.
Include the pay-success state where the balance hero flips to a green confirmation.
```

Repeat per screen. For the guard app, point at `ReManage Guard Prototype.dc.html`; for SOS / settings / night-shift, point at the numbered options in `ReManage Screens.dc.html`.

## Notes

- Prototypes use the app's **existing warm-orange theme**, not the Organic (terracotta/sage) design system attached to this design project. That's intentional — it matches your codebase. If you ever want to migrate to Organic, that's a separate reskin.
- Interactions in the prototypes (toasts, skeletons, sheet slide-ups) are demonstrations of intent — implement with your real navigation/state layer, not literally.
