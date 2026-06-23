import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

import { loadExperiences } from '../../utils/loadExperiences';
import type { WorkExperienceWithReferences } from '../../utils/joinJobsWithReferences';

type ExperiencesPromise = Promise<WorkExperienceWithReferences[]>;
// TODO: separate types and check for circular dependencies.
/**
 * Holds the in-flight promise of the resume data. Consumers read it with `use()`:
 * `use(ResumeDataContext)` returns the promise, then `use(promise)` unwraps it and
 * suspends until it resolves.
 */
export const ResumeDataContext = createContext<ExperiencesPromise | null>(null);

export interface ResumeDataProviderProps {
  children: ReactNode;
  /** Overridable so tests can inject a fast, deterministic promise. */
  loader?: () => ExperiencesPromise;
}

export function ResumeDataProvider({
  children,
  loader = loadExperiences,
}: ResumeDataProviderProps) {
  // Lazy initializer: React calls loader() exactly once, on first mount, so the data
  // load is deferred to render time (not module load) and the promise is kept stable.
  const [experiencesPromise] = useState(loader);

  return <ResumeDataContext value={experiencesPromise}>{children}</ResumeDataContext>;
}
