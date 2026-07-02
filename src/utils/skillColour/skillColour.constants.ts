import type { SkillCategory, SkillColour } from './skillColour.types';

export const CATEGORY_COLOUR_MAP: Record<SkillCategory, SkillColour> = {
  engineering: 'primary',
  managerial: 'secondary',
  'soft-skills': 'success',
  other: 'info',
};
