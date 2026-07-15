# Progress — ATS skill taxonomy + 3-track resume tabs

Plan: [track-taxonomy.md](track-taxonomy.md) · Mapping: [track-taxonomy-mapping.md](track-taxonomy-mapping.md)
Taxonomies: [em](track-taxonomy-em.md) · [swe](track-taxonomy-swe.md) · [full](track-taxonomy-full.md)
Started: 2026-07-13

## Status

| Branch                           | Steps | Status                                                                                                                                                        |
| -------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~`feat/00-deep-linking`~~       | 0     | ❌ dropped by user — empty-state rejected; branch deleted                                                                                                     |
| `feat/01-data-foundations`       | 1–3   | ✅ MERGED to main 2026-07-14 (fast-forward push, no PR — user request)                                                                                        |
| `feat/02-tracks-and-context`     | 4–5   | ✅ COMPLETE + feedback fixes, pushed `5d6b224` — track data (`f9f376c`), track context + App mount (`da7e401`), feedback fixes (`e24b1d2`); PR not opened yet |
| ``feat/03-join-skill-objects`    | 6     | ✅ COMPLETE — skill objects joined; moved Skill types to src/types; 427 tests passing                                                                         |
| `feat/04-skills-view-tracks`     | 7     | pending                                                                                                                                                       |
| `feat/05-resume-tabs`            | 8     | pending                                                                                                                                                       |
| `feat/06-deeplinks-cleanup-docs` | 9–11  | pending                                                                                                                                                       |

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

## Next up

Code-review carry-forwards (2026-07-14 review of feat/02; setTrackId same-value guard already fixed on feat/02):

- [ ] **feat/03 (third PR): stabilise `setTrackId` identity.** react-router rebuilds `setSearchParams` on every search-param change, so `setTrackId`/`contextValue` recreate on unrelated `?view=`/`?skill=` updates → every `useTrackContext` consumer re-renders for nothing. Fix in `TrackContextProvider.tsx` when consumers land: route the write through a ref (or `useNavigate`) so the callback is referentially stable.
- [ ] **feat/04–05: don't lose the track on plain navigation.** NavBar links carry no `?track=`, and the provider normalises a missing param to `full` — once tabs exist, EM/SWE selection silently resets when clicking Home/Skills. Fix: track-aware nav links, or provider falls back to last-known trackId instead of the default.
- [ ] **feat/04 MUST add a sync test**: when `CATEGORY_COLOUR_PALETTE` is created in `src/utils/skillColour/`, add a test asserting `CATEGORY_COLOUR_PALETTE.length === MAX_TRACK_CATEGORIES` (export the const from `src/data/tracks.ts` then; a test is the right home since data can't import utils). Until then the `7` in tracks.ts is a free-floating copy that can drift.
- [ ] **UI UX note (feat/04 or later)**: Move tech stack display to render directly above skills section in TimelineEventCard (currently appears above responsibilities).

`feat/03-join-skill-objects` (branch from feat/02): plan step 6 — `feat: join full skill objects into career history`. Join returns `Skill[]` for techStack/skills (split by `type`), integrity throws for unresolvable `skill.jobIds`/`recommendationIds`, `TimelineEventWithRecommendations` type ripple (`techStack: Skill[]; skills: Skill[]`), minimal card shims. Also per plan §1: move `Skill` types from `src/data/skills.types.ts` to `src/types/skill.ts` (delete the data one) — deferred to this branch on purpose.

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
