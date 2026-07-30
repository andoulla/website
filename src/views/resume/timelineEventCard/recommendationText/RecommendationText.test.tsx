import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { Recommendation } from '@/testing';

import { RecommendationText } from './RecommendationText';

const recommendation = new Recommendation()
  .authorInitials('P.S.')
  .authorRole({ jobTitle: 'Engineering Manager' })
  .text('Great work.')
  .postedDate('2022-01-15')
  .recommendationUrl('https://www.linkedin.com/in/example/details/recommendations/')
  .mock();

describe('RecommendationText', () => {
  test('renders quote, author details, and has deep-link id', async () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    expect(screen.getByText('"Great work."')).toBeVisible();
    expect(screen.getAllByText('P.S.')).toHaveLength(2);
    expect(screen.getByText('Engineering Manager')).toBeVisible();
    expect(screen.getByText('15 Jan 2022')).toBeVisible();
    expect(document.getElementById('recommendation-rec-1')).toBe(
      screen.getByText('"Great work."').closest('blockquote')
    );
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('links to LinkedIn recommendation in new tab', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/example/details/recommendations/'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('starts clamped and toggles Show/Hide with aria-expanded', async () => {
    const user = userEvent.setup();
    const screen = render(<RecommendationText recommendation={recommendation} />);

    expect(screen.getByRole('button', { name: 'Show recommendation' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );

    await user.click(screen.getByRole('button', { name: 'Show recommendation' }));
    expect(screen.getByRole('button', { name: 'Hide recommendation' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    expect(await axe(screen.container)).toHaveNoViolations();

    await user.click(screen.getByRole('button', { name: 'Hide recommendation' }));
    expect(screen.getByRole('button', { name: 'Show recommendation' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('starts unclamped when highlighted', () => {
    const screen = render(<RecommendationText recommendation={recommendation} isHighlighted />);

    expect(screen.getByRole('button', { name: 'Hide recommendation' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  test('truncates long text when clamped and shows full text when expanded', async () => {
    const user = userEvent.setup();
    const longText =
      'This is a very long recommendation that goes on and on with multiple sentences. This is the second sentence. This is the third sentence.';
    const longRecommendation = new Recommendation()
      .authorInitials('J.D.')
      .authorRole({ jobTitle: 'Director' })
      .text(longText)
      .postedDate('2023-06-20')
      .recommendationUrl('https://www.linkedin.com/in/example/details/recommendations/')
      .mock();

    const screen = render(<RecommendationText recommendation={longRecommendation} />);

    expect(
      screen.getByText('This is a very long recommendation that goes on and on with multiple sentences.')
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Show recommendation' }));
    expect(screen.getByRole('button', { name: 'Hide recommendation' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });
});
