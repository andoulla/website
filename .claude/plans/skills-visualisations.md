# Skills page — five new visualisations

## Context

- `/skills` today: 3 views (Graph/Radar/Table), all from `SkillSummary` = present-day snapshot.
- Unused data in `src/data/`: `responsibility.skillIds` (co-occurrence), `skill.recommendationIds`,
  `skill.type` (dropped in `calculateSkillYears`), acquisition dates, cross-track reshuffle.
- Goal: 5 new visualisations, each surfacing a dimension the current trio can't + a one-line caption
  on **every** view.

## Features (renumbered)

1. **Co-occurrence network** — force graph of skills used together in the same bullet.
2. **Testimonial-backed skills** — `recommendationIds` as badges + header stat.
3. **Career growth curve** — cumulative unique skills over the timeline.
4. **Tech vs. soft-skill balance** — resurface `skill.type` as split meter + chips.
5. **Cross-track diff** — two tracks side by side, highlight what moves.

## Execution

- Worktree per agent under `website/.claude/worktrees/`, both off `feat/skills-viz`. Disjoint files → clean merge.
- Commit as we go (Conventional Commits).
- Verification is the user's — never run typecheck/lint/tests/dev. Walk changes one at a time.

**Phases:**

- **0 — scaffolding (serial):** shared touch-points, before agents split.
- **1 — parallel:** Agent A = feat 1+3 (new folders). Agent B = feat 2+4 (existing-view edits).
- **2 — serial:** feat 5 (restructures page shell) on merged base.

---

## Phase 0 — Scaffolding (serial, `feat/skills-viz`)

- **View enum** — `skillsUrlParams.ts`: `VIEW_MODES = [...,'network','growth']`. `ViewMode`/`parseViewMode` derive automatically.
- **Toggle + render** — `Skills.tsx`:
  - Add 2 `ToggleButton`s (`HubIcon` network, `TrendingUpIcon` growth) + `Tooltip` + `aria-label`.
  - Extend `renderSkillsView` (L50–54): `network`→`<SkillsNetworkView/>`, `growth`→`<SkillsGrowthView/>`.
  - **Slimmer on mobile:** 5 icons overflow `xs`. Keep all visible (no wrap/menu). Tighten padding
    `'& .MuiToggleButton-root': { px: { xs: 0.75, sm: 1.25 } }`; drop icon size a notch on `xs`
    (`useMediaQuery(theme.breakpoints.down('sm'))`). No horizontal overflow at 320px.
- **Captions (one-liner req)** — new `src/views/skills/viewCaption/` (`ViewCaption.tsx` + `.constants.ts` + test).
  `VIEW_CAPTIONS: Record<ViewMode,string>`, rendered `Typography body2 text.secondary` above the view:
  - barchart → "Years of experience per skill, longest bars first"
  - radar → "Average experience across each skill area"
  - table → "Every skill grouped by area, with the companies behind it"
  - network → "Which skills I've used together, and how often"
  - growth → "How my skill set has grown across my career"
- **`SkillSummary.type` plumbing (feat 4 shared):**
  - `calculateSkillYears.types.ts`: `type: SkillType` (from `@/types`).
  - `calculateSkillYears.ts` (~L66): add `type: skill.type`.
  - `testing/SkillSummary/SkillSummary.ts` + `.data.ts`: `type(...)` setter + default.
- **Placeholder stubs** — `skillsNetworkView/` + `skillsGrowthView/` folders (stub component + `index.ts`),
  exported from `skillsViews/index.ts`. Lets enum/toggle typecheck; agents fill internals.
- Commit, then cut 2 worktrees off this.

---

## Phase 1 — Agent A (feat 1 + 3)

### Feature 1 — Co-occurrence network

- **Data:** new `src/utils/deriveSkillCoOccurrence/`. Walks `responsibility.skillIds`; unordered pairs →
  edge weights; node weight = bullet count. Returns `{nodes:{id,weight}[], edges:{source,target,weight}[]}`.
  Join ids → `SkillSummary` for colour/category/name.
- **Dep:** add `d3-force` + `@types/d3-force` (Recharts has no node-link chart). Layout in `useMemo`
  (fixed seed, deterministic); render raw SVG `<circle>`/`<line>` in a `<Box>`. Reads
  `useCareerDataContext()` for careerHistory + `useSkillsViewContext()` for skills/search/filters.
- **UX:** node radius ∝ years; edge width ∝ weight; colour via `resolveSkillColourMain(skill.colour)`.
  Hover → neighbours full-opacity, rest dim (bar-chart idiom); click → `Popper` + `SkillTooltipContent`
  (reuse). Search dims non-matches; category filter restricts nodes. Isolated skills at periphery.
  Labels on hover / top-degree only. Legend = `derivePresentCategories` + `CategoryColourDot`.
  Folder `skillsNetworkView/skillsNetworkGraph/`.
- **Edge cases:** <2 skillIds → no edge; ids absent from track set skipped; empty filter → `SkillsEmptyState`;
  no skills → info `Alert` (mirror radar); `prefers-reduced-motion` → static final positions.
- **a11y:** `role="img"` + `aria-label`; `visuallyHidden` `<table>` (skill | co-occurring | count);
  colour not sole signal.
- **Tests:** `deriveSkillCoOccurrence.test.ts` (pair count, symmetric/dedup, ignores <2, drops unknown).
  `SkillsNetworkView.test.tsx` (hidden-table rows via builders, empty state, no-data alert, `axe`).
  Assert table+interactions, not SVG coords.

### Feature 3 — Career growth curve

- **Data:** new `src/utils/deriveSkillGrowth/`. Skill acquired date = earliest `startDate` of its `jobIds`;
  sort asc; cumulative unique-skill points `{date,count}`. Job markers `{date,companyName}` from events with a start date.
- **Recharts (no new dep):** `AreaChart`+`Area` (stepped), `XAxis`(time), `YAxis`, `CartesianGrid`,
  `Tooltip`, `ResponsiveContainer`, `ReferenceLine` (dashed markers). Reduced-motion gates animation.
- **UX:** x = career span → today, y = cumulative skills; gradient fill; company on hover.
  **Track-scoped, filter-agnostic** (driven by `skills`, not filtered); caption states it.
  Folder `skillsGrowthView/skillsGrowthChart/`.
- **Edge cases:** jobIds outside careerHistory → excluded; same-job skills → one step; single point OK;
  `today` as memoised param, not `new Date()` in render.
- **a11y:** `visuallyHidden` `<table>` (year | cumulative); `role="img"` + `aria-label`.
- **Tests:** `deriveSkillGrowth.test.ts` (earliest date, monotonic, same-job dedup, markers).
  `SkillsGrowthView.test.tsx` (hidden table, no-data, `axe`).

---

## Phase 1 — Agent B (feat 2 + 4)

### Feature 2 — Testimonial-backed skills

- **Data:** `recommendationIds` exists. New `src/utils/getRecommendationsByIds/` → `{authorInitials,authorRole,text}[]`
  from `@/data/recommendations`; preserve order, drop missing ids.
- **UX:**
  - Table `SkillRow` name cell: `Badge`+`FormatQuoteIcon`+count; click → `Popover` of snippets
    (initials+role+truncated text) linking `/?recommendation=<id>&track=<id>`.
  - Bar chart: subtle dot at bar end on backed skills (tooltip already lists recs).
  - Header `Chip`: "N skills backed by testimonials" (present skills with ≥1 rec).
- **Edge cases:** 0 recs → no badge/marker; missing id → dropped + uncounted; singular/plural copy;
  popover focus restore (MUI); long text ellipsis.
- **a11y:** `aria-label` "3 testimonials"; icon+count (colour not sole signal); focus restore on close.
- **Tests:** `getRecommendationsByIds.test.ts` (found/missing/order). `SkillsTable.test.tsx` (badge count,
  absent when none, click → popover author/role, `axe` open). Header chip count in `Skills.test.tsx`.

### Feature 4 — Tech vs. soft-skill balance

- Consumes `SkillSummary.type` (Phase 0).
- **Data:** new `src/utils/deriveSkillTypeSplit/` → `{tech,skill,techPct}`.
- **UX:** header 2-segment bar (styled `Box`/`LinearProgress`) + counts + `Tooltip`; reflects
  `filteredSkills`+search. Table: `tech`/`skill` `Chip` per `SkillRow`.
- **Edge cases:** all one type → one full segment (no div-by-zero); 0 skills → hide meter; tracks filters.
- **a11y:** meter `role="img"` + `aria-label` ("62% technical, 38% non-technical"); chips carry text.
- **Tests:** `deriveSkillTypeSplit.test.ts` (mixed/all-tech/all-soft/empty). `SkillsTable.test.tsx` (chip per row).
  Meter aria/count test.

---

## Phase 2 — Feature 5: Cross-track diff (serial, post-merge)

- **Data:** new `src/utils/deriveTrackDiff/` → per skill: `only-a`|`only-b`|`both-same-category`|`both-moved`.
- **UX:** "Compare" toggle by `TrackFilter` → 2nd picker + two-column layout (reuse `SkillsTableView`/`SkillsTable`
  per column). Moved skill → matching accent between columns; unique → amber left border + legend.
  Compare forces table view. New URL param `compareTrack` (extend `skillsUrlParams` + `reorderFilterParams`).
- **Edge cases:** same track twice → disable/empty message; mobile → columns stack; filter/search applies to both;
  leaving compare restores prior view.
- **a11y:** two labelled regions ("General skills"/"Lead skills"); diff via text/legend not colour alone;
  amber border paired with text marker.
- **Tests:** `deriveTrackDiff.test.ts` (only-a/only-b/same/moved). Compare render (2 regions, forced table, legend). `axe`.

---

## Critical files

- Wiring: `Skills.tsx`, `Skills.helpers.ts`, `skillsUrlParams.ts`.
- Registry/context: `skillsViews/index.ts`, `SkillsViewContext.tsx` + `.types.ts`.
- Mirror idioms: `SkillsBarChart.tsx` (Popper/dim/hidden-table/reduced-motion), `SkillsRadarChart.tsx`
  (empty/no-data branches), `SkillsTable.tsx` + `rowActionsMenu/`.
- Reuse: `skillTooltipContent/`, `categoryColourDot/`, `derivePresentCategories/`,
  `resolveSkillColourMain`/`categoryColourFromIndex`, `skillMatchesSearch`, `hasSearchTerm`.
- Data: `careerHistory.json`, `recommendations.json`, `skills.json`.
- Tests: builders in `src/testing/`; never import real data; follow `.claude/rules/testing.md`.

## Conventions

- One component/util per folder: `Name.tsx`+`Name.test.tsx`+`index.ts`; `x.helpers.ts`/`x.types.ts`/`x.constants.ts`.
  Single-owner children nest under owner. `utils` never import from `views`.
- Captions cover all 5 views (Phase 0).
- UK spelling; bullet-style comments; Conventional Commits.

## Verification (user-run, one at a time)

1. 5 toggle buttons; each view has its caption; 320px toggle slimmer, no overflow.
2. Network: cluster by category; hover highlights neighbours; click → card; search/filter narrow; reduced-motion static.
3. Growth: cumulative climb; markers on hover; track switch reshapes.
4. Testimonials: badge+count on backed skills; popover author/role; header chip; bar markers.
5. Tech/soft: header meter+counts; type chip per row; tracks filters.
6. Cross-track diff: Compare → 2nd picker + two columns; moved/unique highlighted; forced table; mobile stacks.
7. Full suite + `axe` per new state, typecheck, lint — user-run.
