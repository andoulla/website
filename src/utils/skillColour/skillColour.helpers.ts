import { skills } from '../../data/skills';

import type { SkillCategory, SkillColour } from './skillColour.types';

const CATEGORY_COLOUR_MAP: Record<SkillCategory, SkillColour> = {
  engineering: 'primary',
  managerial: 'secondary',
  'soft-skills': 'success',
  other: 'info',
};

const SKILL_CATEGORY_MAP: Record<string, SkillCategory> = Object.fromEntries(
  skills.map((s) => [s.name, s.category])
);

export function skillCategory(skill: string): SkillCategory {
  return SKILL_CATEGORY_MAP[skill] ?? 'other';
}

export function skillColour(skill: string): SkillColour {
  return CATEGORY_COLOUR_MAP[skillCategory(skill)];
}

const SHADE_COUNT = 6;

/** Stable 0–5 index used to pick a shade of the category colour for a given skill. */
export function skillShadeIndex(skill: string): number {
  const charSum = [...skill].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return charSum % SHADE_COUNT;
}
