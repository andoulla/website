import { useState } from 'react';

/**
 * Returns the resolved expanded state and a setter. Explicit user toggles always take
 * priority over a changing `defaultOpen`; the hook defers to `defaultOpen` until the
 * user first interacts.
 */
export const useCardExpand = (defaultOpen: boolean): [boolean, (next: boolean) => void] => {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

  return [userExpanded ?? defaultOpen, setUserExpanded];
};
