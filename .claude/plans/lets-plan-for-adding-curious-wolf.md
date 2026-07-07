# Plan: Skill search (matching name + synonyms)

## Context

`Skill.synonyms` (src/data/skills.types.ts) exists in data but is only used by the authoring-time `matchSkill` dedup helper — dropped entirely before reaching the UI. The Skills page has no search at all today, only category/subcategory filtering.

This adds a search box on `/skills` matching a typed term against a skill's name **or** synonyms (e.g. "TS" → TypeScript), so a recruiter finds a skill regardless of which term the resume displays. Matches are **highlighted in place** in both List and Graph views — nothing is filtered out.

## Setup

Before starting implementation: create a new git worktree and branch for this work (do not implement directly on `main`).

## ⚠️ Architecture note (discovered mid-implementation)

The Skills view was refactored on `main` (PR #5, merged during planning) after this plan was originally researched. `SkillsListView`, `SkillsGraphView`, and a new `SkillsRadarView` placeholder now live under `src/views/skills/skillsViews/` and take **no props** — they read `skills`, `recommendations`, `selectedCategories`, `selectedSubCategories`, `highlightedSkill` from a new `useSkillsViewContext()` (`SkillsViewContext.tsx`/`.type.ts`), populated by `SkillsViewContextProvider` in `Skills.tsx`. `SkillFilterBar` is untouched; `SkillItemsList` and `SkillsBarChart` are untouched and still take explicit props from their parent view.

**Adjustment**: `searchTerm` is added to `SkillsViewContextValue` and populated by the provider in `Skills.tsx`, rather than threaded as a prop into `SkillsListView`/`SkillsGraphView` directly (steps 6/7 below). Those two views read it from context, then pass it down as a plain prop to `SkillItemsList`/`SkillsBarChart` same as before. `SkillsRadarView` is still just a placeholder (`Alert` with a skill count) — not wired for search highlighting, since there's nothing rendered yet to highlight.

## Approach

1. **Extract `normalize` → `src/utils/normalizeSearchTerm/`** (`.ts`/`.test.ts`/`index.ts`). Moved verbatim from `matchSkill.ts`'s private `normalize()`; `matchSkill.ts` imports it instead. No behavior change to `matchSkill` or its tests.

2. **Add `synonyms` to `SkillSummary`**: `calculateSkillYears.types.ts` (add field) + `calculateSkillYears.ts` (populate from `skill.synonyms`) + `src/testing/SkillSummary/{SkillSummary.ts,SkillSummary.data.ts}` (builder method + default `[]`).

3. **New util `src/utils/skillMatchesSearch/`**: `skillMatchesSearch(skill, term): boolean` — substring match (not exact, unlike `matchSkill`) against normalized name + synonyms. **Min-length guard: terms under 2 normalized chars always return `false`.** Verified against real data (45 skills): `"e"` matches 35/45, `"a"` matches 29/45 — a single keystroke would otherwise highlight most of the list and produce a meaningless "hidden by filters" count. Tests: name/synonym substring, case/punctuation insensitivity, no match, empty term, 1-char term.

4. **URL state**, mirroring the existing category/subCategory pattern exactly: `SEARCH_PARAM = 'search'` in `Skills.constants.ts`; `parseSearch(raw): string` in `Skills.helpers.ts`; `searchTerm`/`setSearchTerm` in `Skills.tsx` via `useSearchParams` + `{ replace: true }`. `reorderFilterParams` needs no change — `search` falls through as a trailing param exactly like `skill` does today.

5. **New `SkillSearchBar`** (`src/views/skills/skillSearchBar/`, sibling to `skillFilterBar/`): controlled MUI `TextField`, `aria-label="Search skills by name"`, `SearchIcon` start adornment, manual clear `IconButton` in `endAdornment` (shown when non-empty), **Escape key clears** (matches Google/GitHub convention). Full-width on `xs`, ~220px on `sm+`.
   - **Placement: first in the toolbar** (before `SkillFilterBar`, not sandwiched between it and the view toggle) — avoids an awkward wrap order on mobile when the row flex-wraps.

6. **List view** (`SkillsListView.tsx`/`SkillItemsList.tsx`): read `searchTerm` from `useSkillsViewContext()`, pass down to `SkillItemsList` as a prop; `isSearchMatch = searchTerm.trim() !== '' && skillMatchesSearch(...)`. Give it a treatment **visually distinct** from the existing deep-link `isHighlighted` (both can be true at once, different meanings) — keep `isHighlighted`'s bg tint, add a border/accent for `isSearchMatch`. **No auto-scroll on search** (deliberate) — scrolling every keystroke would be jarring and there's no debounce lib in this repo; user scrolls manually.

7. **Graph view** (`SkillsGraphView.tsx`/`SkillsBarChart.tsx`): read `searchTerm` from context, pass down to `SkillsBarChart` as a prop; non-matching bars get `opacity: 0.35` when a search is active; suppress the existing hover-lighten effect on non-matching bars so hover doesn't contradict the dim state.

8. **No generic "no matches at all" message** — nothing is filtered, so the full list/chart stays visible regardless of match count; an empty-state message would add complexity for no real benefit.

9. **Filter interaction — hidden-match hint.** Category/subcategory filtering already physically removes skills before render (in both views); search highlighting only operates on what's left, same as how the existing `?skill=` deep link already silently no-ops when its target is filtered out. Per explicit direction this should NOT be silent for search: `Skills.tsx` computes `hiddenMatchCount` (matches in the full skill set minus matches in the currently-filtered set) and passes a `hint?: string` to `SkillSearchBar` (→ TextField `helperText`), e.g. "1 match hidden by filters". One hint, shared across both views.

10. **Accessibility**: `aria-label` on the input. No broad live-announced match count (noise, nothing reflows) — but the hidden-match hint _is_ actionable info a screen-reader user typing wouldn't otherwise get (MUI's `helperText`/`aria-describedby` isn't re-announced on every change while focused), so give **that hint specifically** `aria-live="polite"`.

## Edge cases considered

- **Single-char queries** → min-length guard (#3), backed by real match-count data.
- **Rapid typing bound to router state** — `searchTerm` lives in `useSearchParams`, updated every keystroke like category/subCategory already are; trivial dataset size, no remount/debounce, should be fine — verify by typing fast rather than assuming.
- **Deep link vs. search hint asymmetry** — `?skill=` stays silent when filtered out; not extending the new hint to cover it too (rare external-entry flow, unlikely to co-occur with a hiding filter). Deliberate, not a miss.
- **One term matching multiple skills** (e.g. "react" → React, React Query, React Testing Library) — intended; it's a search, not an exact lookup.
- **Search match + deep-link highlight on the same row** — handled via visually distinct treatments (#6).

## Files to touch

**New:**

- `src/utils/normalizeSearchTerm/{normalizeSearchTerm.ts,normalizeSearchTerm.test.ts,index.ts}`
- `src/utils/skillMatchesSearch/{skillMatchesSearch.ts,skillMatchesSearch.test.ts,index.ts}`
- `src/views/skills/skillSearchBar/{SkillSearchBar.tsx,SkillSearchBar.test.tsx,index.ts}`

**Edited:**

- `src/utils/matchSkill/matchSkill.ts` — use extracted `normalizeSearchTerm`
- `src/utils/calculateSkillYears/{calculateSkillYears.types.ts,calculateSkillYears.ts}` — add/populate `synonyms`
- `src/testing/SkillSummary/{SkillSummary.ts,SkillSummary.data.ts}` — builder + default
- `src/views/skills/Skills.constants.ts` — `SEARCH_PARAM`
- `src/views/skills/Skills.helpers.ts` — `parseSearch`
- `src/views/skills/Skills.tsx` — `searchTerm` state, `hiddenMatchCount`, renders `SkillSearchBar`, passes `searchTerm` into `SkillsViewContextProvider`
- `src/views/skills/skillsViews/SkillsViewContext.tsx` + `.type.ts` — add `searchTerm: string` to context value
- `src/views/skills/skillsViews/skillsListView/SkillsListView.tsx` + `skillItemsList/SkillItemsList.tsx` — read `searchTerm` from context, pass to `SkillItemsList` as prop, `isSearchMatch` styling
- `src/views/skills/skillsViews/skillsGraphView/SkillsGraphView.tsx` + `skillsBarChart/SkillsBarChart.tsx` — read `searchTerm` from context, pass to `SkillsBarChart` as prop, dim/suppress-hover on non-matches

**Tests to add/update — mapped to the verification steps below, so each manual check has an automated counterpart where one is feasible:**

- `skillMatchesSearch.test.ts` (new) — covers verification #2 (1-char no match), #3/#4 (name/synonym substring, multi-match), min-length guard.
- `SkillSearchBar.test.tsx` (new) — covers #6 (Escape clears), #7 (clear button clears).
- `SkillItemsList.test.tsx` — covers #3 (isSearchMatch styling) and #8 (isHighlighted + isSearchMatch both true, visually distinct classes).
- `SkillsBarChart.test.tsx` — covers #3 (dim non-matches) and #9 (hover suppressed on dimmed bar).
- `Skills.test.tsx` — covers #10 (`hiddenMatchCount` → hint text appears/disappears).
- `Skills.helpers.test.ts` — `parseSearch` cases.
- `SkillsListView.test.tsx`, `SkillsGraphView.test.tsx` — `searchTerm` read from context and passed to the child component correctly.
- `SkillsViewContext.test.tsx` — `searchTerm` included in the provided context value.
- `normalizeSearchTerm.test.ts` (new), `matchSkill.test.ts` (unchanged, should stay green after the refactor).

**Not automatable — the only two things that belong in manual Verification**, everything else above is covered by a test: mobile wrap order (CSS layout, jsdom doesn't render it) and rapid-typing/dropped-characters (a timing concern RTL's synchronous `fireEvent` doesn't exercise).

## Verification

Per this repo's convention, typecheck/lint/tests are run by the user, not me. Everything else is covered by the tests above; only these two need a manual look, since neither is meaningfully automatable:

1. `/skills` — search box renders first in the toolbar; wrap order looks clean on mobile.
2. Type fast → no dropped characters, box stays responsive.
