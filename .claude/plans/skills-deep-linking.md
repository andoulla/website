# Plan: Skills deep-linking features (A, B, C)

## Context

Follow-up to the "link category-level filtering from Resume" TODO in `App.tsx` (dropped — a role's skills always span multiple categories, so a single category link per role doesn't work). Building instead:

- **A** — "View all skills from this role" link on Resume → highlights all of a role's skills on the Skills List view (today, only single-skill chip clicks work).
- **B** — Reverse deep link: skill popover on Skills page → jump back to Resume with that skill highlighted.
- **C** — "Copy filtered link" button on Skills page (URL already encodes filter/search/view state).

Independent of each other and of `resume-skill-categories.md` (Feature D) — **except**: A and D both restructure the same "Key Skills" JSX block in `TimelineEventCard.tsx`. Do those two together, same revision. B's changes land in the same file too but are more self-contained.

**Order**: A → B → C. Check in after each before moving on (user runs typecheck/lint/tests; no automated verification by the assistant).

---

## Feature A — "View all skills from this role"

**`src/views/skills/Skills.constants.ts`** — add:

```ts
export const SKILL_PARAM = 'skill';
```

**`src/views/skills/Skills.helpers.ts`** — add (mirrors `parseCategories`/`parseSubCategories`, lines 8-13; no whitelist, skill names aren't a closed enum):

```ts
export const parseSkills = (raw: string | null): string[] =>
  raw !== null && raw.length > 0 ? raw.split(',') : [];
```

**`src/views/skills/Skills.tsx`**

- Line 55: `const highlightedSkill = searchParams.get('skill') ?? undefined;` → `const highlightedSkills = useMemo(() => parseSkills(searchParams.get(SKILL_PARAM)), [searchParams]);`
- Line 251: `highlightedSkill={highlightedSkill}` → `highlightedSkills={highlightedSkills}`

**`src/views/skills/skillsViews/SkillsViewContext.type.ts`**

- `highlightedSkill?: string` (line 13) → `highlightedSkills: string[]` (non-optional internally).
- **Bug caught**: making it required on `SkillsViewContextProviderProps` too (via the current `Omit<SkillsViewContextValue, 'filteredSkills'>`) breaks `SkillsGraphView.test.tsx`/`SkillsRadarView.test.tsx` — they render the Provider without this prop (confirmed via grep).
- Fix — optional on props only, required on the internal value:
  ```ts
  export interface SkillsViewContextProviderProps extends Omit<
    SkillsViewContextValue,
    'filteredSkills' | 'highlightedSkills'
  > {
    highlightedSkills?: string[];
    children: ReactNode;
  }
  ```

**`src/views/skills/skillsViews/SkillsViewContext.tsx`** — rename `highlightedSkill` → `highlightedSkills` throughout (lines 26/34-52), default in destructure: `highlightedSkills = []`.

**`src/views/skills/skillsViews/skillsListView/SkillsListView.tsx`**

- Line 36: destructure `highlightedSkills`.
- Lines 39-43, scroll effect → scroll to first entry:
  ```ts
  useEffect(() => {
    if (highlightedSkills.length === 0) return;
    const el = document.getElementById(skillElementId(highlightedSkills[0]));
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedSkills]);
  ```
- Lines 129, 138: pass `highlightedSkills` to both `SkillItemsList` call sites.

**`src/views/skills/skillsViews/skillsListView/skillItemsList/SkillItemsList.tsx`**

- Props (lines 17-27): `highlightedSkill?: string` → `highlightedSkills?: string[]` (stays optional — some callers omit it).
- Line 80: `isHighlighted={skill.skill === highlightedSkill}` → `isHighlighted={(highlightedSkills ?? []).includes(skill.skill)}`.

**`src/views/resume/timelineEventCard/TimelineEventCard.tsx`**

- New handler, after `handleSkillClick` (line 66):
  ```ts
  const handleViewAllSkillsClick = useCallback(() => {
    void navigate(`/skills?skill=${experience.skills.map(encodeURIComponent).join(',')}`);
  }, [navigate, experience.skills]);
  ```
- In "Key Skills" `Section` (lines 99-106), after the chips:
  ```tsx
  {
    experience.skills.length > 0 && (
      <Button size="small" onClick={handleViewAllSkillsClick} sx={{ mt: 1.5 }}>
        View all skills from this role
      </Button>
    );
  }
  ```
  (import `Button` from `@mui/material/Button`)
- Don't touch `Section.tsx` — no action-slot needed.
- `views/resume` can't import `SKILL_PARAM` from `views/skills` (sibling-folder rule) — keep the `/skills?skill=...` literal as a plain string, same as today.

**Tests**

- `Skills.helpers.test.ts` — `parseSkills`: null / empty / single / multi-CSV.
- `SkillsListView.test.tsx` — rename `highlightedSkill: 'React'` → `highlightedSkills: ['React']` (lines 189/198); add multi-highlight case + "scrolls to first of several" case.
- `SkillItemsList.test.tsx` — rename `highlightedSkill="React"` → `highlightedSkills={['React']}` (lines 49/58); add multi-skill highlight case.
- `SkillsViewContext.test.tsx` — needs updating (tests the prop directly): rename field/span (lines 16/26) to `highlightedSkills`, prop at line 40 to `highlightedSkills={['React']}`, rename the "omits" test (line 55) to "defaults to an empty list when not provided".
- `TimelineEventCard.test.tsx` — click "View all skills from this role" → assert `location:/skills?skill=React,TypeScript`; button omitted when `experience.skills` is empty.

**Edge case, not a blocker**: CSV split assumes no skill name contains a literal comma — same assumption `parseCategories`/`parseSubCategories` already make.

---

## Feature B — Reverse deep link: Skills → Resume

**`src/views/skills/skillsViews/skillsListView/SkillsListView.tsx`** — in the Popover content (lines 155-175), under the skill-name heading:

```tsx
<Button
  component={RouterLink}
  to={`/?skill=${encodeURIComponent(popover?.skill.skill ?? '')}`}
  size="small"
  sx={{ mb: 1 }}
>
  View on Resume
</Button>
```

(import `Button` from `@mui/material/Button`, `Link as RouterLink` from `react-router-dom`)

**`src/views/resume/Resume.tsx`** — in `ExperienceList` (line 21): add `useSearchParams`, read `const highlightedSkill = searchParams.get('skill') ?? undefined;`.

**Bug caught — scroll fighting**: if 2+ jobs list the same skill, each card's own "scroll on mount" effect fires, and they fight over final scroll position.

Fix — decide the scroll target once, in `ExperienceList`, not per-card:

```ts
const firstMatchIndex = useMemo(
  () =>
    highlightedSkill === undefined
      ? -1
      : experiences.findIndex((experience) => experience.skills.includes(highlightedSkill)),
  [experiences, highlightedSkill]
);
```

Pass a highlight flag (every matching card, for outline) and a scroll flag (first match only):

```tsx
{
  experiences.map((experience, index) => (
    <TimelineEventCard
      key={experience.id}
      experience={experience}
      highlightedSkill={highlightedSkill}
      autoScrollToHighlight={index === firstMatchIndex}
    />
  ));
}
```

**`src/views/resume/timelineEventCard/TimelineEventCard.tsx`**

- Add `highlightedSkill?: string` and `autoScrollToHighlight?: boolean` to `TimelineEventCardProps`.
- `const isMatch = highlightedSkill !== undefined && experience.skills.includes(highlightedSkill);` — drives outline on every matching card.
- Scroll only when `autoScrollToHighlight` is true (not `isMatch`) — this is the fix for the fighting bug above.

**Bug caught — ref cleanup leak**: `Card` already has `ref={ref}` from `useInView` (line 69). Per `useInView.types.ts:7`, that ref callback _returns a cleanup function_ that disconnects its `IntersectionObserver`. A naive wrapper that calls `ref(node)` without returning what it returns silently drops that cleanup → leaked observer on unmount.

Fix — forward the cleanup explicitly:

```ts
const cardNodeRef = useRef<HTMLDivElement | null>(null);
const setCardNode = useCallback(
  (node: HTMLDivElement | null): (() => void) | void => {
    const cleanup = ref(node);
    cardNodeRef.current = node;
    return cleanup;
  },
  [ref]
);

useEffect(() => {
  if (!autoScrollToHighlight) return;
  cardNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}, [autoScrollToHighlight]);
```

Pass `ref={setCardNode}` to `Card` instead of `ref={ref}`.

- Visual accent — card-level outline only, no per-chip highlight (`TagList`/`Tag` props are whole-list, not per-item; widening that API is more than this needs):
  ```tsx
  <Card ref={setCardNode} elevation={0} sx={[getCardMotionSx(isInView, prefersReducedMotion), isMatch && { outline: (theme) => `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 }]}>
  ```
- **To verify**: MUI's `sx` array form should accept falsy entries for this conditional idiom — double-check under strict TS since this repo hasn't used an `sx` array before.

**Tests**

- `TimelineEventCard.test.tsx` — spy `scrollIntoView`: called when `autoScrollToHighlight` true; **not** called when `isMatch` true but `autoScrollToHighlight` false (regression test for the fighting bug); not called with no match.
- `SkillsListView.test.tsx` — new `describe('view on resume link', ...)`: popover renders `getByRole('link', { name: 'View on Resume' })` with `href="/?skill=React"` (and URL-encoded for `Team Leadership` → `Team%20Leadership`). `renderListView` helper needs `MemoryRouter` wrapping (doesn't have it yet — safe change, nothing relies on its absence).
- `Resume.test.tsx` — `initialEntries={[{ pathname: '/', search: '?skill=React' }]}`, two experiences both listing `'React'` → only first is the auto-scroll target.

**Inherited, not new**: matching is exact/case-sensitive against the canonical skill name — same as the existing single-chip-click behaviour (no synonym resolution).

---

## Feature C — "Copy filtered link" button

New folder **`src/views/skills/copyLinkButton/`** (single owner: `Skills.tsx`), same pattern as `SkillFilterBar`/`SkillSearchBar` (component + test + `index.ts`).

**`CopyLinkButton.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const RESET_DELAY_MS = 1500;

export const CopyLinkButton = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), RESET_DELAY_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleClick = () => {
    void navigator.clipboard
      .writeText(`${window.location.origin}${location.pathname}${location.search}`)
      .then(() => setCopied(true))
      .catch(() => {
        // clipboard write can reject (permission denied, insecure context) — fail silently
      });
  };

  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy filtered link'}>
      <IconButton
        aria-label={copied ? 'Link copied' : 'Copy filtered link'}
        onClick={handleClick}
        size="small"
      >
        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};
```

- **Tooltip+icon swap over Snackbar** — no repo precedent for either; Snackbar needs its own open/auto-hide state for a job the label swap already does more cheaply.
- **Bug caught**: original sketch had no `.catch()` — clipboard write can reject (permission denied / insecure context), leaves an unhandled rejection. Fixed above.
- **Cross-browser edge case**: Safari doesn't focus buttons on click by default, so the Tooltip may not open there on click. The `aria-label`/icon swap is the reliable feedback across browsers — tooltip text is a bonus, not the primary signal.
- `index.ts`: `export { CopyLinkButton } from './CopyLinkButton';`

**`src/views/skills/Skills.tsx`** — render inside the `ml: 'auto'` `Stack` (line 210-244), after `ToggleButtonGroup`.

**`CopyLinkButton.test.tsx`**

- Mock `navigator.clipboard.writeText` locally (no repo-wide stub exists — scope to this file).
- `MemoryRouter` with `initialEntries={[{ pathname: '/skills', search: '?category=engineering' }]}`.
- Click → `writeText` called with `'http://localhost/skills?category=engineering'`.
- Click → `aria-label` becomes `'Link copied'`, tooltip shows `'Copied!'` (click focuses the button, which opens the Tooltip too — confirm in test).
- Fold jest-axe into resting-state render test; optional fake-timers test for revert-after-delay.

---

## Verification

No automated test/lint/build runs by the assistant — after each feature, the user runs typecheck/lint/tests; the assistant walks through exercising it manually (Resume: click a skill / "view all skills" / highlighted card scroll; Skills: popover "View on Resume" link, copy-link button, multi-skill highlight in List view).
