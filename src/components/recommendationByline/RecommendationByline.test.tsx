import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Recommendation } from '@/testing';

import { RecommendationByline } from './RecommendationByline';

describe('RecommendationByline', () => {
  test('renders author initials, job title, and formatted posted date', () => {
    const recommendation = new Recommendation()
      .authorInitials('A.B.')
      .authorRole({ jobTitle: 'Engineering Manager' })
      .postedDate('2024-03-15')
      .mock();

    const screen = render(<RecommendationByline recommendation={recommendation} />);

    expect(screen.getByText('A.B. · Engineering Manager', { exact: false })).toBeVisible();
    expect(screen.getByText('15 Mar 2024', { exact: false })).toBeVisible();
  });

  test('links to the recommendation URL on LinkedIn', () => {
    const recommendation = new Recommendation()
      .recommendationUrl('https://linkedin.com/in/example')
      .mock();

    const screen = render(<RecommendationByline recommendation={recommendation} />);

    expect(
      screen.getByRole('link', { name: 'View full recommendation on LinkedIn' })
    ).toHaveAttribute('href', 'https://linkedin.com/in/example');
  });

  test('has no axe violations', async () => {
    const screen = render(<RecommendationByline recommendation={new Recommendation().mock()} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
