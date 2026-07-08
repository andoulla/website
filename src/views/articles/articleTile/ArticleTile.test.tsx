import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Article } from '@/testing';

import { ArticleTile } from './ArticleTile';

const article = new Article()
  .id('article-1')
  .title('When I have time…')
  .link('https://mariandi-stylianou.medium.com/when-i-have-time-fde00a39c7e0')
  .publishedDate('2026-06-16')
  .tags(['Developer experience', 'Refactoring'])
  .excerpt('A short excerpt about the article.')
  .mock();

describe('ArticleTile', () => {
  test('renders the title, date, excerpt, and tags as a link to the article', () => {
    const screen = render(<ArticleTile article={article} />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute(
      'href',
      'https://mariandi-stylianou.medium.com/when-i-have-time-fde00a39c7e0'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('16 Jun 2026')).toBeVisible();
    expect(screen.getByText('A short excerpt about the article.')).toBeVisible();
    expect(screen.getByText('Developer experience')).toBeVisible();
    expect(screen.getByText('Refactoring')).toBeVisible();
  });

  test('renders the title as an h2 heading', () => {
    const screen = render(<ArticleTile article={article} />);

    expect(screen.getByRole('heading', { level: 2, name: 'When I have time…' })).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = render(<ArticleTile article={article} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
