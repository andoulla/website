import { act, render, screen } from '@testing-library/react';

import App from './App';
import type { WorkExperienceWithReferences } from './utils/joinJobsWithReferences';

// Stub the deferred loader so the home route renders its data instantly in tests.
// (ts-jest hoists jest.mock above the imports above.)
jest.mock('./utils/loadExperiences', () => ({
  loadExperiences: (): Promise<WorkExperienceWithReferences[]> =>
    Promise.resolve([
      {
        id: 'job-1',
        companyName: 'Nimbus Analytics',
        location: 'Remote',
        startDate: '2022-04-01',
        endDate: null,
        responsibilities: [],
        skills: [],
        references: [],
      },
    ]),
}));

describe('App', () => {
  test('renders the resume on the home route', async () => {
    await act(async () => {
      render(<App />);
      // Flush the resolved data promise + Suspense reveal within the act scope.
      await Promise.resolve();
    });

    expect(screen.getByRole('heading', { name: 'Mariandi Stylianou' })).toBeVisible();
    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
  });
});
