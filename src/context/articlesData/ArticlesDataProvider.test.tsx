import { act, render } from '@testing-library/react';
import { Suspense } from 'react';

import { ErrorBoundary } from '@/components/errorBoundary';
import { Article } from '@/testing';
import { loadArticles } from '@/utils/loadArticles';

import { ArticlesDataProvider, useArticlesData } from './ArticlesDataProvider';

jest.mock('@/utils/loadArticles');

const mockLoadArticles = jest.mocked(loadArticles);

function ArticlesConsumer() {
  const [firstArticle] = useArticlesData();
  return <p>{firstArticle.title}</p>;
}

describe('ArticlesDataProvider', () => {
  test('exposes the loaded articles to consumers via the context', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(
        <ArticlesDataProvider
          loader={() => Promise.resolve([new Article().title('Post A').mock()])}
        >
          <Suspense fallback={<p>Loading</p>}>
            <ArticlesConsumer />
          </Suspense>
        </ArticlesDataProvider>
      );
      await Promise.resolve();
    });

    expect(screen.getByText('Post A')).toBeVisible();
  });

  test('shows the fallback while the loader promise is still pending', () => {
    const screen = render(
      <ArticlesDataProvider loader={() => new Promise(() => {})}>
        <Suspense fallback={<p>Loading</p>}>
          <ArticlesConsumer />
        </Suspense>
      </ArticlesDataProvider>
    );

    expect(screen.getByText('Loading')).toBeVisible();
  });

  test('surfaces a rejected loader promise to an error boundary', async () => {
    const screen = render(
      <ErrorBoundary fallback={(error) => <p>Error: {error.message}</p>}>
        <ArticlesDataProvider loader={() => Promise.reject(new Error('failed to load'))}>
          <Suspense fallback={<p>Loading</p>}>
            <ArticlesConsumer />
          </Suspense>
        </ArticlesDataProvider>
      </ErrorBoundary>
    );

    expect(await screen.findByText('Error: failed to load')).toBeVisible();
  });

  test('uses the default loadArticles loader when no loader prop is provided', async () => {
    mockLoadArticles.mockResolvedValue([new Article().title('Default Post').mock()]);

    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(
        <ArticlesDataProvider>
          <Suspense fallback={<p>Loading</p>}>
            <ArticlesConsumer />
          </Suspense>
        </ArticlesDataProvider>
      );
      await Promise.resolve();
    });

    expect(screen.getByText('Default Post')).toBeVisible();
    expect(mockLoadArticles).toHaveBeenCalled();
  });
});
