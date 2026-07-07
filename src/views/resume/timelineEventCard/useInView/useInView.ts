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
          // Toggle on every crossing (not just the first) so cards fade both in and out.
          setIsInView(entry.isIntersecting);
        },
        { threshold, rootMargin }
      );
      observer.observe(node);

      // React 19 ref-callback cleanup: runs when the node unmounts or the ref changes.
      return () => observer.disconnect();
    },
    [threshold, rootMargin]
  );

  return { ref, isInView };
};
