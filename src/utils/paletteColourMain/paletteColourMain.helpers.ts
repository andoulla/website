import type { Theme } from '@mui/material/styles';

import type { SkillColour } from '@/utils/skillColour';

export const getPaletteColourMain = (colour: SkillColour, theme: Theme): string => {
  if (colour === 'default') return theme.palette.grey[400];
  return theme.palette[colour].main;
};
