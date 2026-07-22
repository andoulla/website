# Ask About My Experience (Resume view)

Branch: `feat/ask-about-my-experience` · own worktree · small incremental commits.
Parallel-safe with `feat/time-machine-scrubber` (disjoint files; only *reads* `SKILL_PARAM`).

**Context:** an inline, offline "ask about my experience" search on `/` spanning Skills · Roles ·
Recommendations, with grouped, previewed results in an anchored dropdown **inline under the
input, no modal/overlay**. Each result is a clickable link to a specific timeline card.

**Key interaction — per-job results:**
- A skill held across N jobs → **N separate result rows**, one per job — the user picks which role
  to view. No auto-jump-to-most-recent.
- Every row is a link; clicking navigates to that exact card (and highlights the skill on it).

**Inline, no overlay:** MUI `Autocomplete`'s popper is anchored to the input, not a full-screen
modal — grouped headers (`groupBy`) + preview rows render right under the box.

**Result model — `experienceSearch/ExperienceSearch.types.ts`:**
```ts
export type SearchResult =
  | { kind: 'skill'; id: string; skillId: string; skillName: string; event: TimelineEventWithRecommendations }
  | { kind: 'role'; id: string; event: TimelineEventWithRecommendations }
  | { kind: 'recommendation'; id: string; recommendation: Recommendation; event: TimelineEventWithRecommendations };
// id unique per row: `skill:${skillId}:${eventId}` | `role:${eventId}` | `rec:${recId}`
```

**Data source — track-scoped:** build options from `filterEventsByTrack(careerHistory, track)`
(`src/utils/filterEventsByTrack`) so each event's `skills`/`recommendations` are track-narrowed.

**Helpers — `experienceSearch/ExperienceSearch.helpers.ts`:**
- `buildSearchResults(events): SearchResult[]` — per event: one `role`; one `skill` per
  `event.skills` (yields per-job rows); one `recommendation` per `event.recommendations`.
  Pre-sorted skill→role→recommendation so `groupBy` is contiguous; within Skills, order by job
  recency.
- `matchesQuery(result, query): boolean` — reuse `normaliseSearchTerm`, `MIN_SEARCH_TERM_LENGTH = 2`;
  skill → name + synonyms, role → `companyName` + `title`, recommendation → `authorRole.jobTitle`
  + `text` (+ `authorInitials`).
- `resultTo(result, trackId): string` — link target, all param values `encodeURIComponent`-d
  (matches `TimelineEventCard.tsx:125`): skill → `/?track=<id>&skill=<name>&focus=<eventId>`;
  role → `/?track=<id>&focus=<eventId>`; recommendation → `/?track=<id>&recommendation=<recId>`.
- `optionLabel(result)` — "React · Acme Corp · 2021–Present" | company | author.
- `groupLabel(kind): 'Skills' | 'Roles' | 'Recommendations'`.

**Component `experienceSearch/ExperienceSearch.tsx`** (no props): MUI `Autocomplete`,
`groupBy={groupLabel}`, `getOptionLabel={optionLabel}`, `isOptionEqualToValue` by `id`,
`filterOptions` = `matchesQuery`, `value={null}`, `onChange` → `navigate(resultTo(...))` + clear
input, placeholder "Ask about my experience…", dynamic `noOptionsText` ("Type at least 2
characters" under threshold, else "No matching experience…").

**New `?focus=<eventId>` deep-link (in `CareerTimeline`, `Resume.tsx`):**
- Roles + a specific skill@job need to scroll to a chosen event — no existing param does that.
- `FOCUS_PARAM = 'focus'` in new `src/views/resume/Resume.constants.ts` (+ resume param literals),
  so `skillsUrlParams.ts` stays untouched (parallel-safe).
- `matchIndex` priority becomes **recommendation → focus → skill**:
  `if (focusEventId !== undefined) return visibleHistory.findIndex((e) => e.id === focusEventId);`
  (before the skill branch). Explicit `focus` overrides `findMostRecentSkillMatchIndex`; a bare
  `?skill=` link still falls through to most-recent, unchanged.
- Pass `highlightedEventId={focusEventId}` to each `TimelineEventCard`.

**`TimelineEventCard.tsx`:** add optional `highlightedEventId?: string`;
`isFocusMatch = highlightedEventId !== undefined && event.id === highlightedEventId`; fold into
`isMatch` (`:90`) so a role result outlines (`:211-214`) + auto-expands (`:94`) its target card.

**Suspense:** own `<Suspense>` boundary (not merged with `CareerTimeline`'s) so
`ContactDetails`/`Tabs` render instantly. Fallback: MUI `Skeleton` (`variant="rounded"`,
`height={40}`, small max-width). Place between header `Box` (`:136`) and `Tabs` (`:137`).

**Tests:**
- `ExperienceSearch.test.tsx` — 3 tests: options build + track scope (skill in 2 jobs → 2 rows,
  rerender on track switch); filtering across all 3 kinds + no-match `noOptionsText`; navigation
  per kind (skill→`?skill=&focus=`, role→`?focus=`, rec→`?recommendation=`) + input clears.
- `Resume.test.tsx` (extend) — 1 test: `?focus=` scrolls+outlines target; `focus` wins over
  most-recent when `?skill=` also present; `focus`-only outlines+expands.
- `TimelineEventCard.test.tsx` (extend) — `highlightedEventId === event.id` outlines+expands with
  no skill/rec match.

**Files:**
- `src/views/resume/experienceSearch/` (new: `ExperienceSearch.tsx`, `.helpers.ts`, `.types.ts`,
  `.test.tsx`, `index.ts`)
- `src/views/resume/Resume.constants.ts` (new)
- `src/views/resume/Resume.tsx` — `?focus=` + `matchIndex` priority + `highlightedEventId`;
  `Suspense`-wrapped `ExperienceSearch`; import `Skeleton`
- `src/views/resume/timelineEventCard/TimelineEventCard.tsx` — `highlightedEventId` prop + `isMatch` fold

**Edge cases:**
- `filterEventsByTrack` keeps every event (`:3,14`) → `?focus=` always resolves. Skill highlight
  may vanish on a later track switch; card still focuses. Acceptable.
- Under-threshold query → dynamic `noOptionsText` ("Type at least 2 characters").
- `resultTo` builds a fresh query (only `track` + one param) → no stale `skill`/`focus` stacking.
- Re-selecting same row → identical URL is a router no-op (no re-scroll). Accepted.
- No `Suspense` re-flash on track switch (careerData promise stable).
- Long snippets truncated; labels wrap on `xs`.
- Recommendation needs no `focus` — `?recommendation=` already scrolls+expands.

**Verify:** user runs `yarn test` + manual check. (Never run tests myself.)

**Progress:**
- [ ] Worktree + branch `feat/ask-about-my-experience`
- [ ] `Resume.constants.ts` (`FOCUS_PARAM` + resume param literals)
- [ ] `?focus=` handling in `CareerTimeline` (matchIndex priority + `highlightedEventId`)
- [ ] `TimelineEventCard` `highlightedEventId` prop + `isMatch` fold + test
- [ ] `ExperienceSearch` types + helpers (build/match/resultTo/groupLabel)
- [ ] `ExperienceSearch` component + `Suspense` placement in `Resume.tsx`
- [ ] `ExperienceSearch.test.tsx` + `Resume.test.tsx` focus test
- [ ] User verification (manual + `yarn test`)
