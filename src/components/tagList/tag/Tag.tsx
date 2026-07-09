import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';
import { useTheme } from '@mui/material/styles';
import { memo, type ReactNode } from 'react';

import { computeShadeColour } from '@/utils/computeShadeColour';
import { isCustomSkillColour, resolveSkillColourMain } from '@/utils/skillColour';
import type { SkillColour } from '@/utils/skillColour';

export interface TagProps {
  children: ReactNode;
  colour?: SkillColour;
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

  // Custom hex colours (e.g. skill-category colours) aren't real MUI palette keys, so they can't
  // go through Chip's `color` prop — resolve to a flat background instead.
  if (colour !== undefined && isCustomSkillColour(colour)) {
    const resolved = resolveSkillColourMain(colour, theme);
    return (
      <Chip
        size="small"
        label={children}
        variant={variant}
        sx={{ bgcolor: resolved, color: theme.palette.getContrastText(resolved) }}
        onClick={onClick}
      />
    );
  }

  return <Chip label={children} color={colour} variant={variant} size="small" onClick={onClick} />;
});

Tag.displayName = 'Tag';
