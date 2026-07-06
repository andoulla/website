import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { TimelineEventSkeleton } from './TimelineEventSkeleton';

describe('TimelineEventSkeleton', () => {
  test('exposes an accessible loading status', () => {
    const screen = render(<TimelineEventSkeleton />);

    expect(screen.getByRole('status', { name: 'Loading timeline' })).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = render(<TimelineEventSkeleton />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
