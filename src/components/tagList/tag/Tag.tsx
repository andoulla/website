import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import { memo, type ReactNode } from 'react';

import { computeShadeColour } from '@/utils/computeShadeColour';
import { resolveSkillColourMain } from '@/utils/skillColour';

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
    const { bg, textColour } = computeShadeColour(
      resolveSkillColourMain(colour, theme),
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

  return <Chip label={children} color={colour} variant={variant} size="small" onClick={onClick} />;
});

Tag.displayName = 'Tag';
