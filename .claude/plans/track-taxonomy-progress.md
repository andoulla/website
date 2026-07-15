# Progress — ATS skill taxonomy + 3-track resume tabs

Plan: [track-taxonomy.md](track-taxonomy.md) · Mapping: [track-taxonomy-mapping.md](track-taxonomy-mapping.md)
Taxonomies: [em](track-taxonomy-em.md) · [swe](track-taxonomy-swe.md) · [full](track-taxonomy-full.md)
Started: 2026-07-13

## Status

| Branch                             | Steps | Status                                                                                                                                                        |
| ---------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~`feat/00-deep-linking`~~         | 0     | ❌ dropped by user — empty-state rejected; branch deleted                                                                                                     |
| `feat/01-data-foundations`         | 1–3   | ✅ MERGED to main 2026-07-14 (fast-forward push, no PR — user request)                                                                                        |
| `feat/02-tracks-and-context`       | 4–5   | ✅ COMPLETE + feedback fixes, pushed `5d6b224` — track data (`f9f376c`), track context + App mount (`da7e401`), feedback fixes (`e24b1d2`); PR not opened yet |
| ``feat/03-join-skill-objects`      | 6     | ✅ MERGED to main 2026-07-15 (fast-forward push `2bf8d1d`, no PR — user request)                                                                              |
| `feat/04-skills-view-tracks`       | 7     | ✅ MERGED to main 2026-07-15 (fast-forward push `4f09efe`, no PR — user request); incl. palette contrast fixes                                                |
| `feat/05-resume-tabs-cleanup-docs` | 8–11  | ✅ COMPLETE, pushed `3fbee57` — one final branch covering steps 8–11 + all carry-forwards (user request); full suite green (pre-commit hook); not yet merged  |

## Decisions log (recent)

- 2026-07-14: feat/01 merged to main by fast-forward push (`git push origin feat/01-data-foundations:main`), no PR — user asked to "merge feat-01 first" then continue.
- 2026-07-14: Full taxonomy approved with amendments — kept separate: Team Onboarding, Enzyme, Flow, Kibana, Testing Strategy, Error Handling≠Error Monitoring. Canonicals: Estimation & Planning (syn Sprint Planning), Technical Direction (syn Technical Strategy), Roadmap Planning (syn Roadmapping/Project Planning), Documentation (syn Confluence/Notion), Error Monitoring (syn Sentry). Dropped: Software Development, Team Operations.
- 2026-07-14: unmapped skills (jobIds []) stay in taxonomy but don't render on graphs/bars — NO min-jobIds validation.
- 2026-07-13: no "No recommendations yet." empty state in tooltip.
- Plan files live in repo `.claude/plans/` (user request), committed.

## Blocked on user

- [x] ~~Drop `stash@{0}`~~ — already gone (stash list empty, 2026-07-15)
- [x] ~~Elsevier/Capco tech stack~~ — moved back to a TODO comment in App.tsx (user request)
- [x] ~~Open PR for feat/02~~ — moot: feat/02 commits reached main via the feat/03/04 fast-forward merges

## feat/05 handoff (COMPLETE — steps 8–11 + carry-forwards, pushed 2026-07-15)

Branch `feat/05-resume-tabs-cleanup-docs` from origin/main `6ad5b7a`. Commits:

1. `c2bdd4b` fix: stabilise setTrackId identity — TrackContextProvider routes trackId/setSearchParams
   through refs (updated in useEffect); `setTrackId` is `useCallback([])`, guard intact; identity test added.
2. `53160d5` feat: add resume track tabs with per-track filtering —
   NEW `src/utils/filterEventsByTrack/` (keeps events; narrows responsibilities/techStack/skills;
   empty responsibility skillIds = universal) + NEW `src/utils/deriveSkillCategoryMap/`
   (`Map<skillId, TrackCategoryRef {id,name,index}>`). Resume.tsx: MUI Tabs (scrollable,
   sm+ centred via flexContainer sx) between heading and Work Experience; tabpanel Box wired
   aria-labelledby/id; CareerTimeline filters via filterEventsByTrack; roleIcons keyed by event id
   off UNFILTERED history. TimelineEventCard: takes `track: Track` PROP (fixture-driven tests,
   NOT useTrackContext); groupSkillsByCategory(skills, track) via deriveSkillCategoryMap (largest
   group first, ties = track order, off-track skills skipped); chip colour
   categoryColourFromIndex(category.index); skill links append `&track=`; section order now
   responsibilities → techStack → skills → recommendations (tech-stack carry-forward folded in);
   compact bare-card variant (CardHeader only, py 0.5, no recommendations) when all three empty.
3. `db00812` feat: preserve track across nav links — NavBar reads `?track=` via useSearchParams +
   isTrackId (NOT useTrackContext — renders on /articles outside provider); Home/Skills links carry
   it, Articles stays plain. App.test hrefs now `/?track=full`, `/skills?track=full`.
4. `d9c3451` feat: resolve skill deep links through synonyms — Skills.tsx maps `?skill=` params
   through matchSkill → canonical names (unresolved dropped); Resume resolves once to canonical id,
   card prop renamed `highlightedSkill` → `highlightedSkillId` (id-only match); matchSkill doc
   comment updated (now runtime). Tests: synonym scroll tests in both views ('reactjs', 'JavaScript').
5. `8261695` refactor: drop legacy skill taxonomy fields — deleted `src/utils/skillCategory/`;
   skillColour lost `skillCategory()`/`skillColour()`/`SKILL_CATEGORY_MAP`/`CATEGORY_COLOUR_MAP`
   (+ its skills.json import — skillColour is now data-free); `Skill` type/json/builder lost
   `category`/`subCategory` (+ SkillCategory/SkillSubCategory types); skills.ts lost the
   category/subCategory validation.
6. `3fbee57` docs: update claude.md and readme for track taxonomy — routes (+`?track=`), data-flow
   diagram (skills.json + tracks/\*.json + TrackContextProvider), contexts table row, directory
   layout (new utils, tracks/, −skillCategory); README pages/features/scripts (+`yarn draft:mappings`).

Suite: full run green at every commit (pre-commit hook). NOT merged to main yet.

## Next up

Code-review carry-forwards (2026-07-14 review of feat/02; setTrackId same-value guard already fixed on feat/02):

- [x] ~~stabilise `setTrackId` identity~~ — done on feat/05 (`c2bdd4b`).
- [x] ~~don't lose the track on plain navigation~~ — done on feat/05 (`db00812`).
- [x] ~~tech stack directly above skills section~~ — done on feat/05 (folded into `53160d5`).
- [x] ~~feat/04 palette sync test~~ — superseded: `categoryColourFromIndex` falls back to `'default'` grey past the 7-slot palette (unlimited categories allowed); patterns cycle by index.

### feat/04 handoff (what exists now)

- `SkillSummary` reshaped (`src/utils/calculateSkillYears/calculateSkillYears.types.ts`): `{ id, skill, years, categoryId, categoryName, categoryIndex, subCategoryId, subCategoryName, colour, synonyms, jobIds, recommendationIds, companyYears }`. `skill` key kept — charts bind `dataKey="skill"`.
- `calculateSkillYears(careerHistory, track, allSkills = defaultSkills, today = new Date())` — iterates `track.categories` (with index) → subCategories → skillIds; skips skills missing from `allSkills` or with 0 years; order = track category order, then years desc within category; `colour: categoryColourFromIndex(categoryIndex)`.
- `src/utils/skillColour/`: `CUSTOM_COLOUR_HEX` is per-mode `{ light, dark }` for 7 colours (teal, green, plum, brown, gold, indigo, berry); `CATEGORY_COLOUR_PALETTE` (7 slots); `categoryColourFromIndex(i)` → palette[i] ?? 'default'; `resolveSkillColourMain` picks hex by `theme.palette.mode`, grey[400] for 'default'. `SkillColour = CustomSkillColour | 'default'` (MUI names GONE — Tag.tsx last branch only ever sees 'default'/undefined now). LEGACY kept for resume card until feat/06: `skillCategory()`, `skillColour()`, `CATEGORY_COLOUR_MAP` (quality-performance remapped 'success'→'green').
- `src/utils/skillCategory/` trimmed to `CATEGORY_LABELS` + `CATEGORY_ORDER` (resume card only); helpers file + SUBCATEGORY_LABELS/SUBCATEGORIES_BY_CATEGORY/isSkillCategory/isSkillSubCategory deleted.
- NEW `src/utils/derivePresentCategories/`: `(skills: SkillSummary[]) => PresentCategory[]` where `PresentCategory = { id, name, index, colour }`; dedupe by categoryId, sort by index.
- `filterSkillsByCategory(skills, selectedCategories: string[], selectedSubCategories: string[])` — matches `categoryId`/`subCategoryId`.
- `src/context/track/index.ts` barrel now exports `useTrackContext` + `TRACK_PARAM`.
- `Skills.tsx`: `useTrackContext()`; parsers `parseCategoryIds/parseSubCategoryIds(raw, track)` wrapped in `useCallback([track])` (useSkillSearchUrl memoizes on parser identity); `subCategoriesByCategory: Record<string, SkillFilterOption[]>` from track ∩ present summaries.
- `reorderFilterParams` prefix order: `track, view, category, subCategory`.
- `SkillsViewContext` gained `track: Track` (provided by Skills.tsx) — SkillsListView groups via context track, NOT useTrackContext (keeps tests fixture-driven).
- `SkillFilterBar` props in `SkillFilterBar.types.ts`: `SkillFilterOption = { id, name }`; all selections `string[]` ids.
- Radar: `CategoryRadarPoint = { categoryId, categoryIndex, label, avgYears, skillCount, isMatch }`; dot colour `categoryColourFromIndex(point.categoryIndex)`; `CategoryLegend` takes `PresentCategory[]`.
- Bar chart: `CATEGORY_PATTERN_ORDER` (7: diagonal, crosshatch, dots, vertical, grid, horizontal, rings) cycled via `getCategoryPatternType(categoryIndex)`; pattern ids keyed by category id; legend/table from `categoryName`.
- `SkillTooltipContent`: renders `skill.subCategoryName`; links append `&track=${trackId}` via `useTrackContext` (components→context import is legal); its tests + SkillItemsList tests wrap `TrackContextProvider` inside MemoryRouter.
- `SkillSummary` builder reshaped to match (defaults: id 'react', categoryId 'frontend-development'/'Frontend Development'/index 0, subCategoryId 'core-technologies'/'Core Technologies', colour 'teal') — aligned with the Track builder default.
- Real track category ids (for tests): full = leadership-delivery, frontend-development, backend-development, data-storage, architecture-design, engineering-practices-quality, tools-development-workflow; lead has javascript-stack etc., NO frontend-development (used for the stale-param test).
- Suite: 431 tests green at `ad618e3`.

### feat/02 handoff (what exists now)

- `src/types/track.ts`: exports `TrackId` (`'lead' | 'senior-engineer' | 'full'`) + `Track`; `TrackCategory`/`TrackSubCategory` interfaces exist but are deliberately UNexported (code-style: no exports until imported) — export them when a consumer needs them.
- `src/data/tracks/{lead,senior-engineer,full}.json`: lead 71 skills/5 cats, senior-engineer 79/5, full 113/7 (covers all of skills.json). Labels: "Lead / Engineering Manager", "Senior Engineer", "Full". Canonical renames applied (estimation-planning, technical-direction, roadmap-planning, documentation; agile-delivery, cross-functional-collaboration, design-patterns absorb their merge sources).
- `src/data/tracks.ts`: exports `tracks: Track[]` (tab order lead, senior-engineer, full), `TRACK_IDS`, `isTrackId`. Runtime throws (doMock-tested in `tracks.test.ts`, 8 tests): unrecognised/duplicate track id, duplicate category/subCategory id per track, unknown skillId, skillId twice per track, full-track-misses-a-skill. **Removed** MAX_TRACK_CATEGORIES validation — tracks can now have unlimited categories; default fallback colour added in feat/04.
- `src/context/track/`: `TrackContextProvider` + `useTrackContext` (both exported from the .tsx; barrel `index.ts` exports ONLY the provider so far — add `useTrackContext` to it when feat/03+ consumes it). `TrackContextProvider.types.ts` (renamed from .type.ts per code-style rule): `TRACK_PARAM = 'track'`, `DEFAULT_TRACK_ID = 'full'`. Normalises missing/invalid `?track=` to `?track=full` via replace; `setTrackId` writes the param, early-returns on the already-active id (no junk history entry). 6 tests.
- `src/App.tsx`: TrackContextProvider wraps CareerDataContextProvider inside the ErrorBoundary route element (articles route excluded); the 4 TODO comments deleted.
- `src/testing/Track` builder (default: id `full`, label `Full`, two categories: `frontend-development` → `core-technologies` → `['react']`, `backend-development` → `server-side` → `[]`); exported from testing barrel.
- Suite: 427 tests green at `5d6b224` after feedback fixes.

### Feedback fixes applied (2026-07-14)

- Track id rename: `em` → `lead`, `senior-swe` → `senior-engineer`
- Track labels: "Lead / Engineering Manager", "Senior Engineer"
- Consistent `.types.ts` naming: renamed `CareerDataContextProvider.type.ts`, `ThemeContextProvider.type.ts`, `TrackContextProvider.type.ts`, `SkillsViewContext.type.ts` (all now `.types.ts`); updated code-style.md rule
- Removed `MAX_TRACK_CATEGORIES` validation — tracks can now have unlimited categories (fallback colour to be added in feat/04)
- Updated Track test builder to have two categories
- Shortened verbose comment in TrackContextProvider.tsx per code-style (comments should be short, WHY-focused)

### feat/01 chunk 3 — responsibilities (pushed `9739f00`)

- careerHistory.json: 30 bullets → `{ id: "<jobId>-rNN", text, skillIds (sorted) }`; education bullets `skillIds: []` (universal). Mapping authored via draft report (0.35) + semantic merge — frozen now.
- skills.json: 34 skills gained bullet-derived jobIds (union with carried; careerHistory order). MEAN-stack bullet gave nodejs/expressjs/mongodb/rest-apis/api-design/server-side-development capco evidence.
- New `src/types/responsibility.ts`; `TimelineEvent.responsibilities: Responsibility[]`; barrel updated.
- `careerHistory.ts`: duplicate responsibility id + unknown skillId throws (imports `./skills`, one-directional).
- New `src/testing/Responsibility` builder; TimelineEvent builder signature updated; card test + careerHistory tests updated (412 tests green).
- TimelineEventCard: `.text` render + `length > 0` section guard (education entries all have bullets, so no visible change yet).

## Handoff notes

### Session/workflow facts

- Worktree: `/Users/mariandi/projects/website/.claude/worktrees/track-taxonomy`; deps installed; pre-commit hook runs eslint+prettier+full jest.
- gh CLI NOT authenticated — user opens PRs; give copy-pastable PR summary per push.
- Commits: conventional + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

### feat/01 chunk 1 — draft script (pushed `11f6383`)

- `scripts/draft-skill-mappings.mjs` — report-only, `yarn draft:mappings [--threshold=0.5]`, output gitignored `scripts/output/draft-mappings.json`. Deterministic (verified). Migration-tolerant (skill.id fallback slugify; responsibilities string|object).
- CLAUDE.md gained "Skill mappings are frozen" section.

### feat/01 chunk 2 — skills.json migration (this session)

- `src/data/skills.json`: **113 skills**, Full-taxonomy order, each `{ id, name, category(OLD temp), subCategory(OLD temp), type, synonyms, jobIds, recommendationIds }`. Old category/subCategory values kept temporarily so the app renders unchanged until feat/04; die in feat/06.
- Old→new mapping per [track-taxonomy-mapping.md](track-taxonomy-mapping.md); all old names are synonyms; jobIds/recIds carried (unions sorted alphabetically; jobIds in careerHistory order: atom, moo, elsevier, capco).
- `skills.types.ts`: `Skill` gained `id: string` (still in src/data — move to src/types deferred to feat/03 when the join changes).
- `skills.ts`: `RawSkill` input type (`id?`), missing-id throw, `assertUniqueIdentity` (duplicate id + cross-skill name/synonym collision, case-insensitive, self-overlap allowed).
- `src/testing/Skill`: `id` setter + `id: 'react'` default.
- `skills.test.ts`: +4 tests (missing id, duplicate id, synonym collision, self-overlap ok); existing mocks gained ids.
- Deep links with old names (`?skill=JavaScript`) break until feat/06 matchSkill step — known mid-stack state.
