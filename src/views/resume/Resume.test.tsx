import { act, render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { CareerDataContextProvider } from '@/context/careerData';
import { Recommendation, Skill, TimelineEvent } from '@/testing';
import type { TimelineEventWithRecommendations } from '@/types';

import { Resume } from './Resume';

const testCareerHistory = [
  new TimelineEvent().id('job-1').companyName('Meridian Dynamics').startDate('2022-04-01').mock(),
  new TimelineEvent().id('job-2').companyName('Brightleaf Software').startDate('2022-04-01').mock(),
  new TimelineEvent().id('job-3').companyName('Harborview Digital').startDate('2022-04-01').mock(),
];

async function renderResume(
  loader: () => Promise<TimelineEventWithRecommendations[]>,
  initialEntries?: Parameters<typeof MemoryRouter>[0]['initialEntries']
) {
  let result!: ReturnType<typeof render>;

  await act(async () => {
    result = render(
      <MemoryRouter initialEntries={initialEntries}>
        <CareerDataContextProvider loader={loader}>
          <Resume />
        </CareerDataContextProvider>
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
    const screen = await renderResume(() => Promise.resolve(testCareerHistory));

    expect(screen.getByRole('heading', { level: 1, name: 'Mariandi Stylianou' })).toBeVisible();
    expect(screen.getByText('Meridian Dynamics')).toBeVisible();
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
    const screen = await renderResume(() => Promise.resolve(testCareerHistory));

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('scrolls only the first of several entries that list the highlighted skill', async () => {
    const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');
    const reactSkill = new Skill().id('react').name('React').mock();
    const careerHistoryWithSharedSkill = [
      new TimelineEvent()
        .id('job-1')
        .companyName('Meridian Dynamics')
        .startDate('2022-04-01')
        .skills([reactSkill])
        .mock(),
      new TimelineEvent()
        .id('job-2')
        .companyName('Brightleaf Software')
        .startDate('2021-04-01')
        .skills([reactSkill])
        .mock(),
    ];

    await renderResume(
      () => Promise.resolve(careerHistoryWithSharedSkill),
      [{ pathname: '/', search: '?skill=React' }]
    );

    expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);

    scrollIntoViewSpy.mockRestore();
  });

  test('scrolls to the job containing the highlighted recommendation, taking priority over a skill match', async () => {
    const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');
    const targetRecommendation = new Recommendation().id('rec-2').mock();
    const reactSkill = new Skill().id('react').name('React').mock();
    const careerHistoryWithRecommendation = [
      new TimelineEvent()
        .id('job-1')
        .companyName('Meridian Dynamics')
        .startDate('2022-04-01')
        .skills([reactSkill])
        .mock(),
      new TimelineEvent()
        .id('job-2')
        .companyName('Brightleaf Software')
        .startDate('2021-04-01')
        .skills([reactSkill])
        .recommendations([targetRecommendation])
        .mock(),
    ];

    await renderResume(
      () => Promise.resolve(careerHistoryWithRecommendation),
      [{ pathname: '/', search: '?skill=React&recommendation=rec-2' }]
    );

    const recommendationNode = document.getElementById('recommendation-rec-2');

    expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewSpy.mock.instances[0]).toBe(recommendationNode);

    scrollIntoViewSpy.mockRestore();
  });
});
