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
- [x] 2. Card collapse — full body behind "Show details", first card starts expanded
     (Decided 1, 4)
- [x] 3. F2 skills wall — inline caption list in both densities (Decided 3)
- [x] 4. Slimmer recommendations — quote-strip restructure, then line-clamp (Decided 5)
- [ ] 5. Density audit of Skills and Articles surfaces (Decided 2 follow-up)
- [ ] 6. Job headlines — one-line summary per job, visible on collapsed cards (separate work,
     needs new `headline` content authored per careerHistory entry)

## Decided 1 — full card collapse; first card starts expanded

Originally A+E by recency; refined by user calls: (a) collapsed cards hide responsibilities
too; (b) only the **first card** starts expanded on load (`startExpanded={index === 0}` from
`Resume.tsx`, same shape as `startInView`) — the date-based `isRecentEvent` util is gone.

- Every non-bare card collapses its body (responsibilities, tech stack, key skills,
  recommendations) behind one "Show details"/"Hide details" `Button` (`aria-expanded`,
  chevron icon) + MUI `Collapse` (`unmountOnExit`).
- Expansion: `isExpanded = userExpanded ?? (isMatch || startExpanded)` — user toggle wins,
  deep links (`?skill=`, `?recommendation=`) and first-card default expand (derived state, no
  effect — the `react-hooks/set-state-in-effect` lint rule forbids the effect version).
- Bare cards (nothing relevant to the track) are unchanged — header only, no expander.

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

## Decided 3 — skills wall renders as F2 caption lines in BOTH densities

The grouped tag walls were a big block per card. Replace the chips with a caption-style
comma list per category, mirroring the Tech Stack line treatment and keeping the category
link + colour (skill links tinted via `resolveSkillColourMain(categoryColourFromIndex(i))`).
Originally compact-only; user then decided the caption list looks fine and should be
**consistent across compact and comfortable** — chips are gone from resume cards entirely,
and the card no longer reads the density context.

Key skills additionally sit behind their **own second expander** ("Show key skills"/"Hide
key skills") inside the expanded card body: `areSkillsExpanded = userSkillsExpanded ??
hasHighlightedSkill`, so a `?skill=` deep link opens both the card and the skills section.

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

## Decided 5 — slimmer recommendations: quote-strip, then line-clamp

Recommendations feel bulky (card-in-card chrome: outlined `Card` + grey fill + avatar +
`CardActionArea` + generous padding, 11 recs of 384–844 chars, max 4 per job). Two stages,
in order — the clamp needs the restructure first because a toggle can't nest inside the
current whole-card `CardActionArea` link:

1. **Quote-strip restructure** (`RecommendationText.tsx` + `recommendationByline/`):
   drop `Card`/`CardActionArea`/avatar/hover-lift; render `Box component="blockquote"` with
   `borderLeft` (2–3px, primary), `pl: 1.5`, `py: 0.5`, `m: 0`. The byline (initials · role ·
   LinkedIn icon · date) becomes the outbound `Link` (`target="_blank"`). Keep
   `id={recommendationElementId(...)}` on the blockquote; highlight becomes
   `bgcolor: alpha(primary, 0.08)` + stronger left border (scroll logic in
   `TimelineEventCard.tsx` untouched). Grid layout in `TimelineEventCard.tsx` stays; gap → 1.
2. **Line-clamp with inline "More/Less" toggle** (subagent-vetted): clamp quote text to
   3 lines (compact) / 4 (comfortable) via `display: '-webkit-box'`, `WebkitLineClamp`,
   `WebkitBoxOrient: 'vertical'`, `overflow: 'hidden'`. Reveal = small text `Button` with
   `aria-expanded`, derived state `isClamped = !(userExpanded ?? isHighlighted)` (no
   effects — mirrors the card pattern), so `?recommendation=` deep links auto-unclamp and
   the user toggle wins. Clamp is visual-only: screen readers always get the full text.
   All 11 quotes (384–844 chars) will clamp; LinkedIn can't substitute (all recs share one
   generic URL). Optional later guard: show the toggle only when `text.length > ~200`
   (char-count constant — never a `scrollHeight` effect, the setState-in-effect lint rule
   forbids it). Rejected: click-anywhere quote (a11y/selection issues), dialog (modal for a
   paragraph, hostile on deep link).
