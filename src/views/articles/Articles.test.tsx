import { act, render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Article } from '@/testing';
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

    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(<Articles />);
      await Promise.resolve();
    });

    expect(screen.getByRole('heading', { level: 2, name: 'When I have time…' })).toBeVisible();

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders an empty state when there are no articles', async () => {
    mockLoadArticles.mockResolvedValue([]);

    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(<Articles />);
      await Promise.resolve();
    });

    expect(screen.getByText('No articles published yet.')).toBeVisible();

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders an error state when the fetch fails', async () => {
    mockLoadArticles.mockRejectedValue(new Error('network down'));

    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(<Articles />);
      await Promise.resolve();
    });

    expect(
      screen.getByText("Couldn't load articles right now. Please try again later.")
    ).toBeVisible();

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
