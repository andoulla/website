import type { ReactNode } from 'react';

import type { WorkExperienceWithReferences } from '../../utils/joinJobsWithReferences';

export type ExperiencesPromise = Promise<WorkExperienceWithReferences[]>;

export interface ResumeDataProviderProps {
  children: ReactNode;
  /** Overridable so tests can inject a fast, deterministic promise. */
  loader?: () => ExperiencesPromise;
}
