import type { Theme } from '@mui/material/styles';

import { skills } from '@/data/skills';

import {
  CATEGORY_COLOUR_MAP,
  CATEGORY_COLOUR_PALETTE,
  CUSTOM_COLOUR_HEX,
} from './skillColour.constants';
import type { CustomSkillColour, SkillCategory, SkillColour } from './skillColour.types';

export const isCustomSkillColour = (colour: SkillColour): colour is CustomSkillColour =>
  colour in CUSTOM_COLOUR_HEX;

const SKILL_CATEGORY_MAP: Record<string, SkillCategory> = Object.fromEntries(
  skills.map((skill) => [skill.name, skill.category])
);

// Legacy lookup for the old fixed taxonomy — resume card only, dies with the legacy fields.
// 'tooling' is the fallback for a skill name absent from the master list — arbitrary but
// deliberately the most catch-all-ish of the 5 categories.
export const skillCategory = (skill: string): SkillCategory => {
  return SKILL_CATEGORY_MAP[skill] ?? 'tooling';
};

// Legacy colour lookup — resume card only, dies with the legacy fields.
export const skillColour = (skill: string): SkillColour => {
  return CATEGORY_COLOUR_MAP[skillCategory(skill)];
};

// Track categories are coloured by position in the track file; anything past the palette
// renders in the grey fallback rather than reusing a hue.
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
