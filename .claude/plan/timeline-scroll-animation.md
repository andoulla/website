# Scroll-triggered fade animation for Resume timeline cards

## Context

Add a subtle fade+slide animation to each `TimelineEventCard` in the Resume timeline: fades/slides
in on entering the viewport, out on leaving, repeating on every crossing. No animation library
installed or needed — custom `IntersectionObserver` hook + MUI `sx`/`theme.transitions`.
Tuning: **32px drift, 650ms duration** (user-confirmed "slightly more noticeable").

## New files

`src/views/resume/timelineEventCard/useInView/` (nested under sole consumer, per CLAUDE.md
nesting convention — not `src/hooks/`, not `src/utils/` which is pure-functions-only):

- `useInView.types.ts`:
  ```ts
  export interface UseInViewOptions {
    threshold?: number;
    rootMargin?: string;
  }
  export interface UseInViewResult<T extends Element> {
    ref: (node: T | null) => (() => void) | void;
    isInView: boolean;
  }
  ```
- `useInView.ts` — callback ref w/ React 19 cleanup-return (not useRef+useEffect):

  ```ts
  import { useCallback, useState } from 'react';
  import type { UseInViewOptions, UseInViewResult } from './useInView.types';

  export const useInView = <T extends Element>(
    options: UseInViewOptions = {}
  ): UseInViewResult<T> => {
    const { threshold = 0.15, rootMargin = '0px' } = options;
    const [isInView, setIsInView] = useState(false);

    const ref = useCallback(
      (node: T | null) => {
        if (node === null) return undefined;
        const observer = new IntersectionObserver(
          (entries) => {
            const [entry] = entries;
            setIsInView(entry.isIntersecting);
          },
          { threshold, rootMargin }
        );
        observer.observe(node);
        return () => observer.disconnect();
      },
      [threshold, rootMargin]
    );

    return { ref, isInView };
  };
  ```

- `index.ts` — re-export `useInView`, `UseInViewOptions`, `UseInViewResult`.
- `useInView.test.ts` — `renderHook`/`act`, test-local mock `IntersectionObserver` class
  (jest-mocked `observe`/`unobserve`/`disconnect`, stores `callback`/`options`, static
  `instances[]`), override `global.IntersectionObserver` in `beforeEach`/restore in `afterEach`.
  Cases: initial `isInView === false`; `ref(null)` creates no observer; `ref(node)` calls
  `observe(node)` and firing callback with `isIntersecting: true/false` toggles `isInView`;
  calling the returned cleanup fn calls `disconnect()` once; `threshold`/`rootMargin` reach the
  observer's constructor options.

No `unobserve`-after-first-hit — must toggle on every crossing, not fire once. Initial state
`false` (not `true`): real observers fire async, so `true` would flash below-fold cards visible
then animate them away right after load; `false` lets above-fold cards fade up on mount instead
(expected "reveal" behavior) without breaking existing tests (see setupTests below).

`src/views/resume/timelineEventCard/TimelineEventCard.constants.ts`:

```ts
export const CARD_FADE_TRANSLATE_Y = '32px';
export const CARD_FADE_DURATION_MS = 650;
```

`src/views/resume/timelineEventCard/TimelineEventCard.helpers.ts`:

```ts
import type { SxProps, Theme } from '@mui/material/styles';
import { CARD_FADE_DURATION_MS, CARD_FADE_TRANSLATE_Y } from './TimelineEventCard.constants';

export const getCardMotionSx = (
  isInView: boolean,
  prefersReducedMotion: boolean
): SxProps<Theme> => {
  if (prefersReducedMotion) return { opacity: 1 };

  return {
    opacity: isInView ? 1 : 0,
    transform: isInView ? 'translateY(0)' : `translateY(${CARD_FADE_TRANSLATE_Y})`,
    transition: (theme: Theme) =>
      theme.transitions.create(['opacity', 'transform'], {
        duration: CARD_FADE_DURATION_MS,
        easing: theme.transitions.easing.easeOut,
      }),
  };
};
```

Reduced-motion returns `{ opacity: 1 }` only — no `transform`/`transition` keys, avoiding a
position snap on scroll.

`TimelineEventCard.helpers.test.ts` — plain unit tests, no mocks: not-in-view →
`{ opacity: 0, transform: 'translateY(32px)' }`; in-view → `{ opacity: 1, transform:
'translateY(0)' }`; reduced-motion → exactly `{ opacity: 1 }`.

## Modified files

`src/views/resume/timelineEventCard/TimelineEventCard.tsx`:

- Add imports (grouped with existing sibling imports, alphabetical): `useMediaQuery` from
  `@mui/material/useMediaQuery`; `getCardMotionSx` from `./TimelineEventCard.helpers`;
  `useInView` from `./useInView`.
- After `const duration = formatDuration(...)`:
  ```ts
  const { ref, isInView } = useInView<HTMLDivElement>();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  ```
- Root element (currently `<Card elevation={0}>` at line 58) →
  `<Card ref={ref} elevation={0} sx={getCardMotionSx(isInView, prefersReducedMotion)}>`.
  Attach ref directly to `Card` (forwards to underlying `div`), no wrapper element.
- Rest of file unchanged.

`src/setupTests.ts` — add two jsdom stubs, grouped with the existing `ResizeObserver` stub
(jsdom implements neither; `matchMedia` is this codebase's first `useMediaQuery` use, so every
existing `TimelineEventCard` test would throw without it):

```ts
global.IntersectionObserver = class IntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}
  // Fires synchronously with isIntersecting: true so components render visible by default.
  observe = (target: Element) => {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as never);
  };
  unobserve = () => {};
  disconnect = () => {};
  takeRecords = (): IntersectionObserverEntry[] => [];
  root = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
} as unknown as typeof IntersectionObserver;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

Because `observe()` fires synchronously during the ref callback in `render()`'s commit phase,
`isInView` is already `true` by the time `render()` returns — existing `toBeVisible()` assertions
in `TimelineEventCard.test.tsx` need no changes.

## Unchanged (verified, no action needed)

`Resume.tsx` (each card observes independently, no changes at `Timeline`/`ExperienceList`
level), `TimelineEventCard.test.tsx`, `TimelineEventSkeleton.tsx`.

## Comments

Add a one-line comment on non-obvious lines explaining what they do, e.g.: the callback-ref
cleanup return in `useInView.ts` (`return () => observer.disconnect();`), the toggle-not-once
`setIsInView(entry.isIntersecting)` line, the reduced-motion early-return branch in
`getCardMotionSx`, and the synchronous `observe()` callback in the `setupTests.ts`
`IntersectionObserver` stub.

## Verification

Don't run typecheck/lint/tests/dev server (user does, per CLAUDE.md). Walk through changes one at
a time — hook → styling helper → wiring in `TimelineEventCard.tsx` → setupTests stubs — asking
for confirmation before each next step. User confirms visually by scrolling the Resume page.
