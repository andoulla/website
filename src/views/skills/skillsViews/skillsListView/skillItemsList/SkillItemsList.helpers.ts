import type { Theme } from '@mui/material/styles';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import { computeShadeColour } from '@/utils/computeShadeColour';
import { resolveSkillColourMain, skillShadeIndex } from '@/utils/skillColour';

export const dotColour = (skill: SkillSummary, theme: Theme): string => {
  const { colour } = skill;
  // Grey fallback returns flat, unshaded — shading only applies to a real palette colour.
  if (colour === 'default') return theme.palette.grey[400];
  const paletteEntry = theme.palette[colour as keyof typeof theme.palette];
  if (paletteEntry === null || typeof paletteEntry !== 'object' || !('main' in paletteEntry)) {
    return theme.palette.grey[400];
  }
  const { bg } = computeShadeColour(
    resolveSkillColourMain(colour, theme),
    skillShadeIndex(skill.skill),
    theme.palette.getContrastText
  );
  return bg;
};
