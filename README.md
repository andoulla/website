# Website

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-9-007FFF?logo=mui&logoColor=white)
![Jest](https://img.shields.io/badge/tested_with-Jest-C21325?logo=jest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-enabled-4B32C3?logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/code_style-Prettier-F7B93E?logo=prettier&logoColor=black)
![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial-blue.svg)
![Last commit](https://img.shields.io/github/last-commit/andoulla/website)

A minimal React + TypeScript web app with strict mode, ESLint, Prettier, and Jest + React Testing Library.

This is a personal project I'm using to explore Claude's models and features, with the aim of understanding their capabilities and learning how to use them effectively. It also serves as a testbed for working with all libraries and frameworks in strict mode, to see how that discipline shapes the development process and the resulting code.

## Pages

- **Resume** (`/`) — chronological timeline of work experience with inline recommendations; shows a skeleton while data loads
- **Skills** (`/skills`) — list and graph views of skills derived from the work experience data, colour-coded by category; supports deep-linking to a specific skill via `?skill=<name>`

The nav bar also exposes a dark mode toggle and a theme switcher (green / purple).

Data is loaded asynchronously via React 19's `use()` hook under `Suspense` — the JSON fixtures are code-split and fetched with an artificial delay so loading states are actually visible during development.

## Available scripts

- `yarn install` — install dependencies
- `yarn dev` — start Vite development server
- `yarn build` — create production build
- `yarn preview` — preview production build locally
- `yarn test` — run Jest tests (includes jest-axe accessibility checks)
- `yarn lint` — run ESLint
- `yarn lint:fix` — fix lintable issues
- `yarn format` — format code with Prettier
- `yarn typecheck` — run TypeScript type checking

## Performance notes

Fixed a handful of unnecessary re-render sources (no React Compiler is enabled, so memoization is manual):

- Memoized `ThemeContextProvider`'s context value and toggle callbacks
- Memoized derived skill/recommendation computations in the Skills views
- Stabilized list-item click callbacks and added `React.memo` to `Tag`, `TagList`, `TimelineEventCard`, and `RecommendationText`
