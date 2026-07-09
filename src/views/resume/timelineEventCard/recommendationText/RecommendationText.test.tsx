import { render } from '@testing-library/react';
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
  test('renders the text, attribution, author initials, posted date, and LinkedIn link', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    expect(screen.getByText('"Great work."')).toBeVisible();
    expect(screen.getByText('P.S.')).toBeVisible();
    expect(screen.getByText('P.S. · Engineering Manager · 15 Jan 2022')).toBeVisible();

    const link = screen.getByRole('link', { name: 'View full recommendation on LinkedIn' });

    expect(link).toBeVisible();
    expect(link).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/example/details/recommendations/'
    );
  });

  test('has no axe violations', async () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
