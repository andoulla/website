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

## Routes

| Path      | View     | Notes                                                              |
| --------- | -------- | ------------------------------------------------------------------ |
| `/`       | `Resume` | Work-experience timeline + contact details                         |
| `/skills` | `Skills` | List/graph toggle; `?skill=<name>` deep-links to a highlighted row |

## Data flow

```
src/data/jobs.json + recommendations.json
  → loadExperiences()      (dynamic import, joins data, 600 ms artificial delay)
  → ResumeDataProvider     (holds a stable Promise via useState lazy init)
  → useResumeData()        (React 19 use() — must sit under a Suspense boundary)
  → Resume / Skills views
```

Skills have **no dedicated data file** — `calculateSkillYears(experiences)` derives them from `WorkExperience.skills` and `WorkExperience.techStack` at render time.

## Contexts

| Provider               | Hook                | Exposes                                                       |
| ---------------------- | ------------------- | ------------------------------------------------------------- |
| `ResumeDataProvider`   | `useResumeData()`   | `WorkExperienceWithRecommendations[]` — suspends until loaded |
| `ThemeContextProvider` | `useThemeContext()` | `{ themeName, toggleTheme, isDarkMode, toggleDarkMode }`      |

## Directory layout

- [src/components/](src/components/) — shared/reusable UI components (BulletList, NavBar, Section, TagList)
- [src/views/](src/views/) — page-level views; view-specific components nest directly under the owning view (see nesting convention below)
  - [src/views/resume/](src/views/resume/) — sub-components: ContactDetails, TimelineEventCard, TimelineEventSkeleton
  - [src/views/skills/](src/views/skills/) — sub-components: SkillsListView, SkillsGraphView
- [src/context/](src/context/) — React context providers (resumeData, theme)
- [src/data/](src/data/) — JSON fixtures + typed `.ts` wrappers (jobs, recommendations, contact)
- [src/types/](src/types/) — shared TypeScript types (WorkExperience, Recommendation, WorkExperienceWithRecommendations)
- [src/themes/](src/themes/) — MUI theme factories (green, purple) and design tokens
- [src/utils/](src/utils/) — pure utility functions
  - `calculateSkillYears` — derives `SkillSummary[]` from `WorkExperience[]`
  - `skillColour` — maps skill name → MUI colour + category (`engineering` | `managerial` | `soft-skills` | `other`)
  - `computeShadeColour` — shade interpolation helper used by skillColour
  - `loadExperiences` — async loader used by ResumeDataProvider, joins jobs + recommendations into `WorkExperienceWithRecommendations[]` via its `joinJobsWithRecommendations` sub-util

### Nesting convention

A child used only by one owner nests directly under that owner (no intermediate `components/`
wrapper) rather than sitting beside it — a child can always import from its parent, but nothing
outside the parent may reach into the child (enforced by `no-sibling-folder-imports`; naming/file
conventions in [code-style.md](.claude/rules/code-style.md)). Applies uniformly under `views/*`
too: `views/skills/skillFilterBar/`, not `views/skills/components/skillFilterBar/`.

Worked examples: [src/components/tagList/](src/components/tagList/) (component nesting),
[src/utils/loadExperiences/joinJobsWithRecommendations/](src/utils/loadExperiences/joinJobsWithRecommendations/)
(util nesting).
