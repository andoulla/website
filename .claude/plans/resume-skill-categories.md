# Plan: Group "Key Skills" chips by category on Resume (Feature D)

## Context

New idea, raised mid-planning, separate from `skills-deep-linking.md` (Features A/B/C): group each role's flat "Key Skills" chips by category — same idea as `SkillsListView.tsx`'s grouping, simplified (no subcategory tier, a role only has a handful of chips).

**Dependency**: Feature A (in `skills-deep-linking.md`) adds a button inside this same "Key Skills" `Section` block. Implement A and D together, one edit to `TimelineEventCard.tsx`.

---

## Implementation

**`src/views/resume/timelineEventCard/TimelineEventCard.helpers.ts`** — add:

```ts
import type { SkillCategory } from '@/data/skills.types';
import { CATEGORY_ORDER } from '@/utils/skillCategory';
import { skillCategory } from '@/utils/skillColour';

export interface SkillCategoryGroup {
  category: SkillCategory;
  skills: string[];
}

export const groupSkillsByCategory = (skills: string[]): SkillCategoryGroup[] =>
  CATEGORY_ORDER.map((category) => ({
    category,
    skills: skills.filter((skill) => skillCategory(skill) === category),
  })).filter((group) => group.skills.length > 0);
```

(mirrors `SkillsListView.tsx`'s `byCategory`/`nonEmptyCategories` reduce, lines 54-98, simplified)

Naming trap: `skillCategory()` (the lookup fn) lives in `@/utils/skillColour`, not `@/utils/skillCategory` (that folder only has `CATEGORY_ORDER`/`CATEGORY_LABELS`/subcategory constants). Pre-existing, not something to fix here.

**`src/views/resume/timelineEventCard/TimelineEventCard.tsx`**

- `const skillGroups = useMemo(() => groupSkillsByCategory(experience.skills), [experience.skills]);`
- Replace the single `TagList` in "Key Skills" (lines 99-106):
  ```tsx
  <Section title="Key Skills" titleLevel={4}>
    <Stack spacing={1.5}>
      {skillGroups.map((group) => (
        <Box key={group.category}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ fontWeight: 'medium', mb: 0.5 }}
          >
            {CATEGORY_LABELS[group.category]}
          </Typography>
          <TagList
            items={group.skills}
            onItemClick={handleSkillClick}
            getColour={skillColour}
            getShadeIndex={skillShadeIndex}
          />
        </Box>
      ))}
    </Stack>
    {/* Feature A's "View all skills from this role" button, if done together, goes here */}
  </Section>
  ```
- Import `Stack` and `CATEGORY_LABELS` (from `@/utils/skillCategory`).

**Chose plain caption over `Section titleLevel={5}`**: `titleLevel` is a closed `2 | 3 | 4` union (`Section.tsx:7`); a role card is already `h3` (company) → `h4` (Key Skills) — a real `h5` per category is a 5-deep nest for one card. Flag if you'd rather extend `Section` to match `SkillsListView.tsx`'s subcategory `Section`s (which do use real headings).

## Tests

`TimelineEventCard.helpers.test.ts` — `groupSkillsByCategory`:

- orders by `CATEGORY_ORDER`
- omits empty categories
- empty input → `[]`
- unrecognised skill name falls back to `tooling`

`TimelineEventCard.test.tsx` — category captions render per group, omitted for absent categories (use real skill names from `src/data/skills.ts` spanning 2 categories).

## Edge case worth flagging

`skillCategory()`'s `'tooling'` fallback is pre-existing but was invisible in the old flat list. Grouping surfaces any typo/casing mismatch between a job's `skills` array (`jobs.json`) and the master `skills.ts` list as a visibly mis-filed chip under "Tooling" — worth a quick manual data scan after implementing.

## Verification

No automated test/lint/build runs by the assistant — user runs typecheck/lint/tests; assistant walks through a role with skills spanning multiple categories to confirm grouping renders correctly.
