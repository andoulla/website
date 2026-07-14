import type { SkillCategory } from '@/types';

export interface CategoryRadarPoint {
  category: SkillCategory;
  label: string;
  avgYears: number;
  skillCount: number;
  isMatch: boolean;
}
