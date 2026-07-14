# ATS-friendly skill taxonomy + 3-track resume tabs

## Context

- Goal: ATS-optimised categories/subcategories/skills, supplied as 3 markdown trees (EM/Lead, Senior SWE, Full).
- Resume gets 3 tabs (EM/Lead, Senior SWE, **Full = default**) over the same timeline; role tabs **hide** non-relevant responsibilities/skills.
- Skills view becomes track-aware, synced via `?track=` URL param.
- Each responsibility is matched to skills once; per-track relevance is **derived** (see mapping rule below).
- Kills the TODOs at [src/App.tsx:18-21](src/App.tsx#L18-L21).

## Decisions (locked with user)

- **Data shape**: canonical `skills.json` + 3 per-track taxonomy files.
- **Type name**: `Track` (not Profile) — `TrackId = 'em' | 'senior-swe' | 'full'`, param `?track=`, `TrackContextProvider`.
- **Third tab**: `full` (id), label "Full" — the complete, unfiltered picture; **default tab**, `?track=` omitted for it.
- **Responsibilities**: inline `{ id, text, skillIds }` in careerHistory.json; empty `skillIds` = universal (shown in every track).
- **Role tabs**: hide non-relevant content. Full shows everything.
- **Education**: always visible in all tabs, no toggle (its responsibilities have empty `skillIds`).
- **`type: 'tech' | 'skill'` stays on the skill** — tech stack and skills are distinct concepts; card keeps separate "Tech Stack" (comma-line) and "Key Skills" (chips) sections.
- **Category/subcategory ids**: explicit kebab-case `id` + display `name` in track JSON (stable `?category=` deep links).
- **Colours**: by category **position** in track file, cycling fixed palette `['teal', 'success', 'plum', 'brown', 'gold']`. No colour data in JSON.
- **`?skill=` back-compat**: old display names preserved as synonyms; incoming params resolved via existing `src/utils/matchSkill/matchSkill.ts`.
- **Active track state**: URL is source of truth; new `TrackContextProvider` wraps both routes.
- **Semantic mapping, hybrid-authored (§3)**: an embedding script drafts scored suggestions (report only, never writes to `src/data/`); Claude cross-checks with its own semantic pass and applies the merged mapping inline; user reviews the diff. Committed mappings are **frozen** — remaps only touch new/changed content; arrays always sorted so nothing shuffles.

## Responsibility → track mapping rule (derived, no per-track data)

- Responsibility stores the skills it demonstrates once: `{ id: "atom-learning-2021-01-r03", text: "Led a team of 6...", skillIds: ["team-leadership", "mentoring-coaching"] }`.
- A track's skill set = union of all `skillIds` in its taxonomy file.
- **Shown in a track tab ⇔ `responsibility.skillIds ∩ track skillIds ≠ ∅`**, or `skillIds` is empty (universal).
- Full track contains every skill (enforced by data test) → everything shows there with zero special-casing.

## 1. Types — `src/types/`

Move skill types out of `src/data/skills.types.ts` (delete it) — layering: `TimelineEventWithRecommendations` will embed `Skill[]`, so `Skill` must live in `types`.

**New `src/types/skill.ts`:**

```ts
export type SkillType = 'tech' | 'skill';
export interface Skill {
  id: string; // kebab-case: 'javascript-es6', 'test-driven-development'
  name: string; // ATS name: 'JavaScript (ES6+)'
  type: SkillType; // tech → Tech Stack line; skill → Key Skills chips
  synonyms: string[]; // includes old display name for deep-link compat
  jobIds: string[]; // authored via §3 flow, then frozen
  recommendationIds: string[]; // authored via §3 flow, then frozen
}
```

**New `src/types/track.ts`:**

```ts
export type TrackId = 'em' | 'senior-swe' | 'full';
export interface TrackSubCategory {
  id: string;
  name: string;
  skillIds: string[];
}
export interface TrackCategory {
  id: string;
  name: string;
  subCategories: TrackSubCategory[];
}
export interface Track {
  id: TrackId;
  label: string;
  categories: TrackCategory[];
}
```

**New `src/types/responsibility.ts`:**

```ts
export interface Responsibility {
  id: string; // globally unique: 'atom-learning-2021-01-r03'
  text: string;
  skillIds: string[]; // authored via §3 flow, sorted; empty = universal
}
```

- `timelineEvent.ts`: `responsibilities: Responsibility[]`
- `timelineEventWithRecommendations.ts`: `techStack: Skill[]; skills: Skill[]` (was `string[]`)
- `index.ts` barrel: add all new exports

## 2. Data files — `src/data/`

- **`skills.json`**: one entry per skill `{ id, name, type, synonyms, jobIds, recommendationIds }` — drops `category`/`subCategory`. Populated from user's **Full** list.
- **`tracks/em.json`, `tracks/senior-swe.json`, `tracks/full.json`**: `{ id, label, categories: [{ id, name, subCategories: [{ id, name, skillIds }] }] }` — file order = display order (tabs: EM / Lead, Senior SWE, Full).
- **`careerHistory.json`**: responsibilities become objects; ids `${jobId}-r01`…; education responsibilities keep `skillIds: []`.

### Typed wrappers + validation

- **`skills.ts`** rewrite: drop VALID_CATEGORIES/SUBCATEGORIES, keep VALID_TYPES; add id uniqueness + duplicate name/synonym detection. Throw style: `` `skills.json: duplicate id "${id}"` ``.
- **New `tracks.ts`**: exports `tracks: Track[]`, `TRACK_IDS`, `isTrackId(value): value is TrackId`. Validates: category/subcategory id uniqueness, every `skillId` resolves against `skills`, no skillId twice within one track.
- **`careerHistory.ts`**: add responsibility id uniqueness (global) + `skillIds` resolve against `skills` (import `./skills` — one-directional, no cycle).
- Inverse direction (skill `jobIds`/`recommendationIds` resolve) validates in the join util (all 3 datasets in hand there).
- **Key data test** (`tracks.test.ts`): full track's skillId set === full skills.json id set → "Full shows everything" falls out of data, no code special-case.

### User-supplied content needed (blocking steps 1–4)

- [ ] Senior SWE + Full markdown lists (EM already provided)
- [ ] Old→new skill mapping (merges/splits; old names → synonyms)
- [ ] (from TODO [App.tsx:21](src/App.tsx#L21)) tech stack for Elsevier/Capco if desired

## 3. Semantic mapping — embedding draft script + Claude merge

Produces `responsibility.skillIds`, `skill.recommendationIds`, `skill.jobIds`. Hybrid flow, decided with user:

### 3a. Draft script — `scripts/draftSkillMappings.mjs` (report only, NEVER writes to `src/data/`)

- devDependency: **`@huggingface/transformers`** (Transformers.js v4 — HF-official, Apache-2.0, offline after first model download).
- `pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')` (pinned revision ⇒ deterministic output) embeds:
  - each responsibility text, each recommendation text
  - each skill as one string: `name + synonyms`
- Cosine similarity per (text, skill) pair; report every pair above threshold (~0.5, tunable via CLI flag), sorted by score.
- Output: `scripts/output/draft-mappings.json` (gitignored) — scored suggestions grouped per responsibility/recommendation.
- npm script `"draft:mappings"`. Rerun with same inputs + pinned model ⇒ identical report.

### 3b. Claude merge pass

- Claude runs its own semantic read of every bullet/recommendation, cross-checks against the script report (catches keyword-blind AND threshold-blind misses), and writes the merged mapping **inline** into `careerHistory.json` / `skills.json`.
- `skill.jobIds` derived during the merge: job has skill iff any of its responsibilities references it, plus explicit extras (e.g. Git used everywhere with no bullet).
- User reviews the diff; commit freezes the mapping.

### 3c. Frozen-mapping rules (add to CLAUDE.md so future sessions obey)

- Committed mappings are frozen: a remap only (re)maps **new or edited** bullets/recommendations; existing `skillIds`/`jobIds`/`recommendationIds` untouched unless the user names one to revisit.
- `skillIds`/`recommendationIds` sorted alphabetically; `jobIds` in careerHistory order — re-derived identical mappings produce a zero diff, nothing shuffles.
- Guarantee after any remap: `git diff` shows only lines for content the user added/changed.

## 4. Track context — `src/context/track/`

`TrackContextProvider.tsx` + `.type.ts` + `.constants.ts` (`TRACK_PARAM = 'track'`) + `index.ts` + test.

```ts
export interface TrackContextValue {
  track: Track;
  trackId: TrackId;
  setTrackId: (next: TrackId) => void;
}
```

- **`?track=` is always present** (user decision): on mount, if the param is missing or invalid, normalise to `?track=full` via `setSearchParams(..., { replace: true })` (no history entry). `setTrackId` always writes the param — no delete-when-default special case. One canonical URL shape; copy-link always captures full state.
- Mount in [src/App.tsx:47-49](src/App.tsx#L47-L49) around `<CareerDataContextProvider><Outlet /></>` (the `/articles` route doesn't need it). Delete TODOs lines 18–21.

## 5. Pipeline rework — `src/utils/`

**`loadCareerHistory/joinCareerHistoryWithRecommendations/`** — same signature; now returns full `Skill[]` for techStack/skills (split by `type`); throws on unresolvable `skill.jobIds`/`recommendationIds`.

**New `filterEventsByTrack/`:**

```ts
export const filterEventsByTrack = (
  events: TimelineEventWithRecommendations[],
  track: Track
): TimelineEventWithRecommendations[]
```

- Builds `Set` of track skillIds; filters each event's `responsibilities` (empty skillIds → keep), `techStack`, `skills`. Jobs/education events themselves always render. Identity transform for full (guaranteed by data test).

**`calculateSkillYears/`** ([current impl](src/utils/calculateSkillYears/calculateSkillYears.ts)):

```ts
calculateSkillYears(careerHistory: TimelineEvent[], track: Track,
  allSkills: Skill[] = defaultSkills, today: Date = new Date()): SkillSummary[]
```

- Iterate `track.categories` (with index) → subCategories → skillIds; reuse existing years/companyYears logic (lines 26–52); keep `years > 0` filter; order = track category order, then years desc (replaces `CATEGORY_ORDER.indexOf` sort at lines 56–60).
- `SkillSummary` reshape: `{ id, skill /* keep key — charts use dataKey="skill" */, years, categoryId, categoryName, categoryIndex, subCategoryId, subCategoryName, colour, synonyms, jobIds, recommendationIds, companyYears }`.

**`skillColour/`** — keep `resolveSkillColourMain`, `isCustomSkillColour`, `skillShadeIndex`. Remove `SKILL_CATEGORY_MAP`, `skillCategory()`, `skillColour()`, `CATEGORY_COLOUR_MAP`.

**7-slot palette, validated with the dataviz palette validator (both modes pass all checks: lightness band, chroma floor, CVD separation, 3:1 contrast on `#ffffff` / `#1e2128`):**

| Slot   | Light     | Dark      | Note                                                                                                                     |
| ------ | --------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| teal   | `#00897B` | `#00897B` | unchanged                                                                                                                |
| green  | `#2e7d32` | `#43A047` | replaces MUI `success` — its dark `#66bb6a` fails the lightness band                                                     |
| plum   | `#7B4B94` | `#8E5CAD` | dark variant lifts 3:1 contrast                                                                                          |
| brown  | `#9A5B2F` | `#9A5B2F` | re-saturated — old `#8D6E63` fails chroma floor (reads grey); safe to change since all categories are re-authored anyway |
| gold   | `#B08D1E` | `#B08D1E` | unchanged                                                                                                                |
| indigo | `#4E5FBF` | `#4E5FBF` | new                                                                                                                      |
| berry  | `#B03060` | `#C74A7B` | new; dark variant lifts contrast                                                                                         |

(Indigo + berry are the only open hue slots: the repo rule excludes red/orange/blue/grey (MUI semantics) and both theme primaries — olive `#3B6D11`, magenta-purple `#702963`.)

```ts
// skillColour.constants.ts — per-mode hexes; ALL 7 custom (MUI 'success' dependency dropped)
export const CUSTOM_COLOUR_HEX: Record<CustomSkillColour, { light: string; dark: string }> = { … };
export const CATEGORY_COLOUR_PALETTE: SkillColour[] = ['teal', 'green', 'plum', 'brown', 'gold', 'indigo', 'berry'];

// skillColour.helpers.ts — NO modulo cycling (duplicate hues are a dataviz anti-pattern);
// a data test caps every track at palette length, so the index is always in range
export const categoryColourFromIndex = (categoryIndex: number): SkillColour =>
  CATEGORY_COLOUR_PALETTE[categoryIndex];
// resolveSkillColourMain already receives theme → pick hex by theme.palette.mode
```

- `SkillColour` type simplifies: 7 custom names + `'default'` grey fallback (MUI-named colours gone).
- **Category cap test** (in `tracks.test.ts`, where importing across layers is fine): every track's `categories.length <= CATEGORY_COLOUR_PALETTE.length`. If the Full list needs an 8th category, fold the smallest into a neighbour — don't extend the palette (hue space against the exclusions is exhausted; verified with the validator).
- **Bar patterns**: extend to 7 in the same fixed order — existing `diagonal, crosshatch, dots, vertical, grid` + new `horizontal`, `rings` SVG defs; same cap test, no cycling.

**Delete `skillCategory/`** entirely (labels now come from track data). Replacements:

- **New `derivePresentCategories/`**: `(skills: SkillSummary[]) => PresentCategory[]` where `PresentCategory = { id, name, index, colour }` — dedupe by categoryId, order by categoryIndex.
- **New `deriveSkillCategoryMap/`**: `(track: Track) => Map<string, TrackCategoryRef>` (skillId → `{ id, name, index }`) — used by resume card grouping.

## 6. Resume tabs — `src/views/resume/`

**`Resume.tsx`:**

- MUI `<Tabs value={trackId} onChange={(_e, next: TrackId) => setTrackId(next)}>` between heading and "Work Experience" Section; one `<Tab>` per `tracks` entry (order: EM / Lead, Senior SWE, Full); **Full selected by default** (`?track=full`, normalised in on mount).
- `CareerTimeline`: `const visibleHistory = useMemo(() => filterEventsByTrack(careerHistory, track), [careerHistory, track])`. Highlight matching resolves `?skill=` through `matchSkill` (synonyms).

### Tabs accessibility (must not regress)

- `<Tabs aria-label="Resume track">`; each `<Tab id={`track-tab-${track.id}`} aria-controls={`track-panel-${track.id}`}>`.
- Timeline container: `role="tabpanel"`, `id={`track-panel-${trackId}`}`, `aria-labelledby={`track-tab-${trackId}`}`.
- Arrow-key navigation between tabs comes free with MUI Tabs; verify focus is not lost when panel content changes on switch.
- jest-axe assertions run against **each** tab's rendered state (not just default), including a role tab where content is hidden.

**`timelineEventCard/TimelineEventCard.tsx`:**

- Tech Stack: `event.techStack.map((skill) => skill.name).join(', ')` — separate section stays (tech ≠ skills).
- Responsibilities: add `length > 0` guard (mirrors Tech Stack guard at line 138); `BulletList items={responsibilities.map((responsibility) => responsibility.text)}`.
- Key Skills: `groupSkillsByCategory(skills: Skill[], track: Track)` in helpers via `deriveSkillCategoryMap`; group label = `category.name`; chip colour = `categoryColourFromIndex(category.index)`; `skillShadeIndex` unchanged.
- Skill links (`/skills?skill=…`) always append `TRACK_PARAM` (param is always present).
- **Bare cards collapse** (user decision): when a job ends up with zero visible responsibilities, skills, AND techStack in the active track, `TimelineEventCard` renders a **compact variant — primary information only** (company, title, duration, location; no section wrappers, no recommendations, reduced padding). Collapse condition computed from the already-filtered event; a card with any surviving section renders normally.

## 7. Skills view rework — `src/views/skills/`

**`Skills.tsx`** ([current](src/views/skills/Skills.tsx)):

- `calculateSkillYears(careerHistory, track)` memoized on `[careerHistory, track]`.
- `?category=`/`?subCategory=` now carry track category **ids**; parsers become track-aware (`parseCategoryIds(raw, track)`) — stale ids self-clean on track switch. **Gotcha**: `useSkillSearchUrl` memoizes on parser identity ([useSkillSearchUrl.ts:13](src/views/skills/useSkillSearchUrl/useSkillSearchUrl.ts#L13)) → wrap in `useCallback([track])`.
- `highlightedSkills`: resolve each `?skill=` via `matchSkill`, drop unresolved.
- Filter-bar `categories`/`subCategoriesByCategory` from active track ∩ present summaries (replaces lines 121–133).
- `reorderFilterParams` in `Skills.helpers.ts`: prefix order `track, view, category, subCategory`.

### Knock-on changes (type reshapes propagating)

- `SkillsViewContext.type.ts`: `selectedCategories/selectedSubCategories: string[]`.
- `filterSkillsByCategory`: match on `categoryId`/`subCategoryId`.
- `SkillFilterBar` props: `{ id, name }[]` shapes; labels from `.name`.
- `SkillsListView`: group by iterating `track.categories` → subCategories, pick summaries by ids; keep empty-group pruning + single-subcategory flattening; drop `createEmptyByCategory`.
- Radar: `derivePresentCategories`; `aggregateSkillsByCategory` matches `category.id`; dot colour via `categoryColourFromIndex(point.categoryIndex)`.
- Bar chart: legend from `PresentCategory[]`; patterns → `CATEGORY_PATTERN_ORDER` array cycled by `categoryIndex` (replaces `Record<SkillCategory, …>` in `SkillsBarChart.constants.ts`).
- `src/components/skillTooltipContent/`: `SUBCATEGORY_LABELS[…]` → `skill.subCategoryName`; links (including the stash's "View on Resume"/recommendation links, landed in step 0 — §11) carry the track param.

## 8. Tests

- **Builders** (`src/testing/`): `Skill` (+`id`/`matchTerms`, drop category setters), `SkillSummary` (new id/category fields), `TimelineEvent` (`Responsibility[]`, `Skill[]`); **new** `Responsibility` + `Track` builders.
- **Data**: duplicate-id / unknown-skillId throws; full-track-covers-all-skills integrity test.
- **Utils**: join (Skill[] output, integrity throws), calculateSkillYears (track-driven, exclusion, ordering), filterEventsByTrack (universal rule, full-track identity), derivePresentCategories, deriveSkillCategoryMap, colour cycling, id-based filterSkillsByCategory.
- **Views**: Resume (tabs render, Full default, tab switch hides responsibility/chip + sets `?track=`, jest-axe per tab), TimelineEventCard (objects, zero-responsibility guard, track links), Skills (`?track=` drives taxonomy, stale category param dropped, synonym-resolved `?skill=`). Components using `useTrackContext` need `MemoryRouter` + provider in tests.
- **Draft script**: not Jest-tested (outside `src/`, report-only); the data tests above catch broken references in whatever gets committed.
- Per CLAUDE.md: **user runs all verification** — no test/lint/typecheck runs in implementation.

## 9. Docs updates

### CLAUDE.md

- **Routes table**: `/` gains `?track=<id>` (tab deep-link) alongside existing `?skill=`/`?recommendation=`; `/skills` gains `?track=`.
- **Data flow diagram**: already stale (claims skills derive from `TimelineEvent.skills`/`techStack` and "no dedicated data file") — rewrite: `careerHistory.json + recommendations.json + skills.json` → loader → context; `tracks/*.json` → `TrackContextProvider` → per-track filtering/taxonomy.
- **Contexts table**: add `TrackContextProvider` / `useTrackContext()` row (`{ track, trackId, setTrackId }`).
- **Directory layout**: add `src/data/tracks/`, `src/context/track/`, new utils (`filterEventsByTrack`, `derivePresentCategories`, `deriveSkillCategoryMap`); remove `skillCategory` mention; update `calculateSkillYears` description (track-driven).
- **New section: frozen-mapping rules** (§3c) — so future sessions never reshuffle committed mappings.

### README.md

- **Pages → Resume**: describe the 3 track tabs (EM / Lead, Senior SWE, Full default), per-track hiding of responsibilities/skills, education always visible.
- **Pages → Skills**: rewrite the taxonomy sentence — categories/subcategories now come from the active track's file; the "falls back to the tooling category colour" claim dies with `skillCategory()`; mention `?track=`.
- **Features & interactions → Resume**: new bullet for tabs + that chip links carry the track. **→ Skills**: filters/grouping reflect active track; copy-link includes track.
- **Available scripts**: add `yarn draft:mappings` (report-only, gitignored output).

## 10. Edge cases & potential bugs

### Data & taxonomy

- **>5 categories in a track**: ✅ addressed in §5 — palette and patterns extended to 7 validated slots (indigo + berry added, brown re-saturated, MUI success replaced with per-mode green), **no cycling** (fixed-order assignment per dataviz rules), and a cap test asserts every track fits the palette. An 8th category means folding the smallest into a neighbour, not a new hue — the usable hue space is exhausted (validator-verified against the repo's exclusion rules).
- **Merged skills**: two old skills → one new one puts both old names in `synonyms`. Validation must distinguish legit multi-synonym skills from real collisions (a synonym equal to _another_ skill's name/synonym → throw).
- **Skill with no jobIds after mapping**: dropped by the `years > 0` filter → present in taxonomy but never renders, silently. Add `skills.ts` validation: every skill must end with ≥1 `jobId` (overrides cover "Git everywhere").
- **Overlapping jobs sharing a skill**: years double-count (sum of durations, not merged intervals) — existing behaviour, more visible now skills span more jobs. Accept + document in CLAUDE.md, or merge intervals later.

### URL params

- **`?track=` missing or invalid**: normalised to `?track=full` on mount with a `replace` navigation (no history entry, no churn) — param is always present, one canonical URL shape (§4).
- **Highlight not in active track** (`/?skill=React&track=em` where React ∉ EM): no auto-track-switch; highlight silently no-ops (no crash, no scroll). Same on `/skills` — the empty/highlight states must tolerate an unmatched skill.
- **Names with `+`/`&`/parens**: "JavaScript (ES6+)" — a raw `+` in a hand-typed query decodes to a space. Programmatic links are safe (`URLSearchParams` percent-encodes), but `matchSkill` should normalise (trim, collapse whitespace, case-insensitive) so `?skill=javascript (es6 )` still resolves.
- **Category id shared across tracks** (e.g. `testing` in EM and SWE): survives a track switch by design — parsers only drop ids unknown to the _new_ track.

### Rendering & state

- **Bare cards in role tabs**: ✅ addressed in §6 — fully-bare jobs (no responsibilities/skills/techStack after filtering) collapse to a compact primary-info-only card; partially-bare cards keep per-section `length > 0` guards so no empty `Section` renders.
- **Index-based keys/scroll**: `firstMatchingIndex` and card refs must key on **event id**, not array index — filtering changes indices per tab and index keys cause remount/scroll jank on switch.
- **Auto-scroll on tab switch**: the `?skill=` scroll effect must not re-fire on every track change unless a highlight param is present.
- **Radar with <3 categories**: a track (or filter state) with 1–2 categories degenerates the radar polygon — check `SkillsRadarChart` behaviour and reuse the existing empty-state fallback if needed.
- **Suspense/promise identity**: track switching must never re-create the career-data promise (it lives in `CareerDataContextProvider` state); `filterEventsByTrack` runs on resolved data, and the `track` object from module-level `tracks` is referentially stable → memos are safe.
- **Focus loss**: a focused chip that disappears on tab switch drops focus to `<body>`. Low risk (switch happens via the tab, which holds focus), but jest-axe + a manual keyboard pass should cover it.

### TypeScript & tests

- **JSON widening**: `tracks/em.json` infers `id: string`, not `TrackId` — the `tracks.ts` wrapper must validate + narrow (same pattern as `skills.ts` `type`).
- **Case-insensitive `matchSkill`**: hand-typed `?skill=react` should still resolve.
- **Parser identity in `useSkillSearchUrl`**: track-bound parsers must be `useCallback`-wrapped on `[track]` or param state goes stale (noted in §7, repeated here because it's the likeliest real bug).

## 11. Finish the skill deep-linking WIP first (`stash@{0}`)

The stash (`wip: skill deep-linking`) touches `SkillTooltipContent`, `ContactDetails`, `SkillItemsList` — the same files steps 7–9 rework. Landing it **first** avoids rebasing stashed diffs onto reshaped code; later steps then adapt its links (track param, new `SkillSummary` fields).

- **Confirm with user before `git stash pop`** (standing instruction), on a clean tree.
- Contents to finish: `SkillTooltipContent` "View on Resume" (`/?skill=<name>`) + recommendation count/link (`/?recommendation=<id>`, "No recommendations yet." empty state) + MemoryRouter test wrapping; `ContactDetails` Medium link + test; `SkillItemsList` drops `onItemClick` (navigation moves into tooltip links, tooltip shows on keyboard focus).
- Finish = pop, sweep for leftover `onItemClick` prop passing in callers, complete tests, land as two commits (Medium link is separate concern): `feat: add medium contact link`, `feat: link skills to resume from tooltip`.
- Later integration (already in §7): tooltip links gain the track param; `SUBCATEGORY_LABELS` usage inside it migrates to `skill.subCategoryName`.

## 12. Implementation order (conventional-commit-sized)

0. **Land the deep-linking stash** (§11) — confirm before popping; two commits
1. `feat: add ids and ats names to skills data` — skills.json + `types/skill.ts` (temp-keep category fields), skills.ts validation, builder, tests _(needs user content)_
2. `feat: add skill mapping draft script` — `scripts/draftSkillMappings.mjs`, `@huggingface/transformers` devDependency, `"draft:mappings"` npm script, gitignore `scripts/output/`; frozen-mapping rules added to CLAUDE.md
3. `feat: restructure responsibilities as objects with skill ids` — types, careerHistory.json (ids by hand; skillIds via §3 draft+merge flow) + .ts validation, card `.text` mapping + guard, builders, tests
4. `feat: add track taxonomy data` — `types/track.ts`, 3 JSONs under `src/data/tracks/`, `tracks.ts`, builder, tests _(needs user content)_
5. `feat: add track context synced to url` — `context/track/`, App.tsx mount + TODO cleanup
6. `feat: join full skill objects into career history` — join returns `Skill[]` + integrity throws, type ripple, minimal card shims
7. `feat: make skills view track-aware` — calculateSkillYears + SkillSummary reshape, colour-by-index, derivePresentCategories, id-based filtering, Skills.tsx + filter bar + all 3 views + tooltip
8. `feat: add resume track tabs with per-track filtering` — filterEventsByTrack, deriveSkillCategoryMap, tabs + a11y wiring, card grouping/links
9. `feat: resolve skill deep links through synonyms` — matchSkill runtime use in both views
10. `refactor: drop legacy skill taxonomy fields` — remove category/subCategory from skill data/type, delete `skillCategory/`, prune dead colour code + builder setters
11. `docs: update claude.md and readme for track taxonomy` — everything in §9 (CLAUDE.md frozen-mapping rules land earlier, in step 2)

## 13. Delivery workflow (user requirements)

### Worktree + stacked branches

- All work happens in a **git worktree** (via EnterWorktree at implementation start) — `main` stays clean throughout.
- **Stacked branches**, each based on the previous, one PR each, merged in order:

| Branch                           | Steps | Content                                                               |
| -------------------------------- | ----- | --------------------------------------------------------------------- |
| `feat/00-deep-linking`           | 0     | stash landing (two commits)                                           |
| `feat/01-data-foundations`       | 1–3   | skill ids/ATS names, draft script + CLAUDE.md rules, responsibilities |
| `feat/02-tracks-and-context`     | 4–5   | track JSONs + wrapper, TrackContextProvider                           |
| `feat/03-join-skill-objects`     | 6     | join returns `Skill[]`, integrity throws                              |
| `feat/04-skills-view-tracks`     | 7     | the big skills-view rework                                            |
| `feat/05-resume-tabs`            | 8     | tabs, filtering, collapsed cards                                      |
| `feat/06-deeplinks-cleanup-docs` | 9–11  | synonym resolution, legacy removal, docs                              |

### Work tracking (multi-day)

- Progress file: `.claude/plans/track-taxonomy-progress.md`, updated **after every commit and push** — never left stale.
- Structure: status table (branch → done / in-progress / blocked-on-user), per-branch handoff notes, "next up" pointer. At any moment "what was done, what's left" is answerable from this file alone.

### Context hygiene (per user instruction)

- **After each branch is pushed**: write the handoff notes for the _next_ branch into the progress file — exact file paths touched, changed signatures/types, decisions made, gotchas hit — i.e. everything needed so the next session does **not** rescan the repo.
- Then tell the user the branch is pushed and it's **safe to `/clear` or `/compact`** (context clearing is user-triggered; I prompt, you clear).
- A fresh session bootstraps from exactly two files: this plan + the progress file. If a handoff note is missing something, that's a bug in the previous session's handoff — fix the note, don't normalise rescanning.

## 14. Verification (user-run)

- Deep-linking (from stash): tooltip "View on Resume" and recommendation links navigate + highlight correctly; `SkillItemsList` rows no longer navigate on click; Medium link in ContactDetails.

- `/` → normalises to `/?track=full` (replace, no history entry), **Full tab selected**, all content visible; tabs switch → `?track=em` etc.; non-relevant responsibilities/chips disappear on role tabs; fully-bare jobs collapse to compact cards; education always present.
- Keyboard: arrow keys move between tabs, focus retained on switch; axe clean on every tab.
- Chip click from EM tab → `/skills?skill=…&track=em` shows EM taxonomy with skill highlighted.
- `/skills` → track param drives categories/grouping/colours in list, radar, bar views; filter bar reflects active track; switching track drops stale category filters.
- Old deep link with pre-migration skill name (e.g. `?skill=React`) still resolves via synonyms.
- `yarn draft:mappings` twice in a row → identical report both times; `git status` confirms nothing under `src/data/` changed.
- Colours: eyeball chips + all 3 chart views in light AND dark mode (both themes) — 7 distinct category colours, no grey-looking brown, plum/berry readable on the dark surface.
- Full suite: `yarn test`, lint, typecheck — run by user.
