import { createContext, use, useState } from 'react';

import { loadCareerHistory } from '@/utils/loadCareerHistory';

import type {
  CareerDataContextProviderProps,
  CareerHistoryPromise,
} from './CareerDataContextProvider.types';

const CareerDataContext = createContext<CareerHistoryPromise | null>(null);

export const useCareerDataContext = () => {
  const promise = use(CareerDataContext);
  if (promise === null) {
    throw new Error('useCareerDataContext must be used within a CareerDataContextProvider');
  }
  return use(promise);
};

export const CareerDataContextProvider = ({
  children,
  loader = loadCareerHistory,
}: CareerDataContextProviderProps) => {
  // Lazy initializer: React calls loader() exactly once, on first mount, so the data
  // load is deferred to render time (not module load) and the promise is kept stable.
  const [careerHistoryPromise] = useState(loader);

  return <CareerDataContext value={careerHistoryPromise}>{children}</CareerDataContext>;
};
