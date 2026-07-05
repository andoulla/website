import { skills } from '@/data/skills';

import { CATEGORY_COLOUR_MAP } from './skillColour.constants';
import type { SkillCategory, SkillColour } from './skillColour.types';

const SKILL_CATEGORY_MAP: Record<string, SkillCategory> = Object.fromEntries(
  skills.map((s) => [s.name, s.category])
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
  const charSum = [...skill].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return charSum % SHADE_COUNT;
};
