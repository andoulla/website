import { createContext, useContext } from 'react';

import type { TimelineEvent } from '@/types';

import type { SkillsCareerContextProviderProps } from './SkillsCareerContext.types';

// Lean context: raw careerHistory for the views that derive from it (network, growth) —
// kept out of SkillsViewContext so the other views don't depend on it.
const SkillsCareerContext = createContext<TimelineEvent[] | null>(null);

export const useSkillsCareerContext = (): TimelineEvent[] => {
  const ctx = useContext(SkillsCareerContext);
  if (ctx === null) {
    throw new Error('useSkillsCareerContext must be used within a SkillsCareerContextProvider');
  }
  return ctx;
};

export const SkillsCareerContextProvider = ({
  careerHistory,
  children,
}: SkillsCareerContextProviderProps) => (
  <SkillsCareerContext.Provider value={careerHistory}>{children}</SkillsCareerContext.Provider>
);
