# Test Suite Coverage & Cohesion Remediation Plan

## Context

A full audit of every test file in `src/components/`, `src/views/`, `src/utils/`, `src/context/`, `src/data/`, and `src/themes/` was run (two Explore agents covering UI vs. logic layers) to check: interaction coverage, variant/branch coverage, edge cases, loading/error states, test duplication, over-granular tests, and file cohesion. Every source file already has a co-located test file — there are no missing-test-file gaps, only gaps within specific tests. This plan closes those gaps and does low-risk cohesion cleanup, without inventing new abstractions or restructuring anything that isn't broken.

Builder reuse confirmed in `src/testing/`: `TimelineEvent`, `Recommendation`, `Skill`, `SkillSummary` — every new test below should use one of these instead of inline literals, matching existing usage in the same files.

**Ground rules (recalibrated):**

- Axe (`jest-axe`) checks are added only to UI-facing files — components and views under `src/components/`/`src/views/` that render DOM. Pure utility/logic modules (`src/utils/`, `src/themes/`) never get axe checks added by this plan, even where new tests are introduced.
- "Reorganize into themed describes" candidacy is judged by **test count** in a file, not line count — a file with many small tests is just as hard to scan as a long one, and a file with a handful of large tests is fine at any length.
- Provider "used outside its provider" guard-clause throws are **not tested** — this is a trivial programmer-error invariant, not user-facing behavior, and isn't worth a dedicated test.

## Priority

- **Must-fix** — real user-facing behavior with zero coverage: TimelineEventCard skill-tag → navigation, `techStack.length === 0` branch, multi-responsibility `BulletList` branch, `Tag`'s own `onClick`, `TagList`'s no-`onItemClick` case.
- **Should-fix** — violates the project's own "one axe check per rendered state" convention (UI presentational components/views only — see ground rules), an assertion that doesn't prove what its title claims, or a real lifecycle gap: `ResumeDataProvider`'s missing pending/rejected/default-loader paths, `ThemeContextProvider`'s missing overridable-defaults case.
- **Nice-to-have** — theme factory branch coverage, duplicate-test merges, describe-block reorganization for high-test-count files.
- **Explicitly skip** — cosmetic/hard-to-test-via-RTL items: `TimelineConnector` presence logic, Recharts tooltip-bridging function, hover-highlight cell styling.

---

## 1. Context provider lifecycle gaps (should-fix)

Guard-clause throw tests removed per ground rules above — only real lifecycle/default-wiring gaps remain.

- **`src/context/resumeData/ResumeDataProvider.test.tsx`**
  - Add a pending-Suspense test: loader promise never resolves within the test; assert the `Loading` fallback is visible before any flush.
  - Add a rejected-promise test: loader returns a rejected promise; wrap the tree in a small test-local error boundary and assert it renders the error.
  - Add a test rendering `<ResumeDataProvider>` with no `loader` prop (real default `loadExperiences`), asserting real data eventually renders — mirrors `loadExperiences.test.ts`'s use of real data.

- **`src/context/theme/ThemeContextProvider.test.tsx`**
  - Render `<ThemeContextProvider initialTheme="purple" initialDarkMode={true}>` and assert both overridable defaults take effect on first render (currently only the fallback values `'green'`/light are ever exercised).

## 2. Theme factory light/dark branch coverage (nice-to-have)

`createGreenTheme`/`createPurpleTheme` (`src/themes/green.ts`, `src/themes/purple.ts`) branch on light/dark mode; nothing in the codebase — including `ThemeContextProvider.test.tsx`, which only checks context strings — asserts on the resulting palette.

- **New `src/themes/green.test.ts`** — call `createGreenTheme('light')` / `createGreenTheme('dark')` directly; assert `palette.mode` and the fields that differ by mode (`text.secondary`, `divider`, `action.focus`, `background`) match the literal values in `green.ts`.
- **New `src/themes/purple.test.ts`** — same structure for `createPurpleTheme`.
- Pure function tests — per ground rules, no render, no axe.

## 3. TimelineEventCard interaction + branch gaps (must-fix)

**`src/views/resume/timelineEventCard/TimelineEventCard.test.tsx`** (extend existing `TimelineEvent`/`Recommendation` fixtures):

- Click a skill tag and assert navigation to `/skills?skill=<name>` — `handleSkillClick` (`TimelineEventCard.tsx:50-55`) calls `navigate` via `useNavigate`; currently zero coverage. Mock/observe navigation the same way other view tests handle `react-router-dom`.
- Render with `techStack: []` and assert the "Tech Stack" heading and its `Divider` are both absent — only the non-empty branch (`TimelineEventCard.tsx:70-79`) is currently tested.
- Render with more than one `responsibilities` entry and assert a `BulletList` (multiple list items) renders instead of the single `Typography` line (`TimelineEventCard.tsx:81-85`) — existing fixtures only ever use one responsibility.

## 4. Tag / TagList interaction + branch gaps (must-fix)

- **`src/components/tagList/tag/Tag.test.tsx`**
  - Render `<Tag onClick={onClick}>` directly and click it — currently `Tag`'s own `onClick` is only exercised indirectly via `TagList.test.tsx`.
  - Render with `colour="default"` **and** `shadeIndex` set, and assert it takes the plain-`Chip` fallback path (the `colour !== 'default'` guard) — only "no colour + no shadeIndex" and "colour + shadeIndex" combinations exist today.
- **`src/components/tagList/TagList.test.tsx`**
  - Render without `onItemClick` and click a tag; assert no error is thrown (optional-prop branch is currently unexercised).

## 5. Missing per-state axe checks (should-fix — direct convention violation)

The "one axe check per rendered state" convention applies only to UI presentational components/views (per ground rules) — all three files below qualify, since each is a UI view/component, not logic.

- **`src/views/skills/Skills.test.tsx`** — only the Suspense-loading state has an axe check. Add: loaded graph view, loaded list view (after switching), and open filter-menu state.
- **`src/views/skills/skillsListView/skillItemsList/SkillItemsList.test.tsx`** — add an axe check with `highlightedSkill` set (currently only an accessible-name assertion, no `axe()` call, for this state).
- **`src/views/skills/skillsListView/SkillsListView.test.tsx`** — add an axe check with the popover open and recommendations shown.

## 6. SkillsListView `scrollIntoView` effect (nice-to-have, cheap)

`scrollIntoView` is already globally polyfilled in `src/setupTests.ts:16`, so this only needs a spy.

- **`src/views/skills/skillsListView/SkillsListView.test.tsx`** — spy on `Element.prototype.scrollIntoView`, render with `highlightedSkill` set to a skill in the fixture list, assert it was called (with `{ behavior: 'smooth', block: 'center' }`). Optionally assert it's _not_ called when `highlightedSkill` is unset.

## 7. SkillsGraphView filter-ambiguity fix (should-fix — existing assertion doesn't prove what it claims)

- **`src/views/skills/skillsGraphView/SkillsGraphView.test.tsx`** — the "combines category and subcategory filters" test only asserts absence of specific skill names, leaving it unclear whether the component's own `Alert` (shown when `skills.length === 0`) or `SkillsBarChart`'s internal "No skills match the selected filter." message (shown when the _filtered_ result is empty but input wasn't) is rendering. Add a test with non-empty `skills` prop filtered down to zero matches, asserting the bar-chart's internal message is shown and no `alert` role is present.

## 8. Assertion-strength fixes (should-fix, cheap)

- **`src/utils/computeShadeColour/computeShadeColour.helpers.test.ts`** — rename the test from `'passes the computed bg to getContrastText'` to `'passes the computed background to getContrastText'`, and strengthen it: it currently only checks the mock was called with _a_ string. Assert `result.textColour` equals the mock's configured return value directly.
- **`src/utils/skillColour/skillColour.helpers.test.ts`** — replace/augment `skillShadeIndex`'s "different skills can produce different indices" (`Set.size > 1`, weak/probabilistic for a deterministic function) with a test asserting the exact expected index for a known input string. Add a test for `skillShadeIndex('')` returning `0`.

## 9. calculateSkillYears gaps (nice-to-have, batch into one file)

**`src/utils/calculateSkillYears/calculateSkillYears.test.ts`**:

- Fix the mistitled "sorts engineering before managerial, then soft-skills, then other" test — it never constructs a `category: 'other'` skill; add one via the `Skill` builder so the test proves what its title claims.
- Add a skill with partially-matching `jobIds` (some match experiences, some don't) to validate the accumulator's unmatched-ID branch distinctly from the existing all-matched/all-unmatched cases.
- Add a call relying on the default `allSkills`/`today` params (mirrors `matchSkill.test.ts`'s existing default-dataset test) — every current call passes explicit args.
- Add a rounding-boundary test near a `.x5`-year duration to confirm `Math.round(years * 10) / 10` behaves as expected.
- Merge "passes through jobIds and recommendationIds" and "passes through subCategory" into one test, renamed to **"passes through skill metadata fields unchanged: jobIds, recommendationIds, subCategory"** (list the fields after "unchanged" so the title fully documents what it covers).

## 10. joinJobsWithRecommendations / loadExperiences gaps (nice-to-have)

- **`src/utils/loadExperiences/joinJobsWithRecommendations/joinJobsWithRecommendations.test.ts`** — reconsidered per feedback: rather than adding a third "both populated together" test alongside the two existing type-specific tests, **merge** `'populates techStack from skills with type "tech" matching the job ID'` and `'populates skills from skills with type "skill" matching the job ID'` into a single test with a fixture containing one `type: 'tech'` and one `type: 'skill'` entry on the same job, asserting `techStack` and `skills` are each populated with the correct (and only the correct) entries. This proves both fields simultaneously — the actual goal — without growing the file to 3 tests; readability is preserved because the merged fixture reads as one realistic scenario ("a job with both tech and skill tags") rather than two synthetic ones.
- **`src/utils/loadExperiences/loadExperiences.test.ts`** — extend the existing per-experience loop assertion to also check `techStack`/`skills` are arrays, alongside the existing `recommendations` check.

## 11. Minor render-assertion gap (low priority)

- **`src/components/skillTooltipContent/SkillTooltipContent.test.tsx`** — add an explicit render-only test that `companyYears: []` omits the chip stack (currently only implied by the axe test for that state, not directly asserted).

## 12. Describe-block reorganization (polish, do last — recalibrated to test count, not line count)

Candidacy is judged by number of `it`/`test` blocks in a file. Do this pass **after** all additions above land, since several of these files gain tests from earlier workstreams.

- **`SkillFilterBar.test.tsx`** (12 tests) — reorganize into: trigger label, category toggling, subcategory toggling/grouping, accessibility.
- **`SkillsListView.test.tsx`** (15 tests, growing via workstreams 5–6) — reorganize into: render/grouping, filtering, popover, highlight/scroll, accessibility.
- **`Skills.test.tsx`** (13 tests, growing via workstream 5) — split into "category filter URL sync" / "subcategory filter URL sync" describe blocks, plus a general/accessibility block for the rest.
- **`NavBar.test.tsx`** (11 tests) — newly identified as a candidate under the test-count basis (previously excluded at only 112 lines). Covers navigation links, a theme toggle, a mode toggle, and a 4-way a11y matrix — reorganize into: navigation links, theme toggle, mode toggle, accessibility.
- **`calculateSkillYears.test.ts`** (12 tests today, ~14 after workstream 9) — newly identified as a candidate (previously excluded at 186 lines). Genuinely spans multiple concerns — inclusion/filtering, sorting, metadata passthrough, per-company breakdown — reorganize into matching describe blocks.
- **Considered, not reorganized: `matchSkill.test.ts`** (12 tests) — clears the same count threshold, but every test exercises one function along a single dimension (name/synonym/case/punctuation matching) rather than distinct concerns; splitting into describes would fragment a cohesive scenario narrative without adding clarity. Leave as a flat describe.

## Merge recheck (per feedback — full pass over the suite for mergeable tests)

- `joinJobsWithRecommendations.test.ts` and `calculateSkillYears.test.ts` merges — see workstreams 10 and 9 above.
- **`NavBar.test.tsx`** — tests `'toggle button label updates to green after switching to purple'` + `'toggle button cycles back to purple after two clicks'`, and `'clicking Dark selects dark mode'` + `'clicking Light after Dark returns to light mode'`, are simple two-step toggle cycles. Optional, low-priority merge into one "cycles through both states" test per pair — only do it if it doesn't reduce clarity; this is a judgment call, not a clear win, since RTL convention generally favors one behavior per test.
- **`SkillFilterBar.test.tsx`** — tests for adding vs. removing a category, and adding vs. removing a subcategory, are the same toggle-cycle shape as `NavBar`. Same optional/low-priority treatment.
- **`Skills.test.tsx`** — considered merging each filter's "reflects selection as URL param" + "removes URL param when cleared" pair, but **recommend keeping separate**: unlike the `NavBar`/`SkillFilterBar` cases, add vs. remove exercise genuinely different code paths in `Skills.helpers.ts` (`reorderFilterParams` vs. the param-deletion branch) — collapsing them would hide which branch broke on a failure.
- **`SkillTooltipContent.test.tsx`** — "plural years" vs. "singular year" is a boundary-condition pair; correctly kept separate, not a merge candidate.
- No further merge candidates found beyond the above in either audit.

## Explicitly skip

- `Resume.test.tsx` — `TimelineConnector` presence/absence: cosmetic.
- `SkillsBarChart.test.tsx` — Recharts tooltip-bridging function and hover-highlight cell styling: not meaningfully testable via RTL/jsdom against a Recharts `ResponsiveContainer` without a layout engine.

---

## Execution setup

Before starting any workstream, create a new git worktree with a new, dedicated branch (off `main`) to isolate this work — do not implement directly on `main` or in the primary working directory. All commits for this plan land on that branch.

Copy this finalized plan into a `./plan/` folder at the repo root (e.g. `plan/test-coverage-remediation.md`) and commit it as the first commit on the new branch, before starting workstream 1 — this keeps the plan itself version-controlled and visible alongside the work it describes.

Commit after finishing each workstream, before moving on to the next one — one commit per workstream (not one giant commit at the end). This keeps history reviewable and, since work happens over multiple sessions, ensures progress already made is durably saved: if the session is interrupted (e.g. credits run out) partway through, the commit log itself shows which workstreams are done and which remain, so work can pick back up from the last commit rather than needing to re-derive state from scratch.

## Verification

This is a test-only change with no production behavior modified. Per project convention, do not run tests/typecheck/lint — walk through each workstream's changes with the user one file at a time, having them run `yarn test <path>` (or their usual command) themselves and confirm each new/modified test passes and reads sensibly, before moving to the next workstream.
