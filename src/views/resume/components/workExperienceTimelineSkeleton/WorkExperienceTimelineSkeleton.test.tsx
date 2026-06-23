import { render, screen } from '@testing-library/react';

import { WorkExperienceTimelineSkeleton } from './WorkExperienceTimelineSkeleton';

describe('WorkExperienceTimelineSkeleton', () => {
  test('exposes an accessible loading status', () => {
    render(<WorkExperienceTimelineSkeleton />);
    expect(screen.getByRole('status', { name: 'Loading work experience' })).toBeVisible();
  });
});
