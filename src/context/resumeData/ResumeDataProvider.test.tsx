import { act, render } from '@testing-library/react';
import { Suspense } from 'react';

import type { WorkExperienceWithReferences } from '../../utils/joinJobsWithReferences';

import { ResumeDataProvider, useResumeData } from './ResumeDataProvider';
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

function ExperiencesConsumer() {
  const experiences = useResumeData();
  return <p>{experiences[0].companyName}</p>;
}

describe('ResumeDataProvider', () => {
  test('exposes the loaded experiences to consumers via the context', async () => {
    let screen!: ReturnType<typeof render>;
    await act(async () => {
      screen = render(
        <ResumeDataProvider loader={() => Promise.resolve(testExperiences)}>
          <Suspense fallback={<p>Loading</p>}>
            <ExperiencesConsumer />
          </Suspense>
        </ResumeDataProvider>
      );
      await Promise.resolve();
    });

    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
  });
});
