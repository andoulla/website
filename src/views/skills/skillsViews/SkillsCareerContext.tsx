import { createContext, useContext } from 'react';

import type { TimelineEvent } from '@/types';

import type { SkillsCareerContextProviderProps } from './SkillsCareerContext.types';

// careerHistory for network/growth only, kept out of SkillsViewContext.
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
