import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Recommendation } from '@/testing';

import { RecommendationByline } from './RecommendationByline';

describe('RecommendationByline', () => {
  test('renders with proper typography hierarchy, LinkedIn link, and icon', async () => {
    const recommendation = new Recommendation()
      .authorInitials('A.B.')
      .authorRole({ jobTitle: 'Engineering Manager' })
      .postedDate('2024-03-15')
      .recommendationUrl('https://linkedin.com/in/example')
      .mock();

    const screen = render(<RecommendationByline recommendation={recommendation} />);

    // Renders content
    expect(screen.getByText('A.B.')).toBeVisible();
    expect(screen.getByText('Engineering Manager')).toBeVisible();
    expect(screen.getByText('15 Mar 2024')).toBeVisible();

    // Links to LinkedIn in new tab
    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', 'https://linkedin.com/in/example');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    // Job title should be more prominent (body2) than initials/date (caption)
    const jobTitle = screen.getByText('Engineering Manager');

    expect(jobTitle).toHaveClass('MuiTypography-body2');
    expect(jobTitle).toHaveStyle('color: inherit');

    const initials = screen.getByText('A.B.');

    expect(initials).toHaveClass('MuiTypography-caption');

    const date = screen.getByText('15 Mar 2024');

    expect(date).toHaveClass('MuiTypography-caption');

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
