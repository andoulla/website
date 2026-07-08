import type { ReactNode } from 'react';

import type { Article } from '@/types';

export type ArticlesPromise = Promise<Article[]>;

export interface ArticlesDataProviderProps {
  children: ReactNode;
  /** Overridable so tests can inject a fast, deterministic promise. */
  loader?: () => ArticlesPromise;
}
