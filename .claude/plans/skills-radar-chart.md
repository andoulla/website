# Populate the Skills radar view (Category Balance radar)

## Context

`SkillsRadarView.tsx` currently renders a placeholder alert. The bar chart already covers
"years per individual skill" — the radar shows a different story: **balance across the 4
categories** (Engineering/Managerial/Soft Skills/Other), each axis = total years summed for that
category. Axes are always all 4 (from the unfiltered skill set), so a category/subcategory filter
just drains an axis toward the centre rather than removing it.

`?skill=` deep-linking is **out of scope** — doesn't map to a per-category aggregate.
`?category=`/`?subCategory=`/`?search=` already flow through `SkillsViewContext`, no new parsing.

**View mode becomes a URL param, defaulting to Radar.** Per user direction: when `?view=` is
absent, default to `'radar'` unconditionally (not conditional on a category filter being present —
simpler, no redirect-loop edge case to guard against).

**Reuse pass:** checked other skills-view folders before writing new code — found real duplication
to fix rather than copy a third time:

- `getPaletteMain` (`SkillsBarChart.tsx:27-34`) and the palette half of `dotColour`
  (`SkillItemsList.helpers.ts:7-20`) both resolve `SkillColour` → hex. Promote to
  `src/utils/skillColour/`.
- `isBarMatch`'s "no search term ⇒ match" guard is needed identically for the radar's per-category
  match check. Promote to `src/utils/skillMatchesSearch/`.
- Bar chart's legend JSX (`SkillsBarChart.tsx:136-164`) is needed identically by the radar.
  Extract to **`src/views/skills/categoryLegend/`** — sibling of the existing
  `skillFilterBar/`/`skillSearchBar/`, common ancestor of `skillsGraphView` and `skillsRadarView`.
  (Not `src/components/` — that's cross-layer over-promotion for something Skills-only. Also
  fixing `code-style.md`'s "lift to a common ancestor" line below, since it didn't previously say
  this.)

**Known gap discovered during implementation:** placing `CategoryLegend` at
`views/skills/categoryLegend/` still trips a _warning_ (not error) from the
`no-sibling-folder-imports` ESLint rule, because the rule only allows true ancestor/descendant
relationships or strictly-lower top-level layers — it has no notion of "shared leaf folder under a
common ancestor within the same top-level directory". The `code-style.md` prose now documents the
intended pattern, but the rule implementation (`eslint-local-rules/no-sibling-folder-imports.cjs`)
was not changed to match, since a naive fix (allow any import whose target's parent is an ancestor
of the importer) would also wrongly permit genuinely bad cousin imports (e.g. `skillsGraphView`
reaching into `skillsListView`'s internals). This is left as a follow-up — flagged to the user, not
silently resolved either way.

## `code-style.md` fix

Updated the "lift to a common ancestor" sentence in the second bullet to:

```
If code is shared, either nest the child directly under the folder that owns it
(`ownerFolder/childFolder/`) or lift it to a common ancestor — usually within the same top-level
directory rather than escalating to `src/components/` (e.g. two `views/skills/*` sub-views
sharing UI nest it at `views/skills/<name>/`, not `src/components/<name>/`) — see the nesting
convention in [CLAUDE.md](../../CLAUDE.md).
```

## Shared utilities extracted

**`resolveSkillColourMain(colour: SkillColour, theme: Theme): string`** — added to
`src/utils/skillColour/skillColour.helpers.ts`, exported via its `index.ts`. Replaced the
duplicated `getPaletteMain` (bar chart) and the palette half of `dotColour` (list view).

**`isSearchTermEmpty(searchTerm?: string): boolean`** — added to
`src/utils/skillMatchesSearch/skillMatchesSearch.ts`, exported via `index.ts`. `isBarMatch` now
builds on it instead of duplicating the guard inline.

**`CategoryLegend`** — new `src/views/skills/categoryLegend/` (one-component-per-folder pattern).
Props: `{ categories: SkillCategory[] }`. Used by both `SkillsBarChart` and the new
`SkillsRadarChart`.

## View mode as a URL param

- `Skills.types.ts` (new): `ViewMode` moved out of `Skills.tsx` since `Skills.helpers.ts` needs it.
- `Skills.constants.ts`: added `VIEW_PARAM = 'view'`.
- `Skills.helpers.ts`: added `parseViewMode`; `reorderFilterParams`'s fixed-key order is now
  `[VIEW_PARAM, CATEGORY_PARAM, SUBCATEGORY_PARAM]`.
- `Skills.tsx`: `viewMode` initial state reads `parseViewMode(searchParams.get(VIEW_PARAM)) ?? 'radar'`;
  `setViewMode` omits the `view` param from the URL only when set to `'radar'` (the default).
- `App.tsx`: added a TODO noting Resume only links out per-skill (`?skill=`), not per-category.

## `skillsRadarView/skillsRadarChart/` (mirrors `skillsGraphView/skillsBarChart/`)

`aggregateSkillsByCategory(categories, skills, searchTerm)` in `SkillsRadarChart.helpers.ts`
produces one `CategoryRadarPoint` per category (even at 0 skills, so axes stay stable under
filters). `SkillsRadarChart.tsx` renders a recharts `RadarChart` with a custom per-vertex `dot`
(coloured by category, dimmed when `searchTerm` doesn't match anything in that category — the
radar's substitute for the bar chart's per-bar `Cell` opacity trick), plus the shared
`CategoryLegend` and a visually-hidden accessible table.

`SkillsRadarView.tsx` wires it up: computes the stable `categories` axis list from the
_unfiltered_ skill set, and passes the category/subcategory-filtered skills as `skills`.

## Verification

1. User runs typecheck + lint.
2. Dev server: bar chart / list view look unchanged (pure refactor); Skills page now defaults to
   Radar view with a real 4-axis chart.
3. Toggle category/subcategory filters — axis shrinks to centre when excluded; URL updates.
4. Search term — matching category's dot stays coloured, others go grey.
5. Light/dark theme check.
6. Load `/skills` with no params → Radar; `/skills?view=barchart` → Graph; toggling views updates
   `view=...` in the URL (omitted only when it's `radar`).
7. User runs the test suite.
