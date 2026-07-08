import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import { memo, type ReactNode } from 'react';

import { computeShadeColour } from '@/utils/computeShadeColour';

export interface TagProps {
  children: ReactNode;
  colour?: ChipProps['color'];
  shadeIndex?: number;
  variant?: ChipProps['variant'];
  onClick?: () => void;
}

export const Tag = memo(({ children, colour, shadeIndex, variant, onClick }: TagProps) => {
  const theme = useTheme();

  if (shadeIndex !== undefined && colour !== undefined && colour !== 'default') {
    const paletteEntry = theme.palette[colour as keyof typeof theme.palette];
    if (paletteEntry !== null && typeof paletteEntry === 'object' && 'main' in paletteEntry) {
      const { bg, textColour } = computeShadeColour(
        (paletteEntry as { main: string }).main,
        shadeIndex,
        theme.palette.getContrastText
      );
      return (
        <Chip
          size="small"
          label={children}
          sx={{ bgcolor: bg, color: textColour }}
          onClick={onClick}
        />
      );
    }
  }

  return <Chip label={children} color={colour} variant={variant} size="small" onClick={onClick} />;
});

Tag.displayName = 'Tag';
