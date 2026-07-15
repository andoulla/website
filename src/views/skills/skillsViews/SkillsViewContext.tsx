import { createContext, useContext, useMemo } from 'react';

import type {
  SkillsViewContextProviderProps,
  SkillsViewContextValue,
} from './SkillsViewContext.types';

const SkillsViewContext = createContext<SkillsViewContextValue | null>(null);

export const useSkillsViewContext = (): SkillsViewContextValue => {
  const ctx = useContext(SkillsViewContext);
  if (ctx === null) {
    throw new Error('useSkillsViewContext must be used within a SkillsViewContextProvider');
  }
  return ctx;
};

export const SkillsViewContextProvider = ({
  children,
  track,
  skills,
  filteredSkills,
  selectedCategories,
  selectedSubCategories,
  highlightedSkills = [],
  searchTerm,
  onClearFilters,
}: SkillsViewContextProviderProps) => {
  const value = useMemo<SkillsViewContextValue>(
    () => ({
      track,
      skills,
      filteredSkills,
      selectedCategories,
      selectedSubCategories,
      highlightedSkills,
      searchTerm,
      onClearFilters,
    }),
    [
      track,
      skills,
      filteredSkills,
      selectedCategories,
      selectedSubCategories,
      highlightedSkills,
      searchTerm,
      onClearFilters,
    ]
  );

  return <SkillsViewContext.Provider value={value}>{children}</SkillsViewContext.Provider>;
};
