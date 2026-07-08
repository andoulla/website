import { useLayoutEffect, useRef } from 'react';

const FLIP_DURATION_MS = 400;

// FLIP reorder animation: measures this element's position on every render and, when it has
// moved since the last measurement, instantly offsets it back to its previous spot then
// transitions that offset away — so a reorder reads as a slide instead of a snap.
export const useFlipReorder = <T extends HTMLElement>(prefersReducedMotion: boolean) => {
  const elementRef = useRef<T | null>(null);
  const previousTopRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (element === null) return;

    const newTop = element.getBoundingClientRect().top;
    const previousTop = previousTopRef.current;
    previousTopRef.current = newTop;

    if (prefersReducedMotion || previousTop === null) return;

    const deltaY = previousTop - newTop;
    if (deltaY === 0) return;

    element.style.transition = 'none';
    element.style.transform = `translateY(${deltaY}px)`;
    // Force a reflow so the browser commits the offset above before we transition it away —
    // without this, both style changes would be coalesced into one and nothing would animate.
    element.getBoundingClientRect();
    element.style.transition = `transform ${FLIP_DURATION_MS}ms ease`;
    element.style.transform = '';
  });

  return elementRef;
};
