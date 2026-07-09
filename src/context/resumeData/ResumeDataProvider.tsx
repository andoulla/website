import { createContext, use, useState } from 'react';

import { loadCareerHistory } from '@/utils/loadCareerHistory';

import type { CareerHistoryPromise, ResumeDataProviderProps } from './ResumeDataProvider.type';

const ResumeDataContext = createContext<CareerHistoryPromise | null>(null);

export const useCareerHistory = () => {
  const promise = use(ResumeDataContext);
  if (promise === null) {
    throw new Error('useCareerHistory must be used within a ResumeDataProvider');
  }
  return use(promise);
};

export const ResumeDataProvider = ({
  children,
  loader = loadCareerHistory,
}: ResumeDataProviderProps) => {
  // Lazy initializer: React calls loader() exactly once, on first mount, so the data
  // load is deferred to render time (not module load) and the promise is kept stable.
  const [careerHistoryPromise] = useState(loader);

  return <ResumeDataContext value={careerHistoryPromise}>{children}</ResumeDataContext>;
};
