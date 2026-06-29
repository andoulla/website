---
paths:
  - 'src/**/*.test.{ts,tsx}'
---

# Testing conventions

- Tests follow **React Testing Library guiding principles**: query the DOM the way a user would (`getByRole`, `getByText`, `getByLabelText`, etc.) instead of `container.querySelector`/test IDs, and assert on rendered output/behavior rather than implementation details.
- Use `const screen = render(<Component />)` — alias the render result as `screen` and use its bound query methods. Do not import the global `screen` from `@testing-library/react`. For async tests that need to flush a resolved promise, render first then flush separately: `const screen = render(...); await act(async () => { await Promise.resolve(); });`
- Group a component's tests in a `describe` block named after the component, e.g. `describe('Tag', () => { ... })`.
- When asserting an element is present, use `toBeVisible()` rather than `toBeInTheDocument()` — it's a stronger check. For absence, keep `queryBy...` + `.not.toBeInTheDocument()` (`toBeVisible()` requires a real element, so it can't assert on a `null` query result).
- Don't use regexes for copy in locators (e.g. `getByText(/Present/)`). Match the exact, full string instead — it's easier to read and doesn't silently pass on partial matches.
- Write one `jest-axe` accessibility check per distinct component state. Use `axe` from `jest-axe` and `expect(await axe(container)).toHaveNoViolations()`. Each rendered state (e.g. default, loading, empty, error) needs its own check — don't reuse a single axe call to cover multiple states.
