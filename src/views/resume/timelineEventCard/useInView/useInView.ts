import { useCallback, useState } from 'react';

import type { UseInViewOptions, UseInViewResult } from './useInView.types';

export const useInView = <T extends Element>(
  options: UseInViewOptions = {}
): UseInViewResult<T> => {
  const { threshold = 0.15, rootMargin = '0px', initialInView = false, disabled = false } = options;
  const [isInView, setIsInView] = useState(initialInView);

  const ref = useCallback(
    (node: T | null) => {
      if (node === null || disabled) return undefined;

      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;

          // Toggle on every crossing (not just the first) so cards fade both in and out.
          setIsInView(entry.isIntersecting);
        },
        { threshold, rootMargin }
      );

      observer.observe(node);

      // React 19 ref-callback cleanup: runs when the node unmounts or the ref changes.
      return () => observer.disconnect();
    },
    [threshold, rootMargin, disabled]
  );

  return { ref, isInView: disabled ? true : isInView };
};
