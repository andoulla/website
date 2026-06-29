import { createContext, use, useState } from 'react';

import { loadExperiences } from '../../utils/loadExperiences';

import type { ExperiencesPromise, ResumeDataProviderProps } from './ResumeDataProvider.type';

const ResumeDataContext = createContext<ExperiencesPromise | null>(null);

export function useResumeData() {
  const promise = use(ResumeDataContext);
  if (promise === null) {
    throw new Error('useResumeData must be used within a ResumeDataProvider');
  }
  return use(promise);
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
