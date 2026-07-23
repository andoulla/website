# Time Machine Scrubber (Skills view)

Branch: `feat/time-machine-scrubber` · own worktree · small incremental commits.
Parallel-safe with `feat/ask-about-my-experience` (disjoint files).

**Context:** `/skills` only shows current end-state skill-years. Add a year slider that
recomputes skill-years as-of that year, track-aware. Additive — no `?asOf=` means "latest"
(defaults to `maxYear`); the chart is year-granular (see edge cases).

**Why not modify `calculateSkillYears` directly:**

- `durationYears` (`src/utils/calculateSkillYears/calculateSkillYears.ts:7`) only clips
  open-ended events at `today` — a closed event ending after the cutoff isn't clipped.
- Fix: feed it a pre-clipped `TimelineEvent[]`, not a changed function. Keeps frozen logic intact.

**New util `src/utils/deriveCareerHistoryAsOf/`:**

- `deriveCareerHistoryAsOf(careerHistory, cutoffDate): TimelineEvent[]` — drop events starting
  after cutoff; clamp `endDate` to cutoff when null or later than cutoff.
- `deriveCareerYearRange(careerHistory, track, today = new Date()): { minYear, maxYear }` —
  `minYear` = earliest `startDate` year among events that contribute a skill in `track`;
  `maxYear` = `today.getFullYear()`. Track-scoped, recomputes on track switch.
- - test file + `index.ts`.

**Wire into `SkillsContent` (`src/views/skills/Skills.tsx`):**

```ts
const { minYear, maxYear } = useMemo(
  () => deriveCareerYearRange(careerHistory, track),
  [careerHistory, track]
);
const [cutoffYear, setCutoffYear] = useSkillSearchUrl(
  AS_OF_PARAM,
  useCallback((raw) => parseAsOfYear(raw, minYear, maxYear), [minYear, maxYear]),
  (next) => (next === maxYear ? null : String(next))
);
// Purely year-based cutoff — Dec 31 of the selected year, every year, no separate "today" path.
const cutoffHistory = useMemo(
  () => deriveCareerHistoryAsOf(careerHistory, new Date(`${cutoffYear}-12-31`)),
  [careerHistory, cutoffYear]
);
const skills = useMemo(() => calculateSkillYears(cutoffHistory, track), [cutoffHistory, track]);
```

- Downstream (`filteredSkills`, all 3 views via `SkillsViewContextProvider`) unchanged — cutoff
  flows through to barchart/radar/table automatically.

**URL param:**

- Add `AS_OF_PARAM = 'asOf'` to `src/utils/skillsUrlParams/skillsUrlParams.ts:5`.
- Add `parseAsOfYear(raw, minYear, maxYear)` to `Skills.helpers.ts` (style of `parseViewMode`,
  line 30) — clamps to range, defaults to `maxYear`.
- Add `AS_OF_PARAM` to `PREFIX_PARAMS` (`Skills.helpers.ts:33`).

**New component `src/views/skills/timeMachineSlider/`:**

- `TimeMachineSlider.tsx` — props `{ year, minYear, maxYear, onCommit }`. MUI `Slider`,
  `valueLabelDisplay="auto"`, discrete integer `step={1}`, year `marks`, `aria-label="Career year"`,
  "Present" label when `year === maxYear`.
- **Stepped search:** local state tracks the thumb's year live (label follows drag), but the
  committed year — what re-derives the chart and writes `?asOf=` — fires only on
  `onChangeCommitted` (settled step / release), so dragging doesn't re-search per intermediate year.
- - test + `index.ts`.
- Mount as new full-width row in `Skills.tsx`, below the filter `Stack` (`:171-219`), same slot
  pattern as the "Texture fills" row (`:220-238`) — always visible, not gated to one view mode.

**Caption / visibility:**

- Caption above the slider: `Typography variant="caption" color="text.secondary"` — "See skills
  as they stood at any point in time." Always visible, low visual weight.

**Animation:** none new — `SkillsBarChart`/`SkillsRadarChart` already animate on data change
(`isAnimationActive`, `animationDuration={400}`).

**Tests:**

- `deriveCareerHistoryAsOf.test.ts` — 2 tests: (1) one multi-event fixture (before / straddling /
  after / exactly-on / open-ended) asserted in a single `toEqual`; (2) `deriveCareerYearRange`
  track-scoped range, `minYear` excludes an out-of-track early event, `maxYear` from injected
  `today`.
- `TimeMachineSlider.test.tsx` — render+a11y+caption in one pass; commit on settled step calls
  `onCommit`; "Present" label only at `maxYear`.
- `Skills.test.tsx` (extend) — default omits param + all skills present; `?asOf=<early year>`
  clips + round-trips; pre-first-skill year → `skillsEmptyState`; committing a step updates chart.

**Files:**

- `src/utils/deriveCareerHistoryAsOf/` (new: `.ts`, `.test.ts`, `index.ts`)
- `src/utils/skillsUrlParams/skillsUrlParams.ts` — add `AS_OF_PARAM`
- `src/views/skills/Skills.helpers.ts` — add `parseAsOfYear`, extend `PREFIX_PARAMS`
- `src/views/skills/Skills.tsx` — wire cutoff state + slider row
- `src/views/skills/timeMachineSlider/` (new: `.tsx`, `.test.tsx`, `index.ts`)

**Edge cases:**

- Empty skills at an early cutoff → render `skillsEmptyState` (not a blank chart).
- Invalid/out-of-range `?asOf=` → `parseAsOfYear` defaults to `maxYear` (NaN/absent) or clamps to
  `[minYear, maxYear]`; `=== maxYear` omits the param.
- Year-granular, no "present" path — default view reflects through end of current year, marginally
  ahead of a live-today calc. Accepted.
- Track-scoped range recomputes on track switch (slider tightens to active track).
- Stale category filter at a cutoff → `skillsEmptyState`; filter options rescope off post-cutoff
  `skills`.
- Stepped search (commit on `onChangeCommitted`) → no per-year animation churn.
- Marks crowding on mobile → marks at min/max/present only (or hidden) on `xs`.

**Verify:** user runs `yarn test` + manual drag check. (Never run tests myself.)

**Progress:**

- [x] Worktree + branch `feat/time-machine-scrubber`
- [x] `deriveCareerHistoryAsOf` util + tests
- [x] `AS_OF_PARAM` + `parseAsOfYear` + `PREFIX_PARAMS`
- [x] `TimeMachineSlider` component + tests
- [x] Wire cutoff state into `Skills.tsx` + slider row
- [x] `Skills.test.tsx` integration tests
- [ ] User verification (PR review)
