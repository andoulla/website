# Home page density — plan

Feedback: the home page (Resume view) shows too much information at once. Current stack per
card (`src/views/resume/timelineEventCard/TimelineEventCard.tsx`): header (company/title/
location/dates) → responsibilities bullets → tech-stack line → key-skills tag walls grouped by
category + "View this role's skills on the graph" button → recommendations grid (1–2 cols).
Every card is fully expanded; nothing is deferred.

All decisions are resolved (Decided 1–4 below). Suggested order: density plumbing first,
then A+E card collapse, then the F2 compact skills wall (it depends on the density flag).

## Progress

- [x] 1. Density plumbing — theme-level `density` + floating Compact switch (Decided 2)
- [ ] 2. A+E card collapse by recency (Decided 1, 4)
- [ ] 3. F2 compact skills wall (Decided 3)
- [ ] 4. Density audit of Skills and Articles surfaces (Decided 2 follow-up)

## Decided 1 — A+E: progressive disclosure by section and by recency

One expand mechanism (MUI `Collapse`), two triggers:

- **Recent roles** = roles active within the last decade (`event.endDate === null` or
  `endDate` within 10 years of today — derived from dates, not a fixed item count): render
  header + responsibilities by default; tech stack, key skills, and recommendations sit
  behind a per-card "Show more". Derivation lives in a small pure util (`src/utils/`, e.g.
  `isRecentEvent(event, now)`) so it's testable.
- **Older roles**: render the bare form (`TimelineEventCard.tsx:161-171` `isBare` branch) with
  a "Show details" expander revealing the full card.
- **Deep links** (`?skill=`, `?recommendation=`) must auto-expand the matched card: `isMatch`
  is already computed at `TimelineEventCard.tsx:82-85` — initialise the expanded state from it
  so the existing `scrollIntoView` (`:97-107`) lands on visible content.
- Files: `TimelineEventCard.tsx` (+ constants/tests); `Resume.tsx` passes a recency flag
  (it already passes `startInView={index === 0}` at `Resume.tsx:109` — same shape).

## Decided 2 — density toggle: Compact vs Comfortable (current = larger font)

Established pattern ("density settings"): Cloudscape, Material, and Salesforce Lightning all
ship a comfortable/compact toggle — preference persisted, margins kept generous when dense,
touch targets ≥ ~44px.

- **Compact is the default** (user's call; pattern guidance prefers comfortable-default —
  mitigated by the persisted one-click switch). Comfortable = the current layout as the
  larger-font mode.
- **App-wide**: density is theme-level, so it cascades to Skills and Articles; audit each
  page after wiring (Skills table is already `size="small"` — check row padding; Articles
  tile padding/typography; `SkillsBarChart` `BAR_HEIGHT` may warrant a density-aware
  constant).

Implementation sketch:

- Extend `ThemeContextProvider` (after ux-fixes item 1 lands, reusing its localStorage
  helpers) with `density: 'comfortable' | 'compact'` + `toggleDensity`; persist like the
  theme, default `'compact'`. Theme factories `createGreenTheme(mode)` /
  `createPurpleTheme(mode)` gain a density argument; compact shrinks the typography scale
  (current sizes become the Comfortable "larger font" mode), spacing unit, chip size, and
  card padding.
- Toggle UI: **floating button at the top of every page, just below the NavBar** (user's
  call — not in the settings menu, and must not push page headers down). Own component
  `src/components/densityToggle/`, mounted once in `App.tsx` inside a `position: relative`
  wrapper around `<Routes>`; absolutely positioned top-right. Control is a small MUI
  `Switch` labelled "Compact" (checked = compact, on by default), tooltip explains the
  comfortable alternative.
- Compact mode composes with A+E: collapsed-by-default cards + denser type.
- References: Cloudscape density settings pattern
  (https://cloudscape.design/patterns/general/density-settings/), Material "Applying density"
  (https://m2.material.io/design/layout/applying-density.html), Salesforce Lightning density
  settings (https://developer.salesforce.com/blogs/2018/08/new-density-settings-for-the-lightning-experience-ui-in-winter-19).

## Decided 3 — skills wall condenses via F2 (caption line) in compact mode

The grouped tag walls (`TimelineEventCard.tsx:226-259`) are a big block per card. In compact
mode, replace the chips with a caption-style comma list per category, mirroring the Tech
Stack line treatment (`:206-221`) and keeping the category link + colour. Comfortable mode
keeps the current chips.

**Deep-linking impact: none, provided each name renders as an inline `Link
component="button"`** — outbound navigation is handler-based, not chip-based
(`handleSkillClick` → `/skills?skill=…`, `handleCategoryClick` → `/skills?category=…`,
`TimelineEventCard.tsx:109-125`), so the same handlers attach to text links. Inbound
`?skill=` highlighting is card-level (outline via `isMatch`, `:82-85`), not per-chip, so it
also survives. Subcategories were never linked from resume cards (only category + skill), so
nothing is lost there.

## Decided 4 — expand state is ephemeral

Per-card expand/collapse state is React state only: no URL param, no storage. Deep links
auto-expand a target card, and restored stale state would leave other cards open for the user
to close.
