# Plan: src/ code review remediation

## Context

- Full-folder review of `src/` (not a diff), via `/code-review` methodology.
- 9 finder angles (correctness x2, invariants, cross-file tracer, reuse, simplification,
  efficiency, altitude, CLAUDE.md conventions) → verification pass on every candidate.
- This plan = **all** surviving findings, not just the top-10 already reported.
- Fixes are independent — implement/verify one at a time, any order, unless a note says
  otherwise.

**Structure:**

1. Part 0 — Approved for implementation (user picked these 7 items from Part 2/3 to fix now,
   two with a redesigned approach — supersedes the older bullets for the same items below)
2. Part 1 — Correctness bugs (10, all CONFIRMED, already reported via `ReportFindings`)
3. Part 2 — Confirmed cleanup findings (reuse/efficiency/altitude/conventions, all CONFIRMED,
   ranked below Part 1 only by the review's severity tie-break)
4. Part 3 — Lower-confidence/latent items (PLAUSIBLE-but-dormant, or single-source/unverified)

---

## Progress (Part 0 implementation)

Branch: `part-0-code-review-fixes`. One commit per item.

- [x] 0.1 — Rename `sub` → `subCategory`
- [x] 0.2 — Move `RESPONSIBILITIES_LABEL_BY_TYPE` to constants
- [x] 0.3 — Derive category accumulators from `CATEGORY_ORDER`
- [x] 0.4 — Default `highlightedSkills` prop
- [x] 0.5 — Data-driven `CategoryPatternDefinition` + new constants file
- [x] 0.6+0.7 — `useSkillSearchUrl` hook (single-source searchTerm + generalised URL params)

Part 0 complete.

---

## Progress (Part 1 implementation)

Branch: `part-1-correctness-fixes` (off `part-0-code-review-fixes`). One commit per item.

- [x] 1 — `ErrorBoundary` wired into `App.tsx` (+ #11 logging)
- [x] 2 — Orphaned subcategory filter fix
- [x] 3 — `loadArticles` cache fix
- [x] 4 — Superseded by 0.7, already done in Part 0
- [x] 5 — `hasSearchTerm`/`skillMatchesSearch` threshold fix
- [x] 6+7 — `CopyLinkButton` status-token fix (combined per plan's own note)
- [x] 8 — `SkillsListView` empty state + clear-filters button
- [x] 9 — `formatDate` calendar validation
- [x] 10 — JSON force-cast validation guards

Part 1 complete.

---

## Part 0 — Approved for implementation

Picked by the user from Part 2/Part 3 below. Implement one at a time, user reviews each before
the next (per this repo's CLAUDE.md verification convention — no self-run typecheck/lint/tests).

### 0.1 — Rename `sub` → `subCategory`

- **Where:** `SkillFilterBar.tsx:52-54`, inside `toggleCategory`'s subcategory-cleanup filter.
- **Fix:** rename the callback param only — `(sub) => !subCategoriesForCategory.includes(sub)`
  → `(subCategory) => !subCategoriesForCategory.includes(subCategory)`.
- Purely mechanical, no behaviour change.

### 0.2 — Move `RESPONSIBILITIES_LABEL_BY_TYPE` to `TimelineEventCard.constants.ts`

- **Where:** currently defined in `TimelineEventCard.helpers.ts:13-17`.
- **Fix:**
  - Add to `TimelineEventCard.constants.ts` (needs a new `import type { TimelineEvent } from '@/types';`):
    ```ts
    export const RESPONSIBILITIES_LABEL_BY_TYPE: Record<TimelineEvent['type'], string> = {
      work: 'Responsibilities',
      education: 'Description',
      other: 'Responsibilities',
    };
    ```
  - Remove it from `TimelineEventCard.helpers.ts`, drop its now-unused `TimelineEvent` type import there.
  - **Important:** `TimelineEventCard.tsx` currently imports `RESPONSIBILITIES_LABEL_BY_TYPE` from
    `./TimelineEventCard.helpers` (alongside `getCardMotionSx`, `groupSkillsByCategory`,
    `recommendationElementId`) — update that import to pull `RESPONSIBILITIES_LABEL_BY_TYPE` from
    `./TimelineEventCard.constants` instead, split across two import statements. (Missing this step
    breaks the build — caught this the hard way mid-session.)

### 0.3 — Derive `byCategory`/`subGroupsByCategory` initial accumulators from `CATEGORY_ORDER`

- **Where:** `SkillsListView.tsx:43-59` and `:61-82` — both `useMemo`'d `reduce` calls currently
  seed their accumulator with the same 5 `SkillCategory` keys hand-listed twice as object literals.
- **Why now:** user says categories will be changing — these two literals will silently drift
  out of sync with `CATEGORY_ORDER` otherwise.
- **Fix:** add a small generic helper to `SkillsListView.helpers.ts` (already exists, currently
  just exports `skillElementId`):

  ```ts
  import { CATEGORY_ORDER } from '@/utils/skillCategory';

  export const createEmptyByCategory = <T>(): Record<SkillCategory, T[]> =>
    Object.fromEntries(CATEGORY_ORDER.map((cat) => [cat, [] as T[]])) as Record<SkillCategory, T[]>;
  ```

  Use `createEmptyByCategory<SkillSummary>()` and `createEmptyByCategory<SubCategoryGroup>()` as
  the two reduce initial values in `SkillsListView.tsx`, replacing the hand-listed literals.

### 0.4 — Default `highlightedSkills` prop in `SkillItemsList`

- **Where:** `SkillItemsList.tsx:68,75` — `(highlightedSkills ?? []).includes(skill.skill)`
  allocates a new empty array per row per render when the prop is `undefined`.
- **Fix:** default it once at the destructuring site instead:
  ```tsx
  export const SkillItemsList = ({ skills, highlightedSkills = [] }: SkillItemsListProps) => {
    // ...
    isHighlighted={highlightedSkills.includes(skill.skill)}
  ```
- One allocation avoided per render instead of one per row; trivial but free.

### 0.5 — Make `CategoryPatternDefinition` data-driven

- **Where:** `SkillsBarChart.tsx:36-91` (the `CategoryPatternDefinition` component's 5-case switch), plus
  `SkillsBarChart.helpers.ts:12-58` (the `CategoryPatternKind` type, `CATEGORY_PATTERN_TYPE` map,
  and `getCategoryPatternBackground`'s parallel CSS-gradient switch).
- **Why now:** categories will be changing. Note: a _new category_ alone doesn't require a new
  switch case today — it just needs an entry in `CATEGORY_PATTERN_TYPE` pointing at one of the 5
  existing pattern types. The switches only grow if a _new visual pattern type_ is ever added.
  Making both data-driven removes the duplication and makes that future addition a data change,
  not a new JSX/CSS case.
- **Naming fix:** rename the type `CategoryPatternKind` → `CategoryPatternType` (matches this
  codebase's existing `SkillCategory`/`SkillSubCategory`/`ViewMode` naming — "Kind" doesn't
  appear anywhere else as a type suffix).
- **New file — `SkillsBarChart.constants.ts`** (per the `x.constants.ts` convention; plain data,
  no JSX, so `.ts` not `.tsx`):

  ```ts
  import type { SkillCategory } from '@/data/skills.types';

  // Textures for colour-blind/low-vision users, layered on top of category colour.
  export type CategoryPatternType = 'diagonal' | 'vertical' | 'crosshatch' | 'dots' | 'grid';

  export const CATEGORY_PATTERN_TYPE: Record<SkillCategory, CategoryPatternType> = {
    engineering: 'diagonal',
    'quality-performance': 'crosshatch',
    tooling: 'dots',
    'leadership-delivery': 'vertical',
    'people-stakeholders': 'grid',
  };

  interface PatternLine {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    strokeWidth: number;
  }

  export interface CategoryPatternShapeDefinition {
    width: number;
    height: number;
    patternTransform?: string;
    lines: PatternLine[];
    circle?: { cx: number; cy: number; r: number };
  }

  export const CATEGORY_PATTERN_SHAPE_DEFINITIONS: Record<
    CategoryPatternType,
    CategoryPatternShapeDefinition
  > = {
    diagonal: {
      width: 8,
      height: 8,
      patternTransform: 'rotate(45)',
      lines: [{ x1: 2, y1: 0, x2: 2, y2: 8, strokeWidth: 2 }],
    },
    vertical: {
      width: 8,
      height: 8,
      lines: [{ x1: 4, y1: 0, x2: 4, y2: 8, strokeWidth: 2 }],
    },
    crosshatch: {
      width: 8,
      height: 8,
      lines: [
        { x1: 0, y1: 0, x2: 8, y2: 8, strokeWidth: 1.5 },
        { x1: 8, y1: 0, x2: 0, y2: 8, strokeWidth: 1.5 },
      ],
    },
    dots: {
      width: 6,
      height: 6,
      lines: [],
      circle: { cx: 3, cy: 3, r: 1.5 },
    },
    grid: {
      width: 8,
      height: 8,
      lines: [
        { x1: 0, y1: 4, x2: 8, y2: 4, strokeWidth: 1.5 },
        { x1: 4, y1: 0, x2: 4, y2: 8, strokeWidth: 1.5 },
      ],
    },
  };
  ```

- **`SkillsBarChart.tsx`** — `CategoryPatternDefinition` becomes a fully generic renderer, no switch:

  ```tsx
  import {
    CATEGORY_PATTERN_TYPE,
    CATEGORY_PATTERN_SHAPE_DEFINITIONS,
  } from './SkillsBarChart.constants';

  const CategoryPatternDef = ({ category, colour, markColour }: CategoryPatternDefinitionProps) => {
    const id = getCategoryPatternId(category);
    const { width, height, patternTransform, lines, circle } =
      CATEGORY_PATTERN_SHAPE_DEFINITIONS[CATEGORY_PATTERN_TYPE[category]];
    return (
      <pattern
        id={id}
        patternUnits="userSpaceOnUse"
        width={width}
        height={height}
        patternTransform={patternTransform}
      >
        <rect width={width} height={height} fill={colour} />
        {lines.map((line) => (
          <line
            key={`${line.x1}-${line.y1}-${line.x2}-${line.y2}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={markColour}
            strokeWidth={line.strokeWidth}
          />
        ))}
        {circle !== undefined && (
          <circle cx={circle.cx} cy={circle.cy} r={circle.r} fill={markColour} />
        )}
      </pattern>
    );
  };
  ```

- **CSS-gradient switch (`getCategoryPatternBackground`) — make it consistent, not left as-is.**
  Recommendation: convert it to a `Record<CategoryPatternType, (colour: string, markColour: string) => string>`
  map in the same constants file, replacing the switch with a lookup — same idea as the SVG side.
  Caveat: don't try to mechanically _derive_ the CSS gradients from the `lines`/`circle` geometry
  above — they're a genuinely different rendering technique (CSS `repeating-linear-gradient`
  angle/spacing vs SVG line coords) tuned by eye to look similar at swatch size, not a 1:1 mapping.
  Keep them as their own hand-tuned entries, just restructured as a data map instead of a switch:

  ```ts
  // added to SkillsBarChart.constants.ts
  export const CATEGORY_PATTERN_CSS_BACKGROUND: Record<
    CategoryPatternType,
    (colour: string, markColour: string) => string
  > = {
    diagonal: (colour, markColour) =>
      `repeating-linear-gradient(45deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 4px), ${colour}`,
    vertical: (colour, markColour) =>
      `repeating-linear-gradient(90deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 4px), ${colour}`,
    crosshatch: (colour, markColour) =>
      `repeating-linear-gradient(45deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 5px), ` +
      `repeating-linear-gradient(-45deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 5px), ${colour}`,
    dots: (colour, markColour) =>
      `radial-gradient(${markColour} 30%, transparent 30%) 0 0 / 6px 6px, ${colour}`,
    grid: (colour, markColour) =>
      `repeating-linear-gradient(0deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 5px), ` +
      `repeating-linear-gradient(90deg, ${markColour} 0, ${markColour} 1px, transparent 1px, transparent 5px), ${colour}`,
  };
  ```

  `getCategoryPatternBackground` in `SkillsBarChart.helpers.ts` becomes a one-liner:

  ```ts
  export const getCategoryPatternBackground = (
    category: SkillCategory,
    colour: string,
    markColour: string
  ): string => CATEGORY_PATTERN_CSS_BACKGROUND[CATEGORY_PATTERN_TYPE[category]](colour, markColour);
  ```

- Net result: `SkillsBarChart.helpers.ts` keeps only the two `getCategoryPattern*` id/background
  functions (now one-liners) and `isBarMatch`; all pattern _data_ (kind map, SVG shape defs, CSS
  gradient fns) lives in the new `SkillsBarChart.constants.ts`, imported by both
  `SkillsBarChart.tsx` and `SkillsBarChart.helpers.ts`.

### 0.6 — `Skills.tsx` searchTerm: keep local state, write-through to the URL via the shared hook

- **Where:** `Skills.tsx:108-132` (local `searchTerm` state mirroring the `search` URL param)
- **Superseded design note:** originally tried `flushSync` for a fully URL-derived single
  source of truth. **Discovered during implementation: react-router only guarantees `flushSync`
  navigation in Data/Framework router mode** (per its own docs) — this app uses declarative
  `<BrowserRouter>`, so `flushSync` didn't reliably commit before the next keystroke, causing a
  real, reproduced test failure (stale search term used in `hiddenMatchCount`). Reverted to local
  state for this one value.
- **Fix:** `searchTerm` stays local state (needed for synchronous per-keystroke reactivity —
  filtering/dimming elsewhere on the page can't wait on a URL round-trip), seeded once from the
  URL via `useSkillSearchUrl`'s initial value, written through the same hook on every change:

  ```ts
  const [initialSearchTerm, setSearchTermUrl] = useSkillSearchUrl(
    SEARCH_PARAM,
    parseSearch,
    (next) => (next !== '' ? next : null)
  );
  const [searchTerm, setSearchTermState] = useState(initialSearchTerm);

  const setSearchTerm = useCallback(
    (next: string) => {
      setSearchTermState(next);
      setSearchTermUrl(next);
    },
    [setSearchTermUrl]
  );
  ```

  - `useState(initialSearchTerm)` only applies on first mount (standard React behaviour), so the
    URL still seeds the initial value on a deep link, exactly like the original design.
  - The URL is now a write-only mirror for this one param — not literally single-source, but the
    only design that's both correct and simple given this app's router mode. The other 4 params
    (category, subCategory, view, skill) don't have this problem — they change on discrete
    clicks, not rapid typing, so the plain hook works for them as-is.
  - Combine with finding #5 (`hasSearchTerm` gated on `MIN_SEARCH_TERM_LENGTH`) in the same pass —
    that's what makes a 1-character term a no-op for filtering/dimming.
  - No `flushSync` needed anywhere now — removed from the hook entirely (see 0.7).

### 0.7 — Generalise the 3 URL-param closures into a `useSkillSearchUrl` hook

- **Where:** `Skills.tsx:58-70` (read side: `highlightedSkills`/`selectedCategories`/
  `selectedSubCategories`, each its own `useMemo(() => parseX(...), [searchParams])`) and
  `:72-106` (write side: `setSelectedCategories`/`setSelectedSubCategories`/`setViewMode`, each a
  near-identical closure building a `URLSearchParams` and calling `setSearchParams`).
- **Decision:** full hook generalising both read and write (bigger option, chosen over the
  smaller write-only helper).
- **Bonus:** reading each param via its own raw string (not the whole `searchParams` object) also
  fixes finding #4 (`SkillsListView`'s scroll-to-highlight effect re-firing on unrelated filter
  changes) as a side effect — one hook, two findings closed.
- **New file:** `src/views/skills/useSkillSearchUrl/` (nested under `views/skills/`, its sole
  consumer — per the nesting convention). No options param — `flushSync` was dropped entirely
  (see 0.6's superseded-design note above; it doesn't work in this app's router mode):
  - `useSkillSearchUrl.ts`:

    ```ts
    import { useCallback, useMemo } from 'react';
    import { useSearchParams } from 'react-router-dom';

    import { reorderFilterParams } from '../Skills.helpers';

    export const useSkillSearchUrl = <T>(
      key: string,
      parse: (raw: string | null) => T,
      serialize: (value: T) => string | null
    ): [T, (next: T) => void] => {
      const [searchParams, setSearchParams] = useSearchParams();
      const raw = searchParams.get(key);
      const value = useMemo(() => parse(raw), [raw, parse]);

      const setValue = useCallback(
        (next: T) => {
          setSearchParams(
            (prev) => {
              const params = new URLSearchParams(prev);
              const nextRaw = serialize(next);
              if (nextRaw !== null) {
                params.set(key, nextRaw);
              } else {
                params.delete(key);
              }
              return reorderFilterParams(params);
            },
            { replace: true }
          );
        },
        [key, serialize, setSearchParams]
      );

      return [value, setValue];
    };
    ```

  - `index.ts` — re-export `useSkillSearchUrl`.
  - `useSkillSearchUrl.test.tsx` (`.tsx` — the router wrapper needs JSX) — cover: initial parse
    from an existing param, write sets/deletes the param via the serialize fn's `null`
    convention, value reference stability when an unrelated param changes.

- **`Skills.tsx` usage** (replaces the 5 separate read `useMemo`s and 3 separate write closures
  for category/subCategory/viewMode — `searchTerm` keeps its own local state per 0.6):

  ```ts
  const [highlightedSkills] = useSkillSearchUrl(SKILL_PARAM, parseSkills, () => null);
  // setter unused here — skill param is only ever written by TimelineEventCard's navigate()

  const [selectedCategories, setSelectedCategories] = useSkillSearchUrl(
    CATEGORY_PARAM,
    parseCategories,
    (next) => (next.length > 0 ? next.join(',') : null)
  );

  const [selectedSubCategories, setSelectedSubCategories] = useSkillSearchUrl(
    SUBCATEGORY_PARAM,
    parseSubCategories,
    (next) => (next.length > 0 ? next.join(',') : null)
  );

  const [viewMode, setViewMode] = useSkillSearchUrl(
    VIEW_PARAM,
    (raw) => parseViewMode(raw) ?? 'radar',
    (next) => (next === 'radar' ? null : next)
  );
  ```

  - Implement 0.6 and 0.7 together as one combined change to `Skills.tsx`, not two separate
    passes — `searchTerm`'s hook call (0.6) and the other 3 both live in the same component.
  - Drop the standalone `showPatterns` `useState` untouched — it's local UI state, not
    URL-backed, out of scope here.
  - Double check `reorderFilterParams`'s import path after the hook moves under
    `useSkillSearchUrl/` — it imports from `../Skills.helpers`, one level up from the new
    nested folder, which is allowed (child → parent import per the nesting convention).

---

## Part 1 — Correctness bugs (CONFIRMED)

### 1. No `ErrorBoundary` around career-data loading → blank crash on load failure

- **Where:** `src/App.tsx` (no ErrorBoundary anywhere), `src/components/errorBoundary/ErrorBoundary.tsx` (exists, tested, unused)
- **Bug:** `CareerDataContextProvider.tsx:17` calls React 19 `use(promise)`, which rethrows a rejection during render. Nothing catches it → blank screen.
- **No existing app-wide error-state design** — checked. There's one precedent,
  `Articles.tsx`'s inline `StatusMessage` (`ErrorIcon color="error" fontSize="large"` + a muted
  `Typography` message, no retry action since that view auto-retries via its own `useEffect` on
  remount). Reuse that icon/message visual language for consistency; add a refresh button since
  this is a full-page crash with no other recovery path (the class-based `ErrorBoundary` has no
  reset mechanism once tripped — reloading is the simplest way back to a working state).
- **Fix** — wrap `CareerDataLayout` in `App.tsx`:

  ```tsx
  import ErrorIcon from '@mui/icons-material/Error';
  import RefreshIcon from '@mui/icons-material/Refresh';
  import Button from '@mui/material/Button';
  import Stack from '@mui/material/Stack';
  import Typography from '@mui/material/Typography';

  import { PageContainer } from './components/pageContainer';
  import { ErrorBoundary } from './components/errorBoundary';
  // ...
  const CareerDataLayout = () => (
    <ErrorBoundary
      fallback={() => (
        <PageContainer>
          <Stack sx={{ py: 8, alignItems: 'center', gap: 1.5 }}>
            <ErrorIcon color="error" fontSize="large" />
            <Typography color="text.secondary">Something went wrong loading this page.</Typography>
            <Button startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </Stack>
        </PageContainer>
      )}
    >
      <CareerDataContextProvider>
        <Outlet />
      </CareerDataContextProvider>
    </ErrorBoundary>
  );
  ```

- `fallback`'s type is `(error: Error) => ReactNode` — nothing error-specific is shown to the
  user, so just omit the parameter entirely (`fallback={() => (...)}`); TypeScript allows a
  function value with fewer params than the type it's satisfying, so this type-checks cleanly
  with no unused-variable lint issue and no underscore-prefixing needed.
- Do finding #11 (logging) in the same pass, since you're touching this component anyway.
- **Test:** `App.test.tsx` — inject a `loader` that rejects, assert the fallback (icon + refresh
  button) renders instead of a crash.

---

### 2. Orphaned subcategory filter → silently empty results

- **Where:** `src/views/skills/skillFilterBar/SkillFilterBar.tsx:42-59` (`toggleCategory`)
- **Bug:** subcategory cleanup only runs on the _deselect_ branch (`if (isSelected)`, line 50). Selecting a different category leaves a stale subcategory selected → `filterSkillsByCategory` ANDs them → unsatisfiable combo → silent `[]`.
- **Repro:** no category selected → check subcategory "Testing" (belongs to `quality-performance`) → select category "Engineering" → 0 skills match, no visible way to clear.
- **Fix:**

  ```ts
  const toggleCategory = (category: SkillCategory) => {
    const isSelected = selectedCategories.includes(category);
    const nextCategories = isSelected
      ? selectedCategories.filter((selectedCategory) => selectedCategory !== category)
      : [...selectedCategories, category];
    onCategoriesChange(nextCategories);

    const validSubCategories = new Set(
      nextCategories.flatMap((cat) => subCategoriesByCategory[cat] ?? [])
    );
    const nextSubCategories = selectedSubCategories.filter((sub) => validSubCategories.has(sub));
    if (nextSubCategories.length !== selectedSubCategories.length) {
      onSubCategoriesChange(nextSubCategories);
    }
  };
  ```

- Double-check against existing `SkillFilterBar.test.tsx` cases for the zero-categories-selected state before landing.
- **Test:** select subcategory in category A → select category B → assert subcategory A cleared.

---

### 3. `loadArticles` caches a rejected promise forever

- **Where:** `src/utils/loadArticles/loadArticles.ts:25-28`
- **Bug:** `cachedArticles ??= fetchAndParseArticles()` — a rejected promise is still non-null, so `??=` never retries. One rss2json failure = permanently broken for the session.
- **Fix:**

  ```ts
  export const loadArticles = (): Promise<Article[]> => {
    cachedArticles ??= fetchAndParseArticles().catch((error: unknown) => {
      cachedArticles = null;
      throw error;
    });
    return cachedArticles;
  };
  ```

- **Test:** mock fetch to reject once → call `loadArticles()` twice → assert 2nd call retries instead of replaying the rejection.

---

### 4. `SkillsListView` scroll-to-highlight effect re-fires on unrelated filter changes

- **Where:** `Skills.tsx:59-62` (`highlightedSkills` memo), `SkillsListView.tsx:28-32` (effect)
- **Bug:** `useMemo(..., [searchParams])` depends on the whole `searchParams` object, not the `skill` param. Any unrelated filter change → new `searchParams` ref → new `highlightedSkills` array (same contents) → effect re-fires → `scrollIntoView` yanks scroll position.
- **Fix:**

  ```ts
  const skillParam = searchParams.get(SKILL_PARAM);
  const highlightedSkills = useMemo(() => parseSkills(skillParam), [skillParam]);
  ```

- **Test:** set `?skill=`, trigger unrelated filter change, assert mocked `scrollIntoView` not called again.
- **Superseded by 0.7** — the `useSkillSearchUrl` hook reads each param off its own raw string,
  fixing this as a side effect. If 0.7 lands, this standalone fix isn't needed separately.

---

### 5. `hasSearchTerm` / `skillMatchesSearch` disagree on minimum term length

- **Where:** `hasSearchTerm.ts:1-2`, `skillMatchesSearch.ts:4,8` (`MIN_TERM_LENGTH = 2`)
- **Bug:** `hasSearchTerm` says "searching" for any 1+ char string; `skillMatchesSearch` always returns `false` under 2 normalised chars. Result: typing 1 character empties `SkillsListView` entirely and dims every bar/radar-axis.
- **Fix:** export `MIN_TERM_LENGTH` (rename `MIN_SEARCH_TERM_LENGTH`) from `skillMatchesSearch.ts`, use it in `hasSearchTerm`:

  ```ts
  import { normaliseSearchTerm } from '@/utils/normaliseSearchTerm';
  import { MIN_SEARCH_TERM_LENGTH } from '@/utils/skillMatchesSearch';

  export const hasSearchTerm = (searchTerm?: string): searchTerm is string =>
    searchTerm !== undefined && normaliseSearchTerm(searchTerm).length >= MIN_SEARCH_TERM_LENGTH;
  ```

- Sibling-utils import is fine (same layer, not backward).
- **Test:** `hasSearchTerm.test.ts` 1-char case → `false`; `SkillsListView.test.tsx` 1-char search → shows all skills, no false-empty.

---

### 6. `CopyLinkButton` reset-timer effect no-ops on rapid re-clicks

- **Where:** `CopyLinkButton.tsx:14-18`
- **Bug:** effect keyed on `[copied]`. Second click while already `copied === true` → `setCopied(true)` is a no-op → effect doesn't re-run → original timer (partway through) still fires early.
- **Fix:** implemented together with #7 below — a plain 3-value status string has the _same_
  no-op problem as the original boolean (setting `'copied'` again when already `'copied'` is
  still an `Object.is`-equal no-op). Use an object state instead — a fresh object literal is
  never reference-equal to the previous one regardless of its contents, so no timestamp/token
  field is needed, just the object wrapping itself:

  ```ts
  type CopyStatus = 'idle' | 'copied' | 'failed';
  interface CopyState {
    status: CopyStatus;
  }
  const IDLE_STATE: CopyState = { status: 'idle' };

  const [state, setState] = useState<CopyState>(IDLE_STATE);

  useEffect(() => {
    if (state.status === 'idle') return;
    const timer = setTimeout(() => setState(IDLE_STATE), RESET_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const handleClick = () => {
    void navigator.clipboard
      .writeText(`${window.location.origin}${location.pathname}${location.search}`)
      .then(() => setState({ status: 'copied' }))
      .catch(() => setState({ status: 'failed' }));
  };
  ```

- **Test:** avoid fake-timer arithmetic (fights with `advanceTimers: true`'s auto-advance,
  causing flaky/incorrect firing order) — instead spy on `clearTimeout` and assert it's called
  again after a second click while already `'copied'`, proving the effect actually re-ran
  instead of being skipped on a repeated status.

---

### 7. `CopyLinkButton` swallows clipboard-write failures silently

- **Where:** `CopyLinkButton.tsx:24-26` (empty `.catch`)
- **Bug:** no error state, no feedback — user thinks the copy succeeded when it didn't.
- **Fix:** implemented together with #6 above (same `CopyState` object) — `.catch` sets
  `{ status: 'failed' }` instead of doing nothing.
- Add a `'failed'` tooltip/icon state (error icon + "Couldn't copy link").
- **Test:** mock `writeText` to reject → click → assert failed state renders.

---

### 8. `SkillsListView` — no empty-state message for zero results

- **Where:** `SkillsListView.tsx:84-91`
- **Bug:** empty `nonEmptyCategories` → renders blank `<Stack>`. Siblings `SkillsBarChart.tsx:108-114` / `SkillsRadarChart.tsx:39-45` both show `"No skills match the selected filter."`
- **Fix — message + a "Clear filters" button:**

  ```tsx
  const {
    filteredSkills,
    highlightedSkills,
    searchTerm,
    selectedCategories,
    selectedSubCategories,
    onClearFilters,
  } = useSkillsViewContext();
  const hasActiveFilters = selectedCategories.length > 0 || selectedSubCategories.length > 0;
  // ...
  if (nonEmptyCategories.length === 0) {
    return (
      <Stack sx={{ py: 4, alignItems: 'center', gap: 1 }}>
        <Typography color="text.secondary">No skills match the selected filter.</Typography>
        {hasActiveFilters && (
          <Button size="small" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </Stack>
    );
  }

  return <Stack spacing={2}>{/* existing map */}</Stack>;
  ```

- Button only shows when a category/subcategory filter is actually active — if the zero-result
  cause is the search term alone, clearing filters would be a no-op, so hide it.
- **Context change needed** — `onClearFilters` isn't in `SkillsViewContextValue` yet:
  - `SkillsViewContext.type.ts` — add `onClearFilters: () => void` to `SkillsViewContextValue`.
  - `SkillsViewContext.tsx` — pass it straight through into the memoized `value` (add to the
    `useMemo` deps array too).
  - `Skills.tsx` — build it from the existing setters and pass it into `SkillsViewContextProvider`:
    ```ts
    const clearFilters = useCallback(() => {
      setSelectedCategories([]);
      setSelectedSubCategories([]);
    }, [setSelectedCategories, setSelectedSubCategories]);
    ```
    Scoped to category/subcategory only — matches the app's own "Filters (N)" wording on
    `SkillFilterBar`'s button, distinct from the separate search box. Doesn't touch `searchTerm`.
- Must do: the message+button block is now triplicated across 3 files (bar/radar charts have the
  message only, no button yet) — worth extracting a shared component nested under
  `views/skills/skillsViews/` while touching all three, so bar/radar get the same clear-filters
  affordance for free.
- **Test:** filter to zero results → assert message + button render, click clears filters and
  results reappear; search-only zero-result case → assert button is absent.

---

### 9. `formatDate` accepts invalid calendar dates

- **Where:** `formatDate.ts:16-31`
- **Bug:** `ISO_DATE_PATTERN` checks digit-shape only. `formatDate('2024-02-30')` → returns `"30 Feb 2024"` (non-existent date) instead of `''`.
- **Fix:** validate via `Date`'s overflow normalisation:

  ```ts
  const date = new Date(`${isoDate}T00:00:00Z`);
  const isValidCalendarDate =
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day);
  if (!isValidCalendarDate) return '';
  ```

  (insert after the existing `monthName === undefined` check, before the final `return`)

- **Test:** `'2024-02-30'` / `'2024-04-31'` → `''`; leap day `'2024-02-29'` → still formats; `'2023-02-29'` → `''`.

---

### 10. Career/skills/recommendations JSON force-cast with no runtime validation

- **Where:** `src/data/careerHistory.ts:5`, `recommendations.ts`, `skills.ts:4`
- **Bug:** `as TimelineEvent[]` / `as unknown as Skill[]` — no check the JSON actually matches. A typo'd `type` field silently renders a blank `Section` title via `RESPONSIBILITIES_LABEL_BY_TYPE[event.type]` returning `undefined`.
- **Fix** — lightweight dev-time guard (not a full schema validator; these are local fixtures, not third-party input):

  ```ts
  const VALID_TYPES: TimelineEvent['type'][] = ['work', 'education', 'other'];

  careerHistoryData.forEach((event) => {
    if (!VALID_TYPES.includes(event.type as TimelineEvent['type'])) {
      throw new Error(
        `careerHistory.json: unrecognised type "${event.type}" on event "${event.id}"`
      );
    }
  });
  ```

- Same pattern for `skills.ts` (validate `category`/`subCategory` against `CATEGORY_ORDER`/`SUBCATEGORIES_BY_CATEGORY`) and `recommendations.ts` if it has closed-enum fields.
- **Test:** per data file, assert the guard throws on a deliberately-mangled inline payload (don't mutate the real JSON).

---

## Progress (Part 2 implementation)

Branch: `part-2-cleanup-fixes` (off `part-1-correctness-fixes`). One commit per item.

- [x] 11 — Already done in Part 1 (folded into fix #1's commit)
- [x] 12 — Extract shared `MONTH_NAMES` from `TimelineEventCard`
- [x] 13 — Extract `derivePresentCategories` util
- [x] 14 — `SkillItemsList` reuse `formatYears`
- [x] 15 — Extract `CategoryColourDot` (circle + square shapes)
- [x] 16 — Dedupe `filterSkillsByCategory` computation
- [x] 17+18 — Dropped (premature optimization, see below)
- [x] 19 — `RoleIcon` logo-mapping guard (moved to `RoleIcon.test.tsx`, builder-based)
- [x] 20 — Drop unused exports (`SectionProps`, `ROLE_ICONS` barrel); kept `matchSkill`

Part 2 complete.

---

## Part 2 — Confirmed cleanup findings

Ranked below Part 1 only because correctness outranks cleanup in the review's tie-break — all CONFIRMED.

### 11. `ErrorBoundary` doesn't log caught errors

- **Where:** `ErrorBoundary.tsx:8-10`
- **Fix:** add alongside `getDerivedStateFromError`, same PR as fix #1:

  ```ts
  componentDidCatch(error: Error, info: { componentStack: string }): void {
    console.error('ErrorBoundary caught an error:', error, info.componentStack);
  }
  ```

### 12. `TimelineEventCard` reimplements `formatDate`'s month-name table

- **Where:** `TimelineEventCard.tsx:39-62` (local `MONTH_NAMES`) vs `formatDate.ts:1-14`
- Sibling `RecommendationByline.tsx` already imports shared `formatDate`.
- Note: `formatDate`'s output includes the day (`"10 Jan 2020"`), so only the `MONTH_NAMES` table itself is the duplicate — `formatMonthYear`'s day-omitted output still needs its own function.
- **Fix:** extract `MONTH_NAMES` to `formatDate.constants.ts` (or export from `formatDate.ts`), import into `TimelineEventCard.tsx` instead of the local copy.

### 13. `CATEGORY_ORDER.filter(...)` duplicated across 4 files

- **Where:** `Skills.tsx:179-182`, `SkillsListView.tsx:84-87` (derived form), `SkillsRadarView.tsx:17-19`, `SkillsBarChart.tsx:120-122`
- Two of the four (`SkillsRadarView`, `SkillsBarChart`) also aren't memoized — same root cause as #18/#17.
- **Fix:** extract shared util (sibling import within `utils/` is fine):

  ```ts
  // src/utils/skillCategory/derivePresentCategories.ts
  export const derivePresentCategories = (skills: SkillSummary[]): SkillCategory[] =>
    CATEGORY_ORDER.filter((category) => skills.some((skill) => skill.category === category));
  ```

- Replace all 3 call sites; wrap in `useMemo` at each (Skills.tsx already does).

### 14. `SkillItemsList` reimplements `formatYears`

- **Where:** `SkillItemsList.tsx:60` — inline `` `est. ${skill.years} year${skill.years === 1 ? '' : 's'}` ``
- `SkillTooltipContent.tsx` / `CategoryTooltip.tsx` already use `formatYears`.
- **Fix:** `` `est. ${formatYears(skill.years)}` `` — check `formatYears`'s exact return shape first (confirm whether "est." needs to stay outside it).

### 15. Colour-dot `sx` duplicated across `SkillItemsList`, `CategoryLegend` and `SkillsBarChart`

- **Where:** `SkillItemsList.tsx:48-56` (8x8 circle, `mr: 1.5`), `CategoryLegend.tsx:32-41` (8x8 circle,
  `opacity: 0.7`), `SkillsBarChart.tsx:211-221` (square, `borderRadius: '2px'`, `background` is
  either a flat colour or `getCategoryPatternBackground(cat, colour, markColour)` — not a solid fill).
  Resized the square swatch to 8x8 to match the circle (was 10x10) when unifying into one component.
- **Fix:** extract `src/views/skills/categoryColourDot/CategoryColourDot.tsx` (lowest common ancestor =
  `views/skills/`). One component, `shape` prop switches radius only (both shapes are 8x8); `background`
  (full CSS value) overrides `colour` (solid `bgcolor`) when the fill isn't flat:

  ```tsx
  export interface CategoryColourDotProps {
    shape?: 'circle' | 'square';
    colour?: string;
    background?: string;
    sx?: Record<string, string | number>;
  }

  const RADIUS_BY_SHAPE = { circle: '50%', square: '2px' } as const;

  export const CategoryColourDot = ({
    shape = 'circle',
    colour,
    background,
    sx,
  }: CategoryColourDotProps) => (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: RADIUS_BY_SHAPE[shape],
        ...(background !== undefined ? { background } : { bgcolor: colour }),
        flexShrink: 0,
        ...sx,
      }}
    />
  );
  ```

  Note: `sx` is deliberately typed as a plain `Record<string, string | number>`, not MUI's
  `SxProps<Theme>` — passing `SxProps<Theme>` through an sx _array_ (`sx={[base, sx]}`) hit a
  `no-unsafe-...`/`undefined not assignable` type error from this MUI version's array-element
  typing (no array support, no falsy entries). Merging via a single plain-object spread instead
  sidesteps that entirely and is all two real callers need.

- **Call sites, all switch to the shared component:**
  - `SkillItemsList.tsx:48-56` → `<CategoryColourDot colour={dotColour(skill, theme)} sx={{ mr: 1.5 }} />`
  - `CategoryLegend.tsx:32-41` → `<CategoryColourDot colour={resolveSkillColourMain(CATEGORY_COLOUR_MAP[category], theme)} sx={{ opacity: 0.7 }} />`
  - `SkillsBarChart.tsx:211-221` → `<CategoryColourDot shape="square" colour={colour} background={showPatterns ? getCategoryPatternBackground(cat, colour, markColour) : undefined} />`

### 16. Duplicate `filterSkillsByCategory` computation (Skills.tsx + SkillsViewContext)

- **Where:** `Skills.tsx:134-137` and `SkillsViewContext.tsx:28-31` — identical call, both memoized individually, but redundant.
- **Fix:** thread `Skills.tsx`'s `filteredSkills` into `SkillsViewContextProvider` as a prop; drop the internal `useMemo` in `SkillsViewContext.tsx`. Update `SkillsViewContextProviderProps` type to add `filteredSkills: SkillSummary[]`.

### 17+18. Dropped — memoizing `SkillsBarChart`/`SkillsRadarView` derivations

- Not implementing. Tiny dataset (tens of skills) → filter/map cost is microseconds, not a real bottleneck.
- Only argument was consistency with `SkillsListView`'s memoization, not measured perf.
- `SkillsListView`'s own memoization was equally unnecessary — removed (categories only change via
  a new deployment, no runtime drift risk).

### 19. `RoleIcon`/`RoleIcons.constants.ts` — three uncoordinated mechanisms decide one icon

- **Where:** `RoleIcon.tsx:14-28` (logo map → education branch → fallback icon), `RoleIcons.constants.ts:11-22`
- `LOGO_BY_EVENT_ID` keys are hardcoded id strings duplicated from `careerHistory.json` with no compile-time link — a renamed id silently falls through to the generic `School` icon.
- **Fix (revised):** no real-data import in tests (repo convention) — added to `RoleIcon.test.tsx`
  instead: for every `LOGO_BY_EVENT_ID` key, build a `TimelineEvent` mock with that id, assert the
  mapped logo renders. Catches a broken lookup, not a real-JSON rename — accepted trade-off.

### 20. Four unused exports ("don't export until imported externally")

- **Rule:** code-style.md — _"Don't export a type/interface/const until another file actually imports it, including component Props types."_
- `matchSkill.ts:13` — zero external importers (doc comment says "not used by runtime UI code"); keep only if intentionally reserved for future data-entry use, else delete.
- `errorBoundary/index.ts` — resolved by fix #1 (wiring it up gives it a real importer).
- `Section.tsx:5` (`SectionProps`) — no external importer; drop the `export` keyword.
- `roleIcons/index.ts:1` (`ROLE_ICONS`) — `Resume.tsx` only imports `pickRandomRoleIcon`/`RoleIcon`; drop `ROLE_ICONS` from the barrel (check `RoleIcons.constants.test.ts`'s import path first in case it needs the barrel).
- Re-grep at implementation time — don't act on stale info.

---

## Progress (Part 3 implementation)

Branch: `part-3-latent-fixes` (off `part-2-cleanup-fixes`). One commit per item.

- [x] 21 — Repeated `skill` params instead of comma-joining
- [x] 22 — `pubDate` ISO-prefix format guard
- [x] 23 — `computeShadeColour` negative-index normalisation
- [x] 24 — `calculateSkillYears`'s `today` default: one-line comment

Part 3 complete.

---

## Part 3 — Lower-confidence / latent items

Verified-PLAUSIBLE-but-dormant items and unverified single-source candidates. Leads to spot-check, not confirmed bugs.

### 21. Comma in a skill name would break `?skill=` round-trip (verified PLAUSIBLE, latent)

- **Where:** `TimelineEventCard.tsx:120-122`, `Skills.helpers.ts:16-17`
- `encodeURIComponent` + `.join(',')` then `.split(',')` — `URLSearchParams.get()` decodes `%2C` back to a literal comma first, so a skill name with a comma would mis-split. **Checked: no current skill/tech-stack name has a comma** — not live.
- **Fix:** switched to repeated `skill` params (`?skill=React&skill=TypeScript`). Also fixed
  `reorderFilterParams`'s carry-over loop, which used `.set()` (collapses repeated keys to the
  last one) — now `.append()`.

### 22. `parseArticlesFeed` assumes `pubDate` is always ISO-prefixed (verified PLAUSIBLE, not live)

- **Where:** `parseArticlesFeed.ts:14`, `parseArticlesFeed.helpers.ts:8-13`
- `isRssFeedItemShape` only checks `typeof === 'string'`, not format. **Checked: existing test fixtures confirm rss2json's actual format matches today.**
- **Fix:** added a regex check for the expected ISO-date prefix in `isRssFeedItemShape`.

### 23. `computeShadeColour` breaks on negative `shadeIndex` (verified PLAUSIBLE, unreachable)

- **Where:** `computeShadeColour.helpers.ts:21`
- JS `%` preserves sign → `NaN` downstream for negative input. **Checked: only caller (`skillShadeIndex`) always produces non-negative values.** Not reachable today.
- **Fix:** `((shadeIndex % len) + len) % len` normalisation.

### 24. Unverified single-source cleanup candidates (spot-check before acting)

- ~~`Skills.tsx:72-106` URL-param closures~~ → **approved, see Part 0.7** (upgraded to a full `useSkillSearchUrl` hook, not just a write-helper).
- ~~`SkillsBarChart.tsx:44-91` `CategoryPatternDefinition`~~ → **approved, see Part 0.5**.
- ~~`SkillItemsList.tsx:75` default prop~~ → **approved, see Part 0.4**.
- ~~`SkillsListView.tsx:51,74` hand-listed keys~~ → **approved, see Part 0.3**.
- ~~`SkillFilterBar.tsx:53` param rename~~ → **approved, see Part 0.1**.
- ~~`TimelineEventCard.helpers.ts:13` constant placement~~ → **approved, see Part 0.2**.
- ~~`calculateSkillYears.ts:18` `today` default~~ → **fixed, see #24 above** (one-line comment added).
- ~~`Skills.tsx:111` searchTerm dual state~~ → **superseded by Part 0.6** — user decided single-source is worth doing despite the documented keystroke-drop risk; `flushSync` resolves the risk. No longer "no action needed."

---

## Verification

- No automated test/lint/build runs by the assistant — user runs typecheck/lint/tests.
- Walk through fixes one at a time: implement → user reviews/tests → next fix.
- Suggested order: Part 0 (approved batch, 0.1-0.5 first as small/independent, then 0.6+0.7
  together as one combined `Skills.tsx` change since 0.7's hook subsumes 0.6), then Part 1
  (1-10), then Part 2 if time allows, Part 3 last/optional.
