# Website

A minimal React + TypeScript web app run in strict mode across the whole toolchain (TS, ESLint, tests). Personal project also used as a testbed for exploring Claude's models/features.

## Tech stack

- **React 19** + **TypeScript** (`strict: true` in [tsconfig.json](tsconfig.json))
- **Vite 8** — dev server / build ([vite.config.ts](vite.config.ts))
- **MUI** (`@mui/material`) + **Emotion** for styling
- **react-router-dom** v7
- **Jest 30** + **ts-jest** + **React Testing Library**, jsdom environment, setup file [src/setupTests.ts](src/setupTests.ts)
- **ESLint** + **Prettier**, enforced on commit via **Husky** + **lint-staged** ([.husky/pre-commit](.husky/pre-commit))
- Package manager: **yarn** (canonical — README and scripts assume yarn; ignore `package-lock.json` if present)

## Verifying changes

Before considering a change done, run:

```
yarn typecheck   # tsc --noEmit
yarn lint        # eslint
yarn test        # jest
```

Run `yarn build` as well if the change could affect the production build (config, env handling, asset imports). Use `yarn dev` to manually check UI changes in the browser.

Note: the pre-commit hook already runs `lint-staged` (`eslint --fix` + `prettier --write`) on staged files automatically — manual `yarn lint:fix` / `yarn format` are only needed to fix things before staging.

## Code conventions

- One component/util per folder: `ComponentName.tsx`, co-located `ComponentName.test.tsx`, and an `index.ts` barrel export. See [src/components/tag/](src/components/tag/) for the pattern.
- Notable ESLint rules to respect: no `any` (`@typescript-eslint/no-explicit-any`), no floating/misused promises, `consistent-type-imports`, `strict-boolean-expressions`, and grouped/ordered imports (builtin → external → internal → parent → sibling → index, with blank lines between groups).
- Prettier: single quotes, semicolons, trailing commas (ES5), 100 char width ([.prettierrc](.prettierrc)).
- Tests follow **React Testing Library guiding principles**: query the DOM the way a user would (`getByRole`, `getByText`, `getByLabelText`, etc.) instead of `container.querySelector`/test IDs, and assert on rendered output/behavior rather than implementation details.

## Directory layout

- [src/components/](src/components/) — shared/reusable UI components
- [src/views/](src/views/) — page-level views (e.g. [resume](src/views/resume/))
- [src/data/](src/data/) — data fixtures, each as JSON plus a typed `.ts` wrapper
- [src/theme/](src/theme/) — MUI theme setup
- [src/utils/](src/utils/) — pure utility functions
