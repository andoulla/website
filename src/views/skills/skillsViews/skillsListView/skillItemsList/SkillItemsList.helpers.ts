import type { Theme } from '@mui/material/styles';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import { computeShadeColour } from '@/utils/computeShadeColour';
import { getPaletteColourMain } from '@/utils/paletteColourMain';
import { skillShadeIndex } from '@/utils/skillColour';

export const dotColour = (skill: SkillSummary, theme: Theme): string => {
  const { colour } = skill; // the MUI palette key stored on the skill, e.g. 'primary'
  if (colour === 'default') return theme.palette.grey[400]; // no colour assigned — plain grey
  const { bg } = computeShadeColour(
    getPaletteColourMain(colour, theme), // base colour to shade from
    skillShadeIndex(skill.skill), // deterministic shade index derived from the skill name
    theme.palette.getContrastText
  );
  return bg; // the shaded background colour for this skill's dot
};
