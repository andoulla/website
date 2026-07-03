import { act, render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { ResumeDataProvider } from '../../context/resumeData';
import { TimelineEvent } from '../../testing';
import type { TimelineEventWithRecommendations } from '../../types';

import { Resume } from './Resume';

const testExperiences = [
  new TimelineEvent().id('job-1').companyName('Nimbus Analytics').startDate('2022-04-01').mock(),
  new TimelineEvent().id('job-2').companyName('Brightleaf Software').startDate('2022-04-01').mock(),
  new TimelineEvent().id('job-3').companyName('Harborview Digital').startDate('2022-04-01').mock(),
];

async function renderResume(loader: () => Promise<TimelineEventWithRecommendations[]>) {
  let result!: ReturnType<typeof render>;

  await act(async () => {
    result = render(
      <MemoryRouter>
        <ResumeDataProvider loader={loader}>
          <Resume />
        </ResumeDataProvider>
      </MemoryRouter>
    );
    await Promise.resolve();
  });
  return result;
}

describe('Resume', () => {
  test('shows the loading state until the data resolves', async () => {
    // A promise that never settles keeps the component suspended on the fallback.
    const screen = await renderResume(
      () => new Promise<TimelineEventWithRecommendations[]>(() => undefined)
    );

    expect(screen.getByRole('status', { name: 'Loading timeline' })).toBeVisible();
  });

  test('renders the name heading and every job once the data resolves', async () => {
    const screen = await renderResume(() => Promise.resolve(testExperiences));

    expect(screen.getByRole('heading', { level: 1, name: 'Mariandi Stylianou' })).toBeVisible();
    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
    expect(screen.getByText('Brightleaf Software')).toBeVisible();
    expect(screen.getByText('Harborview Digital')).toBeVisible();
  });

  test('has no axe violations in the loading state', async () => {
    const screen = await renderResume(
      () => new Promise<TimelineEventWithRecommendations[]>(() => undefined)
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations in the loaded state', async () => {
    const screen = await renderResume(() => Promise.resolve(testExperiences));

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
