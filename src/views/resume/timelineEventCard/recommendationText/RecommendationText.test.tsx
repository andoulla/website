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
  test('renders the quote and byline in a blockquote with a deep-link id', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    expect(screen.getByText('"Great work."')).toBeVisible();
    expect(screen.getByText('P.S.')).toBeVisible();
    expect(screen.getByText('P.S. · Engineering Manager · 15 Jan 2022')).toBeVisible();
    expect(document.getElementById('recommendation-rec-1')).toBe(
      screen.getByText('"Great work."').closest('blockquote')
    );
  });

  test('links the byline to the recommendation on LinkedIn in a new tab', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    const link = screen.getByRole('link', { name: 'P.S. · Engineering Manager · 15 Jan 2022' });

    expect(link).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/example/details/recommendations/'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('starts clamped and toggles between More and Less', async () => {
    const user = userEvent.setup();
    const screen = render(<RecommendationText recommendation={recommendation} />);

    await user.click(screen.getByRole('button', { name: 'More' }));

    expect(screen.getByRole('button', { name: 'Less' })).toHaveAttribute('aria-expanded', 'true');
    expect(await axe(screen.container)).toHaveNoViolations();

    await user.click(screen.getByRole('button', { name: 'Less' }));

    expect(screen.getByRole('button', { name: 'More' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('a highlighted recommendation starts unclamped', () => {
    const screen = render(<RecommendationText recommendation={recommendation} isHighlighted />);

    expect(screen.getByRole('button', { name: 'Less' })).toHaveAttribute('aria-expanded', 'true');
  });

  test('has no axe violations', async () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
