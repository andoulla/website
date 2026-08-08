import { useState, useCallback, useRef, useEffect } from 'react';

export interface AccessibleChartInteractionState {
  focusedId: string | null;
  position?: { x: number; y: number };
}

/**
 * Hook for managing accessible interactions on chart elements.
 * Handles focus, click, keyboard navigation, and touch events.
 * Provides tooltip state and positioning.
 */
export const useAccessibleChartInteraction = () => {
  const [state, setState] = useState<AccessibleChartInteractionState>({ focusedId: null });
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleFocus = useCallback(
    (id: string, position?: { x: number; y: number }) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setState({ focusedId: id, position });
    },
    []
  );

  const handleBlur = useCallback(() => {
    // Small delay to allow interaction with the tooltip before hiding
    timeoutRef.current = setTimeout(() => {
      setState({ focusedId: null });
    }, 150);
  }, []);

  const handleClick = useCallback((id: string, position?: { x: number; y: number }) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState((prev) => {
      // Toggle: if already focused, blur; otherwise focus
      if (prev.focusedId === id) {
        timeoutRef.current = setTimeout(() => {
          setState({ focusedId: null });
        }, 150);
        return { focusedId: null };
      }
      return { focusedId: id, position };
    });
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    state,
    handleFocus,
    handleBlur,
    handleClick,
    setFocused: (id: string | null, position?: { x: number; y: number }) =>
      setState({ focusedId: id, position }),
  };
};
