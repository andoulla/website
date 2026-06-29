import { render } from '@testing-library/react';

import { WorkExperienceTimelineSkeleton } from './WorkExperienceTimelineSkeleton';

describe('WorkExperienceTimelineSkeleton', () => {
  test('exposes an accessible loading status', () => {
    const screen = render(<WorkExperienceTimelineSkeleton />);
    expect(screen.getByRole('status', { name: 'Loading work experience' })).toBeVisible();
  });
});
