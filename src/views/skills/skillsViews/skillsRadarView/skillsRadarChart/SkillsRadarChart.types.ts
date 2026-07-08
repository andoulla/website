import type { SkillCategory } from '@/data/skills.types';

export interface CategoryRadarPoint {
  category: SkillCategory;
  label: string;
  years: number;
  skillCount: number;
  isMatch: boolean;
}
