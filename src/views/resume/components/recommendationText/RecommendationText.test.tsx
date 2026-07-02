import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import type { Recommendation } from '../../../../types';

import { RecommendationText } from './RecommendationText';

const recommendation: Recommendation = {
  id: 'rec-1',
  jobId: 'job-1',
  authorInitials: 'P.S.',
  authorRole: { jobTitle: 'Engineering Manager', company: 'Acme Corp' },
  text: 'Great work.',
  postedDate: '2022-01-15',
  recommendationUrl: 'https://www.linkedin.com/in/example/details/recommendations/',
};

describe('RecommendationText', () => {
  test('renders the text, attribution, and author initials', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);
    expect(screen.getByText('"Great work."')).toBeVisible();
    expect(screen.getByText('P.S., Engineering Manager, Acme Corp')).toBeVisible();
    expect(screen.getByText('P.S.')).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
