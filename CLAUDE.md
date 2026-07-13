# Website

A minimal React + TypeScript web app run in strict mode across the whole toolchain (TS, ESLint, tests). Personal project also used as a testbed for exploring Claude's models/features.

## Tech stack

- **React 19** + **TypeScript** (`strict: true` in [tsconfig.json](tsconfig.json))
- **Vite 8** — dev server / build ([vite.config.ts](vite.config.ts))
- **MUI** (`@mui/material`, `@mui/lab` for `Timeline`, `@mui/icons-material`) + **Emotion** for styling
- **react-router-dom** v7
- **Jest 30** + **ts-jest** + **React Testing Library** + **jest-axe**, jsdom environment, setup file [src/setupTests.ts](src/setupTests.ts)
- **ESLint** + **Prettier**, enforced on commit via plain Git hooks ([.githooks/pre-commit](.githooks/pre-commit)), which also runs the full test suite
- **commitlint** (`@commitlint/config-conventional`) enforces [Conventional Commits](https://www.conventionalcommits.org/) messages via [.githooks/commit-msg](.githooks/commit-msg) — e.g. `fix: handle empty references list`, `feat: add resume print view`
- Package manager: **yarn** (canonical — README and scripts assume yarn; ignore `package-lock.json` if present)

## Verifying changes

- Never run typecheck, lint, tests, the dev server, or a browser/screenshot yourself — the user
  runs all verification.
- After changes, walk the user through them one at a time: ask them to check a single change,
  wait for confirmation or feedback, then move to the next — don't dump the full list at once.

## Planning

- Plans must carry enough detail to implement without re-scanning files already read while
  planning: exact file paths, relevant existing code/line numbers, function signatures.
- A plan is a handoff to the implementation step, not a pointer back to redo the search.

## Routes

| Path      | View     | Notes                                                              |
| --------- | -------- | ------------------------------------------------------------------ |
| `/`       | `Resume` | Work-experience timeline + contact details                         |
| `/skills` | `Skills` | List/graph toggle; `?skill=<name>` deep-links to a highlighted row |

## Data flow

```
src/data/careerHistory.json + recommendations.json
  → loadCareerHistory()    (dynamic import, joins data, 600 ms artificial delay)
  → CareerDataContextProvider (holds a stable Promise via useState lazy init)
  → useCareerDataContext() (React 19 use() — must sit under a Suspense boundary)
  → Resume / Skills views
```

Skills have **no dedicated data file** — `calculateSkillYears(experiences)` derives them from `TimelineEvent.skills` and `TimelineEvent.techStack` at render time.

## Skill mappings are frozen

Mappings = `skill.jobIds`, `skill.recommendationIds`, and (once migrated) `responsibility.skillIds`.
They are authored via the draft-report + semantic-merge flow (`yarn draft:mappings` writes a
suggestions report to gitignored `scripts/output/` — it NEVER writes to `src/data/`).

- Committed mappings are **frozen**: a remap only (re)maps new or edited bullets/recommendations.
  Never touch existing mapping arrays unless the user names a specific one to revisit.
- Ordering is fixed: `skillIds`/`recommendationIds` sorted alphabetically; `jobIds` in
  careerHistory order. Re-derived identical mappings must produce a zero diff — nothing shuffles.
- Guarantee after any remap: `git diff` shows only lines for content the user added or changed.

## Contexts

| Provider                    | Hook                     | Exposes                                                      |
| --------------------------- | ------------------------ | ------------------------------------------------------------ |
| `CareerDataContextProvider` | `useCareerDataContext()` | `TimelineEventWithRecommendations[]` — suspends until loaded |
| `ThemeContextProvider`      | `useThemeContext()`      | `{ themeName, toggleTheme, isDarkMode, toggleDarkMode }`     |

## Directory layout

- [src/components/](src/components/) — shared/reusable UI components (BulletList, NavBar, Section, TagList)
- [src/views/](src/views/) — page-level views; view-specific components nest directly under the owning view (see nesting convention below)
  - [src/views/resume/](src/views/resume/) — sub-components: ContactDetails, TimelineEventCard, TimelineEventSkeleton
  - [src/views/skills/](src/views/skills/) — sub-components: SkillsListView, SkillsGraphView
- [src/context/](src/context/) — React context providers (careerData, theme)
- [src/data/](src/data/) — JSON fixtures + typed `.ts` wrappers (careerHistory, recommendations, contact)
- [src/types/](src/types/) — shared TypeScript types (TimelineEvent, Recommendation, TimelineEventWithRecommendations)
- [src/themes/](src/themes/) — MUI theme factories (green, purple) and design tokens
- [src/utils/](src/utils/) — pure utility functions
  - `calculateSkillYears` — derives `SkillSummary[]` from `TimelineEvent[]`
  - `skillColour` — maps skill name → MUI colour + category (`engineering` | `managerial` | `soft-skills` | `other`)
  - `computeShadeColour` — shade interpolation helper used by skillColour
  - `loadCareerHistory` — async loader used by CareerDataContextProvider, joins career history + recommendations into `TimelineEventWithRecommendations[]` via its `joinCareerHistoryWithRecommendations` sub-util

### Nesting convention

- A child used only by one owner nests directly under that owner (no intermediate `components/`
  wrapper), not beside it.
- A child can always import from its parent; nothing outside the parent may reach into the child.
  Enforced by ESLint — see [code-style.md](.claude/rules/code-style.md) for the rule details and
  naming/file conventions.
- Applies uniformly under `views/*`: `views/skills/skillFilterBar/`, not
  `views/skills/components/skillFilterBar/`.
- Worked examples: [src/components/tagList/](src/components/tagList/) (component nesting),
  [src/utils/loadCareerHistory/joinCareerHistoryWithRecommendations/](src/utils/loadCareerHistory/joinCareerHistoryWithRecommendations/)
  (util nesting).
