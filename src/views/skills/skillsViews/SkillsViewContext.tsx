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
  recommendations,
  selectedCategories,
  selectedSubCategories,
  highlightedSkill,
}: SkillsViewContextProviderProps) => {
  const value = useMemo<SkillsViewContextValue>(
    () => ({
      skills,
      recommendations,
      selectedCategories,
      selectedSubCategories,
      highlightedSkill,
    }),
    [skills, recommendations, selectedCategories, selectedSubCategories, highlightedSkill]
  );

  return <SkillsViewContext.Provider value={value}>{children}</SkillsViewContext.Provider>;
};
