import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { RecommendationStat } from './RecommendationStat';

describe('RecommendationStat', () => {
  test('renders nothing when count is 0', () => {
    const screen = render(<RecommendationStat count={0} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders singular copy when count is 1', async () => {
    const screen = render(<RecommendationStat count={1} />);

    expect(screen.getByText('1 skill backed by a recommendation')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders plural copy when count is greater than 1', () => {
    const screen = render(<RecommendationStat count={3} />);

    expect(screen.getByText('3 skills backed by recommendations')).toBeVisible();
  });
});
