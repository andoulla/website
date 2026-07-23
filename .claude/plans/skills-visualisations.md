# Skills page — five new visualisations

## Context

- `/skills` today: 3 views (Graph/Radar/Table), all from `SkillSummary` = present-day snapshot.
- Unused data in `src/data/`: `responsibility.skillIds` (co-occurrence), `skill.recommendationIds`,
  `skill.type` (dropped in `calculateSkillYears`), acquisition dates, cross-track reshuffle.
- Goal: 5 new visualisations, each surfacing a dimension the current trio can't + a one-line caption
  on **every** view.

## Features (renumbered)

1. **Co-occurrence network** — force graph of skills used together in the same bullet.
2. **Recommendation-backed skills** — `recommendationIds` as badges + header stat.
3. **Career growth curve** — cumulative unique skills over the timeline.
4. **Tech vs. soft-skill balance** — resurface `skill.type` as split meter + chips.
5. **Cross-track diff** — two tracks side by side, highlight what moves.

## Execution

- Two worktrees under `website/.claude/worktrees/`, both branched off `feat/skills-viz` (after Phase 0):
  Agent A → `skills-viz-a/` on branch `feat/skills-viz-a`; Agent B → `skills-viz-b/` on `feat/skills-viz-b`.
  Disjoint files → clean merge back into `feat/skills-viz`.
- Commit as we go (Conventional Commits).
- Verification is the user's — never run typecheck/lint/tests/dev. Walk changes one at a time.

**Phases:**

- **0 — scaffolding (serial):** shared touch-points, before agents split.
- **1 — parallel:** Agent A = feat 1+3 (new folders). Agent B = feat 2+4 (existing-view edits).
- **2 — serial:** feat 5 (restructures page shell) on merged base.

---

## Phase 0 — Scaffolding (serial, `feat/skills-viz`)

- **View enum** — `skillsUrlParams.ts`: `VIEW_MODES = [...,'network','growth']`. `ViewMode`/`parseViewMode` derive automatically.
- **View list (`VIEW_OPTIONS`) — one place per view (removes the 3-site edit):** new
  `src/views/skills/viewOptions/` → `VIEW_OPTIONS: Record<ViewMode, {icon,label,caption,Component}>`.
  Lives in the views layer (holds components/icons → can't sit in utils `skillsUrlParams`; `VIEW_MODES`
  stays there as the `ViewMode` type + URL-validation source). The typed `Record<ViewMode,…>` forces every
  view to declare all four fields → no drift when a view is added. `Skills.tsx` reads it everywhere:
  - Toggle = `.map()` over `VIEW_OPTIONS` (icon + `Tooltip` label + `aria-label`) — replaces the 3 hardcoded
    `ToggleButton`s. Icons: `HubIcon` (network), `TrendingUpIcon` (growth).
  - `renderSkillsView` = `VIEW_OPTIONS[viewMode].Component` — replaces the L50–54 if-chain.
  - Caption = `VIEW_OPTIONS[viewMode].caption`, rendered `Typography body2 text.secondary` above the view
    (no separate `VIEW_CAPTIONS`).
  - Zero-prop view components; barchart-only `showPatterns` stays a documented exception — lift it into a
    small state/context so `SkillsGraphView` reads it, keeping the map render uniform.
  - **Slimmer on mobile:** in the toggle `.map()`, tighten button padding on `xs` (via
    `'& .MuiToggleButton-root'` `px`) and drop icon size a notch on `xs`
    (`useMediaQuery(theme.breakpoints.down('sm'))`); all 5 stay visible (no wrap/menu), no 320px overflow.
  - Captions (parallel, user-value, sentence case — no mechanics like "longest bars first"):
    - barchart → "How many years I've spent on each skill"
    - radar → "Where my experience is concentrated across areas"
    - table → "Every skill grouped by area, with the companies behind it"
    - network → "Which skills I've used together, and how often"
    - growth → "How my skill set has grown across my career"
- **`SkillSummary.type` plumbing (feat 4 shared):**
  - `calculateSkillYears.types.ts`: `type: SkillType` (from `@/types`).
  - `calculateSkillYears.ts` (~L66): add `type: skill.type`.
  - `testing/SkillSummary/SkillSummary.ts` + `.data.ts`: `type(...)` setter + default.
- **Stat-bar slot (restraint — keep the control bar quiet):** the header control row is already dense
  (search + track + category filter + 5-button toggle + copy-link). Do **not** add stats there. Render a
  single quiet `SkillsStatBar` (`Stack`, `Typography caption`/`Chip`) **below the caption**; Phase 0 wires
  the empty slot + passes `skills`/`filteredSkills`. Agent B fills it with `RecommendationStat` +
  `SkillTypeMeter` (both Agent B features → no cross-agent conflict). One stat cluster, not two competing
  header widgets.
- **`careerHistory` via a separate lean context (feat 1+3; ISP + testability):** do **not** fatten
  `SkillsViewContext` — table/radar/bar don't need `careerHistory`, so adding it there leaks it to 3 views
  that ignore it. Add a small dedicated `SkillsCareerContext` exposing just `careerHistory: TimelineEvent[]`,
  provided next to `SkillsViewContextProvider` in `Skills.tsx` (already resolved from `useCareerDataContext()`),
  consumed **only** by Network + Growth via `useMemo`. Keeps the shared context lean; keeps those two views'
  tests Suspense-free (wrap in the small provider with builder mocks — they must **not** call
  `useCareerDataContext()` directly).
- **Placeholder stubs** — `skillsNetworkView/` + `skillsGrowthView/` folders (stub component + `index.ts`),
  exported from `skillsViews/index.ts`. Lets enum/toggle typecheck; agents fill internals.
- Commit, then cut 2 worktrees off this.

---

## Phase 1 — Agent A (feat 1 + 3)

### Feature 1 — Co-occurrence network

- **Data:** new `src/utils/deriveSkillCoOccurrence/`. Walks `responsibility.skillIds`; unordered pairs →
  edge weights; node weight = bullet count. Returns `{nodes:{id,weight}[], edges:{source,target,weight}[]}`.
  For colour/category/name, read the `SkillSummary` already in context (keyed by id) — **no** parallel
  skillId→category map (`deriveSkillCategoryMap` exists if ever needed).
- **Dep:** add `d3-force` + `@types/d3-force` (Recharts has no node-link chart). Reads `careerHistory` from
  `useSkillsCareerContext()` + skills/search/filters from `useSkillsViewContext()` (NOT
  `useCareerDataContext()` — keeps tests Suspense-free, see Phase 0).
- **Single responsibility (split layout from render):** extract the d3-force simulation into a pure
  `useForceLayout(nodes, edges)` hook (co-located `skillsNetworkGraph/useForceLayout.ts`) that returns
  positioned nodes/edges — fixed seed, deterministic, no DOM. The graph component stays render-only (SVG
  `<circle>`/`<line>` in a `<Box>` + hover/click/keyboard). Layout is then unit-testable without rendering.
- **UX:** node radius ∝ years; edge width ∝ weight; colour via `resolveSkillColourMain(skill.colour)`.
  Hover → neighbours full-opacity, rest dim (bar-chart idiom); click → `Popper` + `SkillTooltipContent`
  (reuse). Search dims non-matches; category filter restricts nodes. Isolated skills at periphery.
  Labels on hover / top-degree only. Legend = `derivePresentCategories` + `CategoryColourDot`.
  Folder `skillsNetworkView/skillsNetworkGraph/`.
- **Edge cases:** <2 skillIds → no edge; ids absent from track set skipped; empty filter → `SkillsEmptyState`;
  no skills → info `Alert` (mirror radar); `prefers-reduced-motion` → static final positions.
- **a11y:** `role="img"` + `aria-label`; `visuallyHidden` `<table>` (skill | co-occurring | count);
  colour not sole signal. **Keyboard-operable, not mouse-only:** nodes are focusable (`tabIndex`,
  `role="button"`, per-node `aria-label`) with Enter/Space opening the same card as click, and a visible
  focus ring — the click→`Popper` path must not be pointer-exclusive.
- **Tests:** `deriveSkillCoOccurrence.test.ts` (pair count, symmetric/dedup, ignores <2, drops unknown)
  — fixtures via `TimelineEvent`/`Responsibility` builders. `useForceLayout.test.ts` (deterministic output
  for a fixed input — every node positioned, stable across runs). `SkillsNetworkView.test.tsx`: render
  inside both providers (`SkillsViewContextProvider` skills + `SkillsCareerContext` mock `careerHistory`),
  no Suspense. Assert the accessible hidden `<table>` rows + click/keyboard→`SkillTooltipContent` popover
  (`userEvent`); do **not** assert hover opacity/SVG coords (visual/impl detail). Fold `axe` into each
  distinct-state test (populated / empty-filter / no-data), not a standalone axe test.

### Feature 3 — Career growth curve

- **Data:** new `src/utils/deriveSkillGrowth/`. Skill acquired date = earliest `startDate` of its `jobIds`;
  sort asc; cumulative unique-skill points `{date,count}`. Job markers `{date,companyName}` from events with a start date.
  View derives via `useMemo` off `careerHistory` (from `useSkillsCareerContext()`) + `skills` (from
  `useSkillsViewContext()`) — no direct careerData read (Phase 0).
  **Reuse (DRY):** skill→job membership via `trackSkillIds(track)` + an `eventById` map (same join
  `calculateSkillYears` uses) — don't re-derive; x-axis span from `deriveCareerYearRange(careerHistory, track, …, today)`
  → `{minYear,maxYear}` (don't recompute career span); axis/marker date labels via `formatDate`/`formatYears`
  (no new date formatter).
- **Recharts (no new dep):** `AreaChart`+`Area` (stepped), `XAxis`(time, domain from `deriveCareerYearRange`),
  `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `ReferenceLine` (dashed markers). Reduced-motion gates animation.
- **UX:** x = career span → today, y = cumulative skills; gradient fill; company on hover.
  **Track-scoped, filter-agnostic** (driven by `skills`, not filtered); caption states it.
  Folder `skillsGrowthView/skillsGrowthChart/`.
- **Hero note:** growth is the strongest narrative view (career trajectory). Stays a toggle button per the
  earlier decision, but consider making it the **default** `viewMode` (currently `radar`) so the page opens
  on the story — a one-line `parseViewMode` default change, easily reverted.
- **Edge cases:** jobIds outside careerHistory → excluded; same-job skills → one step; single point OK;
  `today` as memoised param, not `new Date()` in render.
- **a11y:** `visuallyHidden` `<table>` (year | cumulative); `role="img"` + `aria-label`.
- **Tests:** `deriveSkillGrowth.test.ts` (earliest date, monotonic, same-job dedup, markers) — `TimelineEvent`
  builders, pass a fixed `today`. Don't retest `deriveCareerYearRange`/`formatDate` (own tests cover them).
  `SkillsGrowthView.test.tsx`: render inside both providers (`SkillsViewContextProvider` skills +
  `SkillsCareerContext` mock `careerHistory`), no Suspense; assert hidden `<table>` rows + no-data branch;
  `axe` folded into each state test.

---

## Phase 1 — Agent B (feat 2 + 4)

### Feature 2 — Recommendation-backed skills

- **Data:** `recommendationIds` exists. New `src/utils/getRecommendationsByIds/` →
  `getRecommendationsByIds(ids, recommendations = defaultRecommendations)` → `{authorInitials,authorRole,text}[]`;
  preserve order, drop missing ids. **Injectable param** (mirrors `calculateSkillYears`'s `allSkills = defaultSkills`)
  so the test injects `Recommendation` builders instead of asserting against real data.
- **UX:**
  - Table `SkillRow` name cell: `Badge`+`FormatQuoteIcon`+count; click → `Popover` of snippets
    (initials+role+truncated text) linking `/?recommendation=<id>&track=<id>`.
  - **One path per destination:** this badge popover becomes the single recommendation entry point in the
    table — **remove** the per-recommendation `MenuItem`s from `rowActionsMenu/RowActionsMenu.tsx` (keep only
    "View on Resume") so a recommendation isn't reachable three ways (badge / `⋮` menu / tooltip links).
  - Bar chart: subtle dot at bar end on backed skills (tooltip already lists recs).
  - Stat: extract a small prop-driven `RecommendationStat` component (`Chip` "N skills backed by
    recommendations"), rendered in the `SkillsStatBar` below the caption (NOT the control bar, see Phase 0)
    — tested in isolation with a count prop (avoids `Skills.test.tsx` Suspense).
- **Edge cases:** 0 recs → no badge/marker; missing id → dropped + uncounted; singular/plural copy;
  popover focus restore (MUI); long text ellipsis.
- **a11y:** `aria-label` "3 recommendations"; icon+count (colour not sole signal); focus restore on close.
- **Tests:** `getRecommendationsByIds.test.ts` (found/missing/order) — inject `Recommendation` builders.
  `SkillsTable.test.tsx`: widen existing SkillRow tests — badge count on a backed row, absent when none,
  click→popover author/role (`userEvent`), `axe` folded into the popover-open state. `RecommendationStat.test.tsx`
  (count prop → copy, singular/plural).

### Feature 4 — Tech vs. soft-skill balance

- Consumes `SkillSummary.type` (Phase 0).
- **Data:** new `src/utils/deriveSkillTypeSplit/` → `{tech,skill,techPct}`.
- **UX:** extract a prop-driven `SkillTypeMeter` component — a 2-segment bar (styled `Box`/`LinearProgress`)
  with counts and a `Tooltip` — rendered in the `SkillsStatBar` beside `RecommendationStat` (below the caption,
  not the control bar — see Phase 0); reflects `filteredSkills`+search. Table: `tech`/`skill` `Chip` per `SkillRow`.
- **Edge cases:** all one type → one full segment (no div-by-zero); 0 skills → hide meter; tracks filters.
- **a11y:** meter `role="img"` + `aria-label` ("62% technical, 38% non-technical"); chips carry text.
- **Tests:** `deriveSkillTypeSplit.test.ts` (mixed/all-tech/all-soft/empty). `SkillTypeMeter.test.tsx`
  (props → aria-label + counts, tested in isolation, no Suspense). `SkillsTable.test.tsx`: widen SkillRow
  test with the type chip assertion.

---

## Phase 2 — Feature 5: Cross-track diff (serial, post-merge)

- **Data:** new `src/utils/deriveTrackDiff/` → per skill: `only-a`|`only-b`|`both-same-category`|`both-moved`.
  **Compose, don't re-traverse (DRY):** membership via `trackSkillIds(trackA)`/`trackSkillIds(trackB)`
  (→ only-a / only-b / both); for `both`, compare `deriveSkillCategoryMap(trackA)` vs
  `deriveSkillCategoryMap(trackB)` category ids (same → `both-same-category`, differ → `both-moved`).
  A thin composition of the two existing utils — no fresh `track.categories` walk.
- **UX:** "Compare" toggle by `TrackFilter` → 2nd picker + two-column layout (reuse `SkillsTableView`/`SkillsTable`
  per column). Moved skill → matching accent between columns; unique → **non-palette** status treatment
  (dashed left rule + a small "only here" text/icon marker), NOT a solid colour that could collide with the
  7-slot category hues. Compare forces table view. New URL param `compareTrack` (extend `skillsUrlParams` +
  `reorderFilterParams`).
- **Edge cases:** same track twice → disable/empty message; mobile → columns stack; filter/search applies to both;
  leaving compare restores prior view.
- **a11y:** two labelled regions ("General skills"/"Lead skills"); diff via text/legend not colour alone;
  amber border paired with text marker.
- **Tests:** `deriveTrackDiff.test.ts` (only-a/only-b/same/moved) — `Track` builders. Compare-mode render
  (2 labelled regions, forced table, legend) via `userEvent` on the toggle; `axe` folded into the compare-on state.

---

## Critical files

- Wiring: `Skills.tsx`, `Skills.helpers.ts`, `skillsUrlParams.ts`.
- View list / context: `skillsViews/index.ts`, `viewOptions/` (`VIEW_OPTIONS`), `SkillsViewContext.tsx` +
  `.types.ts`, new lean `SkillsCareerContext`.
- Mirror idioms: `SkillsBarChart.tsx` (Popper/dim/hidden-table/reduced-motion), `SkillsRadarChart.tsx`
  (empty/no-data branches), `SkillsTable.tsx` + `rowActionsMenu/`.
- Reuse: `skillTooltipContent/`, `categoryColourDot/`, `derivePresentCategories/`,
  `resolveSkillColourMain`/`categoryColourFromIndex`, `skillMatchesSearch`, `hasSearchTerm`.
- Reuse (DRY, don't re-implement): `deriveCareerYearRange` (growth x-axis span), `trackSkillIds` +
  `deriveSkillCategoryMap` (compose `deriveTrackDiff`; growth membership), `formatDate`/`formatYears`
  (all date/year labels), `SkillSummary` from context (skill colour/category — no parallel map).
- Data: `careerHistory.json`, `recommendations.json`, `skills.json`.
- Tests: builders in `src/testing/`; never import real data; follow `.claude/rules/testing.md`.

## Testing conventions (all features — per `.claude/rules/testing.md`)

- New views read `careerHistory` via the lean `SkillsCareerContext` (Phase 0), **never**
  `useCareerDataContext()` directly → their tests wrap in that small provider + `SkillsViewContextProvider`
  with builder mocks, no `use()`/Suspense flush. Reserve the render→`act` flush pattern for genuine `use()` suspenders.
- Pure utils take injectable data params defaulting to real data (`getRecommendationsByIds`,
  `deriveSkill*`, `deriveTrackDiff`) — tests inject `Recommendation`/`TimelineEvent`/`Track`/`SkillSummary`
  builders; never import `@/data/*` into a test.
- Extract header widgets (`RecommendationStat`, `SkillTypeMeter`) as prop-driven components → unit-test
  with props, avoiding `Skills.test.tsx` Suspense.
- Assert user-facing behaviour + the accessible hidden `<table>`, not hover opacity / SVG coords / impl
  detail. `userEvent` (not `fireEvent`) for clicks/hover.
- `const screen = render(...)` (never the global `screen`); `describe` named after the component;
  `toBeVisible()` for presence, `queryBy…` + `.not.toBeInTheDocument()` for absence; exact strings, no
  regex; blank line between setup and `expect`.
- `axe` folded into each distinct-state test (populated / empty-filter / no-data / popover-open), never a
  standalone axe test; widen an existing state's test rather than adding a near-duplicate.

## Conventions

- One component/util per folder: `Name.tsx`+`Name.test.tsx`+`index.ts`; `x.helpers.ts`/`x.types.ts`/`x.constants.ts`.
  Single-owner children nest under owner. `utils` never import from `views`.
- Captions cover all 5 views (Phase 0).
- UK spelling; bullet-style comments; Conventional Commits.

## Verification (user-run, one at a time)

1. 5 toggle buttons; each view has its caption; 320px toggle slimmer, no overflow.
2. Network: cluster by category; hover highlights neighbours; click → card; search/filter narrow; reduced-motion static.
3. Growth: cumulative climb; markers on hover; track switch reshapes.
4. Recommendations: badge+count on backed skills; popover author/role; header chip; bar markers.
5. Tech/soft: header meter+counts; type chip per row; tracks filters.
6. Cross-track diff: Compare → 2nd picker + two columns; moved/unique highlighted; forced table; mobile stacks.
7. Full suite + `axe` per new state, typecheck, lint — user-run.
