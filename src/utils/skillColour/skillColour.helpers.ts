import type { Theme } from '@mui/material/styles';

import { skills } from '@/data/skills';

import { CATEGORY_COLOUR_MAP } from './skillColour.constants';
import type { SkillCategory, SkillColour } from './skillColour.types';

const SKILL_CATEGORY_MAP: Record<string, SkillCategory> = Object.fromEntries(
  skills.map((skill) => [skill.name, skill.category])
);

export const skillCategory = (skill: string): SkillCategory => {
  return SKILL_CATEGORY_MAP[skill] ?? 'other';
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

// Resolves a SkillColour key to its palette hex, or grey if unrecognised.
export const resolveSkillColourMain = (colour: SkillColour, theme: Theme): string => {
  if (colour === 'default') return theme.palette.grey[400];
  const entry = theme.palette[colour as keyof typeof theme.palette];
  if (entry !== null && typeof entry === 'object' && 'main' in entry) {
    return (entry as { main: string }).main;
  }
  return theme.palette.grey[400];
};
