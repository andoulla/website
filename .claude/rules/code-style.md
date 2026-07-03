# Code style

- One component/util per folder: `ComponentName.tsx`, co-located `ComponentName.test.tsx`, and an `index.ts` barrel export. See [src/components/tag/](../../src/components/tag/) for the pattern.
- When types defined inside a file need to be used elsewhere, extract them into a co-located `x.types.ts` file and import from there. Do not define reusable types inline in the implementation file.
- Utility helper implementations use the suffix `x.helpers.ts` (e.g. `skillColor.helpers.ts`). Co-located tests follow the same stem: `x.helpers.test.ts`.
- Notable ESLint rules to respect: no `any` (`@typescript-eslint/no-explicit-any`), no floating/misused promises, `consistent-type-imports`, `strict-boolean-expressions`, and grouped/ordered imports (builtin → external → internal → parent → sibling → index, with blank lines between groups).
- Prettier: single quotes, semicolons, trailing commas (ES5), 100 char width ([.prettierrc](../../.prettierrc)).
- Prefer `const` arrow functions over `function` declarations (`export const Foo = () => { ... }`). If a `function` declaration is required (e.g. generators, hoisting), add a comment above it explaining why.
