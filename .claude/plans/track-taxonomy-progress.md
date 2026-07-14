# Progress — ATS skill taxonomy + 3-track resume tabs

Plan: [track-taxonomy.md](track-taxonomy.md) · Mapping: [track-taxonomy-mapping.md](track-taxonomy-mapping.md)
Taxonomies: [em](track-taxonomy-em.md) · [swe](track-taxonomy-swe.md) · [full](track-taxonomy-full.md)
Started: 2026-07-13

## Status

| Branch                           | Steps | Status                                                                                                                                                                                                         |
| -------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~`feat/00-deep-linking`~~       | 0     | ❌ dropped by user — empty-state rejected; branch deleted                                                                                                                                                      |
| `feat/01-data-foundations`       | 1–3   | ✅ COMPLETE, pushed `9739f00` — script (`11f6383`), skills migration (`0faf505`, message misleading: user commit swept staged data in; left per user), normalize fix (`76ce13e`), responsibilities (`9739f00`) |
| `feat/02-tracks-and-context`     | 4–5   | pending                                                                                                                                                                                                        |
| `feat/03-join-skill-objects`     | 6     | pending                                                                                                                                                                                                        |
| `feat/04-skills-view-tracks`     | 7     | pending                                                                                                                                                                                                        |
| `feat/05-resume-tabs`            | 8     | pending                                                                                                                                                                                                        |
| `feat/06-deeplinks-cleanup-docs` | 9–11  | pending                                                                                                                                                                                                        |

## Decisions log (recent)

- 2026-07-14: Full taxonomy approved with amendments — kept separate: Team Onboarding, Enzyme, Flow, Kibana, Testing Strategy, Error Handling≠Error Monitoring. Canonicals: Estimation & Planning (syn Sprint Planning), Technical Direction (syn Technical Strategy), Roadmap Planning (syn Roadmapping/Project Planning), Documentation (syn Confluence/Notion), Error Monitoring (syn Sentry). Dropped: Software Development, Team Operations.
- 2026-07-14: unmapped skills (jobIds []) stay in taxonomy but don't render on graphs/bars — NO min-jobIds validation.
- 2026-07-13: no "No recommendations yet." empty state in tooltip.
- Plan files live in repo `.claude/plans/` (user request), committed.

## Blocked on user

- [ ] Drop `stash@{0}`? (100% redundant now)
- [ ] Optional: Elsevier/Capco tech stack
- [ ] Open PR for feat/01 when branch complete: https://github.com/andoulla/website/pull/new/feat/01-data-foundations

## Next up

`feat/02-tracks-and-context` (branch from feat/01): plan steps 4–5 — `src/types/track.ts`, 3 track JSONs under `src/data/tracks/` (author from the 3 taxonomy md files, referencing skills.json ids; canonical renames: sprint-planning→estimation-planning, technical-strategy→technical-direction, roadmapping→roadmap-planning, confluence→documentation), `src/data/tracks.ts` wrapper + validation + full-covers-all test + category-cap test, `TrackContextProvider` in `src/context/track/`, App.tsx mount + TODO cleanup.

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
