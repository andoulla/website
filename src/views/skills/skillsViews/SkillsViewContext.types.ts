import type { ReactNode } from 'react';

import type { Track } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

export interface SkillsViewContextValue {
  track: Track;
  skills: SkillSummary[];
  filteredSkills: SkillSummary[];
  selectedCategories: string[];
  selectedSubCategories: string[];
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
