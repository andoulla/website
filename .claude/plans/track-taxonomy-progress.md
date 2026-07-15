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
| `feat/05-resume-tabs-cleanup-docs` | 8–11  | 🔨 IN PROGRESS — user asked for ONE final branch covering steps 8–11 + all carry-forwards ("lets do the last branch, make sure all todos are completed")      |

## Decisions log (recent)

- 2026-07-14: feat/01 merged to main by fast-forward push (`git push origin feat/01-data-foundations:main`), no PR — user asked to "merge feat-01 first" then continue.
- 2026-07-14: Full taxonomy approved with amendments — kept separate: Team Onboarding, Enzyme, Flow, Kibana, Testing Strategy, Error Handling≠Error Monitoring. Canonicals: Estimation & Planning (syn Sprint Planning), Technical Direction (syn Technical Strategy), Roadmap Planning (syn Roadmapping/Project Planning), Documentation (syn Confluence/Notion), Error Monitoring (syn Sentry). Dropped: Software Development, Team Operations.
- 2026-07-14: unmapped skills (jobIds []) stay in taxonomy but don't render on graphs/bars — NO min-jobIds validation.
- 2026-07-13: no "No recommendations yet." empty state in tooltip.
- Plan files live in repo `.claude/plans/` (user request), committed.

## Blocked on user

- [ ] Drop `stash@{0}`? (100% redundant now)
- [ ] Optional: Elsevier/Capco tech stack (its App.tsx TODO was deleted in feat/02 per plan — tracked only here now)
- [ ] Open PR for feat/02: https://github.com/andoulla/website/pull/new/feat/02-tracks-and-context

## feat/05 IN-PROGRESS handoff (written 2026-07-15, session low on credits)

Branch `feat/05-resume-tabs-cleanup-docs` created from origin/main `6ad5b7a` (local main was stale
at 2bf8d1d — already reset with `git reset --hard origin/main`). NOTHING implemented yet — repo
scan complete, all facts below verified this session. Planned commits, in order:

1. `fix: stabilise setTrackId identity` — TrackContextProvider.tsx: `setTrackId` currently
   `useCallback([setSearchParams, trackId])` → recreates on every unrelated param change.
   Fix: `trackIdRef` + `setSearchParamsRef` refs updated in a `useEffect`, `useCallback([])`
   keeps the `next === trackIdRef.current` early-return guard (guard MUST stay before the
   setSearchParams call — calling with an unchanged value still pushes a history entry).
   Add test: capture `setTrackId` identity across an unrelated search-param change.
2. `feat: add resume track tabs with per-track filtering` (step 8):
   - NEW `src/utils/filterEventsByTrack/`: `(events: TimelineEventWithRecommendations[], track: Track)` —
     Set of track skillIds from `track.categories.flatMap(c => c.subCategories.flatMap(sc => sc.skillIds))`;
     map each event: keep responsibility iff `skillIds.length === 0` (universal) or intersects set;
     filter `techStack`/`skills` by `id in set`. Events themselves always kept.
   - NEW `src/utils/deriveSkillCategoryMap/`: `(track: Track) => Map<string, TrackCategoryRef>`,
     `TrackCategoryRef = { id, name, index }` (types file), skillId → owning category.
   - `Resume.tsx`: `useTrackContext()`; MUI `<Tabs value={trackId} onChange={(_e, next: TrackId) => setTrackId(next)} aria-label="Resume track">`
     between heading Box and "Work Experience" Section; one `<Tab>` per `tracks` (import from `@/data/tracks`, views→data legal);
     Tab `id={'track-tab-'+t.id}` `aria-controls={'track-panel-'+t.id}`; wrap Section in
     `<Box role="tabpanel" id={'track-panel-'+trackId} aria-labelledby={'track-tab-'+trackId}>`.
   - `CareerTimeline`: `visibleHistory = useMemo(() => filterEventsByTrack(careerHistory, track), [careerHistory, track])`.
     GOTCHA: `roleIcons` currently index-keyed off unfiltered array (Resume.tsx:29) — key by event id
     instead (build Record/Map from UNFILTERED careerHistory so icons stay stable across tab switches);
     `firstMatchIndex` must run over visibleHistory.
   - `TimelineEventCard.tsx`: `useTrackContext()` (tests need TrackContextProvider inside MemoryRouter).
     `groupSkillsByCategory(skills, track)` rework in helpers via `deriveSkillCategoryMap` — group
     label `category.name`, chip colour `() => categoryColourFromIndex(category.index)` (TagList
     `getColour?: (item: string) => SkillColour | undefined`); drops CATEGORY_LABELS/CATEGORY_ORDER/skillColour()
     imports (TimelineEventCard.tsx:18-19, helpers.ts:4). `handleSkillClick` (line 102) and
     `handleViewAllSkillsClick` (line 109) append `&track=${trackId}` (TRACK_PARAM from '@/context/track').
     Compact bare-card variant: when filtered event has responsibilities/skills/techStack ALL empty →
     CardHeader only (company/title/duration/location), no CardContent/sections/recommendations, reduced padding.
     ALSO fold in carry-forward: section order becomes responsibilities → techStack → skills → recommendations
     (techStack currently first, lines 141-150; move to directly above Key Skills).
   - a11y tests: jest-axe per tab state; Resume.test.tsx currently does NOT wrap TrackContextProvider — add
     (view-level tests use the REAL provider + real track data, same as Skills.test.tsx pattern).
     ⚠️ lead track DOES contain `react` (under its `javascript-stack` category) — for the
     "role tab hides content" test find a skill id in full but NOT in lead
     (full-only cats: frontend-development, backend-development, data-storage — check e.g. `css3`/`html5`
     or a backend id against lead's set before using).
   - lead cats: leadership-delivery, architecture-design, javascript-stack, engineering-practices,
     tools-development-workflow. full cats: leadership-delivery, frontend-development, backend-development,
     data-storage, architecture-design, engineering-practices-quality, tools-development-workflow.
3. `feat: preserve track across nav links` — NavBar.tsx (components layer): do NOT useTrackContext
   (NavBar renders on /articles where the provider isn't mounted). Read `useSearchParams`, keep
   `?track=` on Home + Skills NavLinks via `to={{ pathname, search }}` when `isTrackId(raw)`
   (imports: TRACK_PARAM from '@/context/track', isTrackId from '@/data/tracks' — both legal
   components→lower-layer). Articles link stays plain. Update NavBar.test.tsx.
4. `feat: resolve skill deep links through synonyms` (step 9):
   - matchSkill (src/utils/matchSkill/matchSkill.ts): signature `(term, allSkills = defaultSkills) => MatchSkillResult | null`,
     `MatchSkillResult = { skill, matchedOn: 'name'|'synonym', matchedTerm }`; normalises via
     normaliseSearchTerm. Update its "Not used by any runtime UI code" doc comment.
   - Skills.tsx:59-64: resolve each raw `?skill=` through matchSkill → canonical `skill.name`, drop
     unresolved (list view highlights/scrolls by `skill.skill` display name — SkillItemsList.tsx:67,
     skillElementId(highlightedSkills[0]) in SkillsListView.tsx:27).
   - Resume.tsx:40-48 + TimelineEventCard isMatch (lines 73-78): resolve `?skill=` once in
     CareerTimeline via matchSkill, pass canonical skill id; card compares `skill.id === highlightedSkillId`
     (currently inconsistent: Resume matches name||id, card matches id||synonyms).
5. `refactor: drop legacy skill taxonomy fields` (step 10):
   - Delete `src/utils/skillCategory/` (now only constants: CATEGORY_LABELS, CATEGORY_ORDER + index).
   - skillColour.helpers.ts: delete `skillCategory()`, `skillColour()`, `SKILL_CATEGORY_MAP` (lines 15-29)
     - the `import { skills }`; skillColour.constants.ts: delete `CATEGORY_COLOUR_MAP`;
       skillColour.types.ts: drop legacy `SkillCategory` re-export if present; trim barrel + tests.
   - `src/types/skill.ts`: delete `SkillCategory`, `SkillSubCategory`, `category`, `subCategory` fields;
     check `src/types/index.ts` barrel.
   - `src/data/skills.json`: strip `category`/`subCategory` keys from all 113 entries (node script,
     then `yarn prettier --write src/data/skills.json`).
   - `src/data/skills.ts`: remove VALID_CATEGORIES/SUBCATEGORIES-style validation if still present (unverified).
   - `src/testing/Skill/`: drop `category`/`subCategory` setters + defaults in Skill.data.ts; sweep
     tests using `.category(`/`.subCategory(` builder calls.
   - Legacy consumers confirmed gone after commit 2 (card was the ONLY one — verified by grep).
6. `docs: update claude.md and readme for track taxonomy` (step 11, plan §9): CLAUDE.md routes
   (+`?track=`), data-flow diagram rewrite (skills.json + tracks/\*.json), contexts table
   (+TrackContextProvider row), directory layout (+tracks/, context/track/, new utils, −skillCategory);
   README pages/features/scripts per plan §9.
7. Update this tracker, push branch, give PR-body code block. Then merge via
   `git push origin feat/05-resume-tabs-cleanup-docs:main` ONLY when user asks.

Key file facts (verified, save a rescan): Resume.tsx:22-90 CareerTimeline / 92-108 Resume;
card sections at TimelineEventCard.tsx:140-221 (order techStack→responsibilities→skills→recommendations);
groupSkillsByCategory in TimelineEventCard.helpers.ts:16-23 (CATEGORY_ORDER-driven, size-sorted);
TrackContextProvider setTrackId at lines 41-53; NavBar links at NavBar.tsx:59-69;
`SkillsViewContext` already carries `track`; radar/bar views don't consume highlightedSkills (list view only).
Tests: Resume.test.tsx renders via renderResume(loader, initialEntries) helper (act+flush pattern per
.claude/rules/testing.md — use `const screen = render(...)` alias, builders only).

## Next up

Code-review carry-forwards (2026-07-14 review of feat/02; setTrackId same-value guard already fixed on feat/02):

- [ ] **stabilise `setTrackId` identity** (from feat/02 review). react-router rebuilds `setSearchParams` on every search-param change, so `setTrackId`/`contextValue` recreate on unrelated `?view=`/`?skill=` updates → every `useTrackContext` consumer re-renders for nothing. Fix in `TrackContextProvider.tsx`: route the write through a ref (or `useNavigate`) so the callback is referentially stable. NOT yet done — carry into feat/05.
- [ ] **feat/05: don't lose the track on plain navigation.** NavBar links carry no `?track=`, and the provider normalises a missing param to `full` — Skills is track-aware now, and once tabs exist EM/SWE selection silently resets when clicking Home/Skills. Fix: track-aware nav links, or provider falls back to last-known trackId instead of the default.
- [ ] **UI UX note (feat/05 or later)**: Move tech stack display to render directly above skills section in TimelineEventCard (currently appears above responsibilities).
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
