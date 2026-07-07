import type { ReactNode } from 'react';

import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { Recommendation } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

export interface SkillsViewContextValue {
  skills: SkillSummary[];
  recommendations: Recommendation[];
  selectedCategories: SkillCategory[];
  selectedSubCategories: SkillSubCategory[];
  highlightedSkill?: string;
}

export interface SkillsViewContextProviderProps extends SkillsViewContextValue {
  children: ReactNode;
}
