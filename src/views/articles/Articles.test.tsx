import { act, render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Article } from '@/testing';
import type { Article as ArticleType } from '@/types';
import { loadArticles } from '@/utils/loadArticles';

import { Articles } from './Articles';

jest.mock('@/utils/loadArticles');

const mockLoadArticles = jest.mocked(loadArticles);

describe('Articles', () => {
  test('shows a loading indicator while articles are being fetched', () => {
    mockLoadArticles.mockReturnValue(new Promise(() => {}));

    const screen = render(<Articles />);

    expect(screen.getByLabelText('Loading articles')).toBeVisible();
    expect(
      screen.getByText(
        "This is a collection of articles I've written to share experiences and lessons learned from my day-to-day work as a software engineer. I write them mostly for future-me, but hope they're useful to you too."
      )
    ).toBeVisible();
  });

  test('renders a tile per loaded article', async () => {
    const article = new Article().id('article-1').title('When I have time…').mock();

    mockLoadArticles.mockResolvedValue([article]);

    const screen = render(<Articles />);

    expect(
      await screen.findByRole('heading', { level: 2, name: 'When I have time…' })
    ).toBeVisible();

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders an empty state when there are no articles', async () => {
    mockLoadArticles.mockResolvedValue([]);

    const screen = render(<Articles />);

    expect(await screen.findByText('No articles published yet.')).toBeVisible();

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders an error state when the fetch fails', async () => {
    mockLoadArticles.mockRejectedValue(new Error('network down'));

    const screen = render(<Articles />);

    expect(
      await screen.findByText("Couldn't load articles right now. Please try again later.")
    ).toBeVisible();

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders an error state when the fetch rejects with a non-Error value', async () => {
    mockLoadArticles.mockRejectedValue('boom');

    const screen = render(<Articles />);

    expect(
      await screen.findByText("Couldn't load articles right now. Please try again later.")
    ).toBeVisible();
  });

  test('ignores articles that arrive after unmount', async () => {
    let resolveArticles!: (articles: ArticleType[]) => void;

    mockLoadArticles.mockReturnValue(
      new Promise((resolve) => {
        resolveArticles = resolve;
      })
    );

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const screen = render(<Articles />);

    screen.unmount();
    resolveArticles([new Article().mock()]);
    await act(async () => {
      await Promise.resolve();
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test('ignores a fetch failure that arrives after unmount', async () => {
    let rejectArticles!: (error: Error) => void;

    mockLoadArticles.mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectArticles = reject;
      })
    );

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const screen = render(<Articles />);

    screen.unmount();
    rejectArticles(new Error('network down'));
    await act(async () => {
      await Promise.resolve();
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
