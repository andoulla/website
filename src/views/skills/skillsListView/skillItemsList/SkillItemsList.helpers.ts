import type { Theme } from '@mui/material/styles';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import { computeShadeColour } from '@/utils/computeShadeColour';
import { skillShadeIndex } from '@/utils/skillColour';

export const dotColour = (skill: SkillSummary, theme: Theme): string => {
  const { colour } = skill; // the MUI palette key stored on the skill, e.g. 'primary'
  if (colour === 'default') return theme.palette.grey[400]; // no colour assigned — plain grey
  const paletteEntry = theme.palette[colour as keyof typeof theme.palette]; // look up that palette entry
  if (paletteEntry === null || typeof paletteEntry !== 'object' || !('main' in paletteEntry)) {
    return theme.palette.grey[400]; // not a colour object — fall back to grey
  }
  const { bg } = computeShadeColour(
    (paletteEntry as { main: string }).main, // base colour to shade from
    skillShadeIndex(skill.skill), // deterministic shade index derived from the skill name
    theme.palette.getContrastText
  );
  return bg; // the shaded background colour for this skill's dot
};
