import type { SkillCategory } from '@/data/skills.types';

export interface CategoryRadarPoint {
  category: SkillCategory;
  label: string;
  avgYears: number;
  skillCount: number;
  isMatch: boolean;
}
