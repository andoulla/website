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
  // Barchart texture toggle, lifted so views stay zero-prop.
  showPatterns: boolean;
  onClearFilters: () => void;
}

export interface SkillsViewContextProviderProps extends Omit<
  SkillsViewContextValue,
  'highlightedSkills' | 'showPatterns'
> {
  highlightedSkills?: string[];
  showPatterns?: boolean;
  children: ReactNode;
}
