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
- Simulate interactions with `userEvent` (`@testing-library/user-event`), not `fireEvent` — `userEvent` fires the fuller sequence of events a real user interaction produces (pointer/focus/keyboard events alongside the click), so it catches handler bugs `fireEvent` can miss. Reserve `fireEvent` for cases `userEvent` can't express.
- Don't split assertions about the same component state across multiple `test()` blocks — write one test per distinct state/behavior and assert everything relevant to it there, rather than adding another test purely to re-render the same state and check one more thing. Only add a separate test when there's a specific reason to isolate it (a different setup, a different interaction, or a failure you want to pinpoint independently). This applies in particular to `jest-axe` checks: cover every distinct component state with `expect(await axe(container)).toHaveNoViolations()`, but fold it into the existing test that already puts the component into that state (e.g. at the end of the test that clicks into a given view) instead of writing a dedicated `'has no axe violations in that view'` test. Only add a standalone axe test when no functional test already produces that state.
- Use the builder classes in [src/testing/](../../src/testing/) to create typed mock objects — never write inline object literals or local `makeX()` helpers. Import `WorkExperience`, `Recommendation`, `Skill`, or `SkillSummary` from `../../testing` (adjust depth) and chain setter methods named after each field (no prefix), then call `.mock()`: `new WorkExperience().companyName('Acme').mock()`.
- Don't extract locator text (button labels, link names, etc.) into local consts merely to reuse it across tests — inline the literal string at each call site. A const only earns its keep when the value itself is the subject of the assertion, not just a query argument.
- ESLint enforces a blank line between variable declarations and `expect(...)` calls (`padding-line-between-statements`). Always put a blank line between your arrange/act setup and your assertions.
