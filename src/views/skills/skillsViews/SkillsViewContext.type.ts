import type { ReactNode } from 'react';

import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { Recommendation } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

export interface SkillsViewContextValue {
  skills: SkillSummary[];
  filteredSkills: SkillSummary[];
  recommendations: Recommendation[];
  selectedCategories: SkillCategory[];
  selectedSubCategories: SkillSubCategory[];
  highlightedSkill?: string;
  searchTerm: string;
}

export interface SkillsViewContextProviderProps extends Omit<
  SkillsViewContextValue,
  'filteredSkills'
> {
  children: ReactNode;
}
