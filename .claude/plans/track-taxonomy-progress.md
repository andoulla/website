# Progress — ATS skill taxonomy + 3-track resume tabs

Plan: [track-taxonomy.md](track-taxonomy.md) · Mapping: [track-taxonomy-mapping.md](track-taxonomy-mapping.md)
Taxonomies: [em](track-taxonomy-em.md) · [swe](track-taxonomy-swe.md) · [full](track-taxonomy-full.md)
Started: 2026-07-13

## Status

| Branch                           | Steps | Status                                                                                                              |
| -------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------- |
| ~~`feat/00-deep-linking`~~       | 0     | ❌ dropped by user — empty-state rejected; branch deleted                                                           |
| `feat/01-data-foundations`       | 1–3   | 🟡 draft script pushed (`11f6383`); skills.json migration committed (this session); responsibilities migration NEXT |
| `feat/02-tracks-and-context`     | 4–5   | pending                                                                                                             |
| `feat/03-join-skill-objects`     | 6     | pending                                                                                                             |
| `feat/04-skills-view-tracks`     | 7     | pending                                                                                                             |
| `feat/05-resume-tabs`            | 8     | pending                                                                                                             |
| `feat/06-deeplinks-cleanup-docs` | 9–11  | pending                                                                                                             |

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

feat/01 remainder: responsibilities → `{ id, text, skillIds }` objects (plan step 3) using draft script (`yarn draft:mappings --threshold=0.35`) + Claude semantic merge; then types/careerHistory.ts validation, card `.text` mapping, builders, tests.

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
