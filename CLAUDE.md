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

## Directory layout

- [src/components/](src/components/) — shared/reusable UI components
- [src/views/](src/views/) — page-level views (e.g. [resume](src/views/resume/))
- [src/context/](src/context/) — React context providers (e.g. [resumeData](src/context/resumeData/) holds the deferred resume data, read via `use()` under `Suspense`)
- [src/data/](src/data/) — data fixtures, each as JSON plus a typed `.ts` wrapper
- [src/theme/](src/theme/) — MUI theme setup
- [src/utils/](src/utils/) — pure utility functions
