# Website

|             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CI**      | [![CI](https://github.com/andoulla/website/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/andoulla/website/actions/workflows/ci.yml) [![Lighthouse CI](https://github.com/andoulla/website/actions/workflows/lighthouse.yml/badge.svg?branch=main)](https://github.com/andoulla/website/actions/workflows/lighthouse.yml) [![coverage](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/andoulla/2f98972c40d0ed596e2e24440467d706/raw/coverage.json)](https://gist.github.com/andoulla/2f98972c40d0ed596e2e24440467d706) |
| **Stack**   | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white) ![MUI](https://img.shields.io/badge/MUI-9-007FFF?logo=mui&logoColor=white) ![Recharts](https://img.shields.io/badge/Recharts-3-22B5BF)                                                                                                                                                         |
| **Tooling** | ![Jest](https://img.shields.io/badge/tested_with-Jest-C21325?logo=jest&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-enabled-4B32C3?logo=eslint&logoColor=white) ![Prettier](https://img.shields.io/badge/code_style-Prettier-F7B93E?logo=prettier&logoColor=black)                                                                                                                                                                                                                                                                                |
| **Meta**    | [![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue.svg)](LICENSE) ![Last commit](https://img.shields.io/github/last-commit/andoulla/website)                                                                                                                                                                                                                                                                                                                                                                    |

## About

A minimal React + TypeScript personal site, built entirely through AI pair-programming — no manual code.

**Why it exists** — two experiments running in parallel:

- **AI-only development:** every line was written by Claude. Deliberately avoiding the urge to switch back to manual was the point — to find where AI assistance genuinely helps and where it falls short. This is not a workflow I'd recommend for production work.
- **First time with MUI:** Material UI (v9) was chosen specifically to learn it from scratch with AI assistance, to see how the tool handles an unfamiliar library.
- **Strict mode across the stack:** TypeScript `strict: true`, no-any ESLint, Prettier, full Jest + jest-axe coverage. The discipline catches API misuse and type gaps early; the trade-off is more scaffolding overhead. Observing how that shapes AI-generated code was part of the experiment.

**Models used (via [Claude Code](https://claude.ai/code)):** Sonnet 4.6, Sonnet 5, Fable 5, Haiku 4.6, Haiku 5, Opus 4.8.

## Available scripts

- `yarn install` — install dependencies
- `yarn dev` — start Vite development server
- `yarn build` — create production build
- `yarn preview` — preview production build locally
- `yarn test` — run Jest tests (includes jest-axe accessibility checks)
- `yarn test:coverage` — run Jest tests with coverage report
- `yarn lint` — run ESLint
- `yarn lint:fix` — fix lintable issues
- `yarn format` — format code with Prettier
- `yarn format:check` — check formatting without writing changes
- `yarn typecheck` — run TypeScript type checking
- `yarn draft:mappings` — report-only draft of responsibility/recommendation → skill mappings (writes to gitignored `scripts/output/`, never to `src/data/`)

## CI/CD

- **[CI](.github/workflows/ci.yml)** — lint, format check, typecheck, test (with coverage), build. Runs on every PR to `main` and on push to `main`. Coverage output is uploaded as a workflow artifact and summarised in the job summary.
- **[Lighthouse CI](.github/workflows/lighthouse.yml)** — builds the app, serves it locally, and audits Performance, Accessibility, Best Practices, and SEO. Results are uploaded as a workflow artifact and to temporary public storage; it's informational and does not block merges.

Coverage is computed on every CI run and the result is written to a GitHub Gist — the badge above reflects the current percentage on `main`. The Lighthouse badge reflects workflow pass/fail; full score reports are available as artifacts on each run.

## Pages

Data loads asynchronously via React 19's `use()` hook under `Suspense`; the nav bar has a settings dropdown (tune icon) with colour theme (green / purple), light/dark mode, View Source, and Report a Problem.

**Resume** (`/`)

- Chronological work + education timeline with inline recommendations; shows a skeleton while data loads
- Three track tabs (General, Lead / Engineering Manager, Senior Engineer) synced to `?track=` — jobs with nothing in-track collapse to a compact card; education always visible
- Click a "Key Skills" chip to jump to that skill on the Skills page highlighted
- Click "View this role's skills on the graph" to open the Skills page with all of that role's skills highlighted
- Click a recommendation's LinkedIn icon to open the original
- Deep-link via `?skill=<name>` or `?recommendation=<id>` — auto-scrolls + highlights; synonyms resolve

**Skills** (`/skills`)

- List, bar chart, and radar views (persisted in `?view=`); search + category/sub-category filters; `?skill=<name>` deep links
- Categories/sub-categories from the active track's taxonomy; years of experience = summed durations of linked jobs
- Hover a skill for a tooltip — name, subcategory, years, per-company breakdown, links to Resume/recommendations
- Toggle "Patterns" (bar chart) for colour-blind-safe textures
- Filter by category/sub-category via the Filters dropdown (multi-select); stale filters self-clean on track switch
- Copy the current URL (track, view, filters, search, highlighted skill) via the copy-link button

**Articles** (`/articles`) — fetches and renders posts from a Medium RSS feed.
