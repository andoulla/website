import { useState } from 'react';

// Tri-state so a user toggle always wins over a changing defaultOpen.
// null = no user interaction yet; the hook falls back to defaultOpen.
export const useCardExpand = (defaultOpen: boolean): [boolean, (next: boolean) => void] => {
  const [userExpanded, setUserExpanded] = useState<boolean | null>(null);

  return [userExpanded ?? defaultOpen, setUserExpanded];
};
