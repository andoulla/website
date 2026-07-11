---
paths:
  - 'src/**/*.test.{ts,tsx}'
---

# Testing conventions

- Tests follow **React Testing Library guiding principles**: query the DOM the way a user would (`getByRole`, `getByText`, `getByLabelText`, etc.) instead of `container.querySelector`/test IDs, and assert on rendered output/behavior rather than implementation details. Where this file doesn't call out a specific pattern, default to RTL's own recommended practices (e.g. [testing-library.com/docs](https://testing-library.com/docs/)) rather than deciding ad hoc.
- Use `const screen = render(<Component />)` — alias the render result as `screen` and use its bound query methods. Do not import the global `screen` from `@testing-library/react`.
- For a component that suspends via `use()` (e.g. anything reading `useCareerDataContext()`), `findBy*`/`waitFor` do not reliably observe the resulting re-render in this project's React 19 + jsdom setup — confirmed by test runs where converting these to `findBy*` left them timing out stuck on the Suspense fallback. Render first, then flush explicitly, then query normally: `const screen = render(...); await act(async () => { await Promise.resolve(); }); expect(screen.getByText('...')).toBeVisible();`. Don't reach for `findBy*` here even though it's the general RTL recommendation — it doesn't hold for `use()`-driven Suspense in this codebase.
- For a component whose async data flows through plain `useState`/`useEffect` (not `use()`/Suspense) — e.g. `Articles` — regular updates commit normally, so `findBy*` as the wait gate works as RTL intends: `const screen = render(...); expect(await screen.findByText('...')).toBeVisible();`.
- Group a component's tests in a `describe` block named after the component, e.g. `describe('Tag', () => { ... })`.
- When asserting an element is present, use `toBeVisible()` rather than `toBeInTheDocument()` — it's a stronger check. For absence, keep `queryBy...` + `.not.toBeInTheDocument()` (`toBeVisible()` requires a real element, so it can't assert on a `null` query result).
- Don't use regexes for copy in locators (e.g. `getByText(/Present/)`). Match the exact, full string instead — it's easier to read and doesn't silently pass on partial matches.
- Simulate interactions with `userEvent` (`@testing-library/user-event`), not `fireEvent` — `userEvent` fires the fuller sequence of events a real user interaction produces (pointer/focus/keyboard events alongside the click), so it catches handler bugs `fireEvent` can miss. Reserve `fireEvent` for cases `userEvent` can't express.
- Don't split assertions about the same component state across multiple `test()` blocks. Write one test per distinct state/behavior and assert everything relevant to it there, rather than adding another test purely to re-render the same state and check one more thing.
- Only add a separate test when there's a specific reason to isolate it: a different setup, a different interaction, or a failure you want to pinpoint independently.
- Applies especially to `jest-axe` checks: cover every distinct component state with `expect(await axe(container)).toHaveNoViolations()`, folded into the existing test that already puts the component into that state (e.g. at the end of the test that clicks into a given view) — not a dedicated `'has no axe violations in that view'` test.
- Only add a standalone axe test when no functional test already produces that state.
- Use the builder classes in [src/testing/](../../src/testing/) to create typed mock objects — never write inline object literals or local `makeX()` helpers. Import `Article`, `TimelineEvent`, `Recommendation`, `Skill`, or `SkillSummary` from `../../testing` (adjust depth) and chain setter methods named after each field (no prefix), then call `.mock()`: `new TimelineEvent().companyName('Acme').mock()`.
- Never import real production data (`@/data/careerHistory`, `@/data/skills`, etc.) into a test — build fixtures with the builder classes instead, even for mappings keyed by real-looking ids.
- Don't extract locator text (button labels, link names, etc.) into local consts merely to reuse it across tests — inline the literal string at each call site. A const only earns its keep when the value itself is the subject of the assertion, not just a query argument.
- ESLint enforces a blank line between variable declarations and `expect(...)` calls (`padding-line-between-statements`). Always put a blank line between your arrange/act setup and your assertions.

## When a new test is warranted

- This project follows the **testing pyramid, minus the e2e layer**: `x.helpers.test.ts` unit tests at the base (pure functions), `Component.test.tsx` tests above them (RTL, user-facing behavior), no e2e/browser layer on top. There's no third layer to catch cross-page/cross-route flows — that's a deliberate gap for this project's size, not an oversight.
- Add a test only for a behavior/branch not already covered, in either layer — not to pad coverage numbers. The "don't split assertions" rule above applies here too: prefer widening an existing test over adding a new one, unless setup/interaction genuinely differs.
- Test count scales with distinct behaviors (URL-synced filters, render branches, interaction outcomes) — that's expected, not a smell. Only remove a test if it duplicates a branch another test already covers; don't trim to hit a lower count.
