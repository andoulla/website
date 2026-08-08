import { useMemo } from 'react';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import type { ViewMode } from './Skills.types';

/**
 * Hook to determine the default view mode based on viewport.
 * - On mobile (<600px): defaults to 'table'
 * - On desktop (≥600px): defaults to 'radar'
 */
export const useDefaultViewMode = (): ViewMode => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px

  const defaultMode: ViewMode = useMemo(() => (isMobile ? 'table' : 'radar'), [isMobile]);

  return defaultMode;
};
