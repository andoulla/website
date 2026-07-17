import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Article } from '@/testing';

import { ArticleTile } from './ArticleTile';

const articleWithoutImage = new Article()
  .id('article-1')
  .title('When I have time…')
  .link('https://mariandi-stylianou.medium.com/when-i-have-time-fde00a39c7e0')
  .publishedDate('2026-06-16')
  .tags(['Developer experience', 'Refactoring'])
  .excerpt('A short excerpt about the article.')
  .mock();

const articleWithImage = new Article()
  .id('article-2')
  .title('Article with image')
  .link('https://mariandi-stylianou.medium.com/article-with-image')
  .publishedDate('2026-06-17')
  .tags(['Engineering'])
  .excerpt('An article with a featured image.')
  .imageUrl('https://cdn.example.com/featured-image.png')
  .mock();

describe('ArticleTile', () => {
  test('renders the title, date, excerpt, and tags as a link to the article without an image', () => {
    const screen = render(<ArticleTile article={articleWithoutImage} />);

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
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  test('renders the title as an h2 heading', () => {
    const screen = render(<ArticleTile article={articleWithoutImage} />);

    expect(screen.getByRole('heading', { level: 2, name: 'When I have time…' })).toBeVisible();
  });

  test('renders the featured image as decorative when imageUrl is provided', () => {
    const screen = render(<ArticleTile article={articleWithImage} />);

    // alt="" gives the image the presentation role — decorative for screen readers.
    const image = screen.getByRole('presentation');

    expect(image).toBeVisible();
    expect(image).toHaveAttribute('src', 'https://cdn.example.com/featured-image.png');
    expect(image).toHaveAttribute('alt', '');
  });

  test('has no axe violations without an image', async () => {
    const screen = render(<ArticleTile article={articleWithoutImage} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with an image', async () => {
    const screen = render(<ArticleTile article={articleWithImage} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
