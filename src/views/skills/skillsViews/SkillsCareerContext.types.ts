import type { ReactNode } from 'react';

import type { TimelineEvent } from '@/types';

export interface SkillsCareerContextProviderProps {
  careerHistory: TimelineEvent[];
  children: ReactNode;
}
