import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { WorkExperienceTimelineSkeleton } from './WorkExperienceTimelineSkeleton';

describe('WorkExperienceTimelineSkeleton', () => {
  test('exposes an accessible loading status', () => {
    const screen = render(<WorkExperienceTimelineSkeleton />);
    expect(screen.getByRole('status', { name: 'Loading work experience' })).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = render(<WorkExperienceTimelineSkeleton />);
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
