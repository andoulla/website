import { act, render, screen } from '@testing-library/react';
import { Suspense, use } from 'react';

import type { WorkExperienceWithReferences } from '../../utils/joinJobsWithReferences';

import { ResumeDataContext, ResumeDataProvider } from './ResumeDataProvider';
// TODO Move this to a class pattern that will allow for generating data
const testExperiences: WorkExperienceWithReferences[] = [
  {
    id: 'job-1',
    companyName: 'Nimbus Analytics',
    location: 'London, UK',
    startDate: '2022-04-01',
    endDate: null,
    responsibilities: [],
    skills: [],
    references: [],
  },
];

function Consumer() {
  const experiencesPromise = use(ResumeDataContext);
  if (experiencesPromise === null) {
    throw new Error('ResumeDataContext was used without a ResumeDataProvider');
  }
  const experiences = use(experiencesPromise);
  return <p>{experiences[0].companyName}</p>;
}

describe('ResumeDataProvider', () => {
  test('exposes the loaded experiences to consumers via the context', async () => {
    // Await an async act so the suspended promise resolves and React commits the
    // revealed content before we assert.
    await act(async () => {
      render(
        <ResumeDataProvider loader={() => Promise.resolve(testExperiences)}>
          <Suspense fallback={<p>Loading</p>}>
            <Consumer />
          </Suspense>
        </ResumeDataProvider>
      );
      // Flush the resolved data promise + Suspense reveal within the act scope.
      await Promise.resolve();
    });

    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
  });

  test('a consumer rendered without a provider throws a helpful error', () => {
    // Silence the expected React error log for the throwing render.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Consumer />)).toThrow(
      'ResumeDataContext was used without a ResumeDataProvider'
    );

    consoleError.mockRestore();
  });
});
