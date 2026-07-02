import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { computeShadeColor } from '../../utils/computeShadeColor';

export interface TagProps {
  children: ReactNode;
  color?: ChipProps['color'];
  shadeIndex?: number;
}

export function Tag({ children, color, shadeIndex }: TagProps) {
  const theme = useTheme();

  if (shadeIndex !== undefined && color !== undefined && color !== 'default') {
    const paletteEntry = theme.palette[color as keyof typeof theme.palette];
    if (paletteEntry !== null && typeof paletteEntry === 'object' && 'main' in paletteEntry) {
      const { bg, textColor } = computeShadeColor(
        (paletteEntry as { main: string }).main,
        shadeIndex,
        theme.palette.getContrastText
      );
      return <Chip size="small" label={children} sx={{ bgcolor: bg, color: textColor }} />;
    }
  }

  return <Chip label={children} color={color} size="small" />;
}
