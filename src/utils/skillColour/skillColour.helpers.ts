import type { Theme } from '@mui/material/styles';

import { CATEGORY_COLOUR_PALETTE, CUSTOM_COLOUR_HEX } from './skillColour.constants';
import type { CustomSkillColour, SkillColour } from './skillColour.types';

export const isCustomSkillColour = (colour: SkillColour): colour is CustomSkillColour =>
  colour in CUSTOM_COLOUR_HEX;

// Coloured by category position in the track file; past the palette = grey fallback, no hue reuse.
export const categoryColourFromIndex = (categoryIndex: number): SkillColour =>
  CATEGORY_COLOUR_PALETTE[categoryIndex] ?? 'default';

const SHADE_COUNT = 6;

/** Stable 0–5 index used to pick a shade of the category colour for a given skill. */
export const skillShadeIndex = (skill: string): number => {
  const charSum = [...skill].reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return charSum % SHADE_COUNT;
};

export const resolveSkillColourMain = (colour: SkillColour, theme: Theme): string => {
  if (isCustomSkillColour(colour)) return CUSTOM_COLOUR_HEX[colour][theme.palette.mode];

  return theme.palette.grey[400];
};
