import type { ReactNode } from 'react';

import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

export interface SkillsViewContextValue {
  skills: SkillSummary[];
  filteredSkills: SkillSummary[];
  selectedCategories: SkillCategory[];
  selectedSubCategories: SkillSubCategory[];
  highlightedSkills: string[];
  searchTerm: string;
}

export interface SkillsViewContextProviderProps extends Omit<
  SkillsViewContextValue,
  'filteredSkills' | 'highlightedSkills'
> {
  highlightedSkills?: string[];
  children: ReactNode;
}
