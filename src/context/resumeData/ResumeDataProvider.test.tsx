import { act, render } from '@testing-library/react';
import { Suspense } from 'react';

import { WorkExperience } from '../../testing';

import { ResumeDataProvider, useResumeData } from './ResumeDataProvider';

function ExperiencesConsumer() {
  const experiences = useResumeData();
  return <p>{experiences[0].companyName}</p>;
}

describe('ResumeDataProvider', () => {
  test('exposes the loaded experiences to consumers via the context', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(
        <ResumeDataProvider
          loader={() =>
            Promise.resolve([new WorkExperience().companyName('Nimbus Analytics').mock()])
          }
        >
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
