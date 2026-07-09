import type { Theme } from '@mui/material/styles';

import { skills } from '@/data/skills';

import { CATEGORY_COLOUR_MAP, CUSTOM_COLOUR_HEX } from './skillColour.constants';
import type { CustomSkillColour, SkillCategory, SkillColour } from './skillColour.types';

export const isCustomSkillColour = (colour: SkillColour): colour is CustomSkillColour =>
  colour in CUSTOM_COLOUR_HEX;

const SKILL_CATEGORY_MAP: Record<string, SkillCategory> = Object.fromEntries(
  skills.map((skill) => [skill.name, skill.category])
);

// 'tooling' is the fallback for a skill name absent from the master list — arbitrary but
// deliberately the most catch-all-ish of the 5 categories.
export const skillCategory = (skill: string): SkillCategory => {
  return SKILL_CATEGORY_MAP[skill] ?? 'tooling';
};

export const skillColour = (skill: string): SkillColour => {
  return CATEGORY_COLOUR_MAP[skillCategory(skill)];
};

const SHADE_COUNT = 6;

/** Stable 0–5 index used to pick a shade of the category colour for a given skill. */
export const skillShadeIndex = (skill: string): number => {
  const charSum = [...skill].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return charSum % SHADE_COUNT;
};

export const resolveSkillColourMain = (colour: SkillColour, theme: Theme): string => {
  if (isCustomSkillColour(colour)) return CUSTOM_COLOUR_HEX[colour];
  if (colour === 'default') return theme.palette.grey[400];
  return theme.palette[colour].main;
};
