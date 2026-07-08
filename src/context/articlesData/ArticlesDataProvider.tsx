import { createContext, use, useState } from 'react';

import { loadArticles } from '@/utils/loadArticles';

import type { ArticlesDataProviderProps, ArticlesPromise } from './ArticlesDataProvider.type';

const ArticlesDataContext = createContext<ArticlesPromise | null>(null);

export const useArticlesData = () => {
  const promise = use(ArticlesDataContext);
  if (promise === null) {
    throw new Error('useArticlesData must be used within an ArticlesDataProvider');
  }
  return use(promise);
};

export const ArticlesDataProvider = ({
  children,
  loader = loadArticles,
}: ArticlesDataProviderProps) => {
  // Lazy initializer: React calls loader() exactly once, on first mount, so the data
  // load is deferred to render time (not module load) and the promise is kept stable.
  const [articlesPromise] = useState(loader);

  return <ArticlesDataContext value={articlesPromise}>{children}</ArticlesDataContext>;
};
