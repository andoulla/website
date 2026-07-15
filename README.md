# Website

[![CI](https://github.com/andoulla/website/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/andoulla/website/actions/workflows/ci.yml)
[![Lighthouse CI](https://github.com/andoulla/website/actions/workflows/lighthouse.yml/badge.svg?branch=main)](https://github.com/andoulla/website/actions/workflows/lighthouse.yml)
[![codecov](https://codecov.io/gh/andoulla/website/branch/main/graph/badge.svg)](https://codecov.io/gh/andoulla/website)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue.svg)](LICENSE)
![Last commit](https://img.shields.io/github/last-commit/andoulla/website)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-9-007FFF?logo=mui&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3-22B5BF)
![Jest](https://img.shields.io/badge/tested_with-Jest-C21325?logo=jest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-enabled-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/code_style-Prettier-F7B93E?logo=prettier&logoColor=black)

A minimal React + TypeScript web app with strict mode, ESLint, Prettier, and Jest + React Testing Library.

This is a personal project I'm using to explore Claude's models and features, with the aim of understanding their capabilities and learning how to use them effectively. It also serves as a testbed for working with all libraries and frameworks in strict mode, to see how that discipline shapes the development process and the resulting code.

## Pages

- **Resume** (`/`) — chronological timeline of work and education history with inline recommendations, viewed through three track tabs (Lead / Engineering Manager, Senior Engineer, and Full — the default). Role tabs hide responsibilities, skills, and tech stack not relevant to that track (a job with nothing relevant collapses to a compact primary-info card); education entries are always visible and visually distinguished (institution logo or a School icon); shows a skeleton while data loads
- **Skills** (`/skills`) — three views (list, bar chart, radar) built on Recharts; supports search, category/sub-category filtering, and deep-linking to a specific skill via `?skill=<name>`. Categories and sub-categories come from the active track's taxonomy file (`src/data/tracks/*.json`), coloured by category position; skill names and search synonyms come from a master list (`src/data/skills.json`), and a skill's years of experience are computed by summing the durations of the jobs it's linked to there. The active track syncs to `?track=` on both pages
- **Articles** (`/articles`) — fetches and renders posts from a Medium RSS feed

The nav bar also exposes a dark mode toggle and a theme switcher (green / purple).

Data is loaded asynchronously via React 19's `use()` hook under `Suspense` — the JSON fixtures are code-split and fetched with an artificial delay so loading states are actually visible during development.

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

CI now uploads coverage to [Codecov](https://codecov.io) on every run, but the badge above won't populate until the repo is linked there — see "Codecov setup" below. There's no live Lighthouse-score badge, since that would require a hosted Lighthouse CI Server; the Lighthouse badge instead reflects the workflow's pass/fail status, and full reports are available as artifacts on each run.

### Codecov setup

The coverage badge and reports need a one-time setup that can't be done from the repo alone:

1. Sign in to [codecov.io](https://codecov.io) with GitHub and add the `andoulla/website` repo (free for public repos).
2. Copy the repo upload token from Codecov's settings for this repo.
3. Add it as a repo secret named `CODECOV_TOKEN` (Settings → Secrets and variables → Actions → New repository secret).
4. Push to `main` or open a PR — the existing `codecov/codecov-action` step in [ci.yml](.github/workflows/ci.yml) will upload `coverage/lcov.info`, and the badge will start reporting real numbers.

Until that's done, the upload step no-ops safely (`fail_ci_if_error: false`) rather than failing CI.

## Features & interactions

**Nav bar**

- Toggle the colour theme (green / purple) via the palette icon button
- Toggle light/dark mode via the Light/Dark buttons
- Navigate between Home, Skills, and Articles

**Resume**

- Switch track tabs (Lead / Engineering Manager, Senior Engineer, Full) to filter every card to that track — synced to `?track=`, which the nav links and skill-chip links carry along
- Click a "Key Skills" chip on a card to jump to that skill on the Skills page, highlighted
- Click "View this role's skills on the graph" to jump to the Skills page with all of that role's skills highlighted
- Click a recommendation's LinkedIn icon to open the original recommendation
- Deep-link into a card via `?skill=<name>` or `?recommendation=<id>` — it auto-scrolls into view and gets a highlighted outline; old skill names still resolve via synonyms
- Education entries show an institution logo (or a School icon)

**Skills**

- Switch between list, bar chart, and radar views (persisted in `?view=`)
- Hover a skill (bar, list row, or radar category vertex) for a tooltip — name, subcategory, years, per-company breakdown, and links back to that skill on the Resume or to its first recommendation
- Toggle "Patterns" (bar chart view) to fill bars with colour-blind-safe textures instead of solid colour
- Filter by category and sub-category via the Filters dropdown (multi-select checkboxes) — options, grouping, and colours reflect the active track, and stale filters self-clean on track switch
- Search skills by name; a hint reports matches hidden by active filters
- Copy the current URL (track, view, filters, search, highlighted skill) via the copy-link button
- Deep-link to a skill via `?skill=<name>` — old names and synonyms resolve to the canonical skill

**Articles**

- Browse posts pulled live from a Medium RSS feed
