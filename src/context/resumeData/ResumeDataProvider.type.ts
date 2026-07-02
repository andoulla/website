import type { ReactNode } from 'react';

import type { WorkExperienceWithRecommendations } from '../../types';

export type ExperiencesPromise = Promise<WorkExperienceWithRecommendations[]>;

export interface ResumeDataProviderProps {
  children: ReactNode;
  /** Overridable so tests can inject a fast, deterministic promise. */
  loader?: () => ExperiencesPromise;
}
