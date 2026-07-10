import { createContext, useContext, useMemo } from 'react';

import type {
  SkillsViewContextProviderProps,
  SkillsViewContextValue,
} from './SkillsViewContext.type';

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
      skills,
      filteredSkills,
      selectedCategories,
      selectedSubCategories,
      highlightedSkills,
      searchTerm,
      onClearFilters,
    }),
    [
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
