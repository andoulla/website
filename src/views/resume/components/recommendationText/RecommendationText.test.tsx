import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Recommendation } from '../../../../testing';

import { RecommendationText } from './RecommendationText';

const recommendation = new Recommendation()
  .authorInitials('P.S.')
  .authorRole({ jobTitle: 'Engineering Manager' })
  .text('Great work.')
  .postedDate('2022-01-15')
  .mock();

describe('RecommendationText', () => {
  test('renders the text, attribution, and author initials', () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    expect(screen.getByText('"Great work."')).toBeVisible();
    expect(screen.getByText('P.S., Engineering Manager')).toBeVisible();
    expect(screen.getByText('P.S.')).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = render(<RecommendationText recommendation={recommendation} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
