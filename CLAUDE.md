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

Do NOT run any verification commands (typecheck, lint, tests) — the user runs them all.

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
- [src/views/](src/views/) — page-level views; each may have a `components/` sub-folder for view-specific components
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

A component/util folder that owns a child used _only_ by itself nests that child directly by name (no intermediate `components/` wrapper — that name is reserved for the top-level `views/*/components/` split above) rather than placing it next to it. This keeps ownership obvious and sidesteps sibling-folder imports (see [code-style.md](.claude/rules/code-style.md)) — a child folder can always reach up to its parent, but nothing outside the parent reaches sideways into the child.

Folder names are camelCase and match the PascalCase component/function they contain; each folder gets an `index.ts` barrel export. A folder may also carry a `Name.types.ts` for types shared across files in that folder, `Name.constants.ts`, and `Name.helpers.ts` for local-only utilities. Once a helper is needed by more than one folder, move it out of `Name.helpers.ts` and into `src/utils/` instead of importing it across folders, dropping the `.helpers` suffix on the move (e.g. `Tag.helpers.ts` → `src/utils/tag/tag.ts`). Example, `src/components/tagList/`:

```
tagList/
├── TagList.tsx
├── TagList.test.tsx
├── index.ts
└── tag/
    ├── Tag.tsx
    ├── Tag.test.tsx
    ├── Tag.types.ts
    ├── Tag.constants.ts
    ├── Tag.helpers.ts
    └── index.ts
```

`TagList.tsx` imports `Tag` from `./tag` (child); nothing outside `tagList/` imports `Tag` directly. The same pattern repeats for utils, e.g. `src/utils/loadExperiences/joinJobsWithRecommendations/`.
