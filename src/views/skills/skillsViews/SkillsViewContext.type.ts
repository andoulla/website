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
  onClearFilters: () => void;
}

export interface SkillsViewContextProviderProps extends Omit<
  SkillsViewContextValue,
  'highlightedSkills'
> {
  highlightedSkills?: string[];
  children: ReactNode;
}
