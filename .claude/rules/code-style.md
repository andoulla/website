# Code style

- One component/util per folder: `ComponentName.tsx`, co-located `ComponentName.test.tsx`, and an `index.ts` barrel export. See [src/components/tag/](../../src/components/tag/) for the pattern.
- Notable ESLint rules to respect: no `any` (`@typescript-eslint/no-explicit-any`), no floating/misused promises, `consistent-type-imports`, `strict-boolean-expressions`, and grouped/ordered imports (builtin → external → internal → parent → sibling → index, with blank lines between groups).
- Prettier: single quotes, semicolons, trailing commas (ES5), 100 char width ([.prettierrc](../../.prettierrc)).
