import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { CareerDataContextProvider } from '@/context/careerData';
import { TrackContextProvider } from '@/context/track';
import { Recommendation, Responsibility, Skill, TimelineEvent } from '@/testing';
import type { TimelineEventWithRecommendations } from '@/types';

import { Resume } from './Resume';

const LocationDisplay = () => {
  const location = useLocation();
  return <span>{`location:${location.pathname}${location.search}`}</span>;
};

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
        <TrackContextProvider>
          <CareerDataContextProvider loader={loader}>
            <Resume />
            <LocationDisplay />
          </CareerDataContextProvider>
        </TrackContextProvider>
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

  test('renders a tab per track with General selected by default, normalising the url', async () => {
    const screen = await renderResume(() => Promise.resolve(testCareerHistory));

    expect(screen.getByRole('tab', { name: 'General', selected: true })).toBeVisible();
    expect(
      screen.getByRole('tab', { name: 'Lead / Engineering Manager', selected: false })
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Senior Engineer', selected: false })).toBeVisible();
    expect(screen.getByText('location:/?track=general')).toBeVisible();
  });

  test('switching tabs hides content outside the track, updates the url, and stays axe-clean', async () => {
    const user = userEvent.setup();
    const eventWithMixedSkills = new TimelineEvent()
      .id('job-1')
      .companyName('Meridian Dynamics')
      .startDate('2022-04-01')
      .responsibilities([
        new Responsibility()
          .id('job-1-r01')
          .text('Built the design system')
          .skillIds(['react-hooks'])
          .mock(),
        new Responsibility()
          .id('job-1-r02')
          .text('Led a team of six')
          .skillIds(['team-leadership'])
          .mock(),
      ])
      .skills([
        new Skill().id('react-hooks').name('React Hooks').type('skill').mock(),
        new Skill().id('team-leadership').name('Team Leadership').type('skill').mock(),
      ])
      .mock();
    const screen = await renderResume(() => Promise.resolve([eventWithMixedSkills]));

    expect(screen.getByText('React Hooks')).toBeVisible();
    expect(screen.getByText('Built the design system')).toBeVisible();

    await user.click(screen.getByRole('tab', { name: 'Lead / Engineering Manager' }));

    // react-hooks is not in the lead track, team-leadership is.
    expect(screen.queryByText('React Hooks')).not.toBeInTheDocument();
    expect(screen.queryByText('Built the design system')).not.toBeInTheDocument();
    expect(screen.getByText('Team Leadership')).toBeVisible();
    expect(screen.getByText('Led a team of six')).toBeVisible();
    expect(screen.getByText('location:/?track=lead')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();

    await user.click(screen.getByRole('tab', { name: 'Senior Engineer' }));

    // team-leadership is not in the senior-engineer track either — the card collapses bare.
    expect(screen.queryByText('Team Leadership')).not.toBeInTheDocument();
    expect(screen.getByText('Meridian Dynamics')).toBeVisible();
    expect(screen.getByText('location:/?track=senior-engineer')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
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

  test('scrolls to the most recent, not the first, of several entries that list the highlighted skill', async () => {
    const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');
    const reactSkill = new Skill().id('react').name('React').mock();
    // Meridian is first in the array but the older role — Brightleaf is the current job.
    const careerHistoryWithSharedSkill = [
      new TimelineEvent()
        .id('job-1')
        .companyName('Meridian Dynamics')
        .startDate('2021-04-01')
        .endDate('2022-04-01')
        .skills([reactSkill])
        .mock(),
      new TimelineEvent()
        .id('job-2')
        .companyName('Brightleaf Software')
        .startDate('2023-04-01')
        .endDate(null)
        .skills([reactSkill])
        .mock(),
    ];

    const screen = await renderResume(
      () => Promise.resolve(careerHistoryWithSharedSkill),
      [{ pathname: '/', search: '?skill=React' }]
    );

    expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewSpy.mock.instances[0]).toBe(
      screen.getByText('Brightleaf Software').closest('.MuiCard-root')
    );

    scrollIntoViewSpy.mockRestore();
  });

  test('resolves a synonym to the canonical skill and still scrolls to the matching job', async () => {
    const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');
    const careerHistoryWithSkill = [
      new TimelineEvent()
        .id('job-1')
        .companyName('Meridian Dynamics')
        .startDate('2022-04-01')
        .skills([new Skill().id('react').name('React').mock()])
        .mock(),
    ];

    // 'reactjs' is a synonym of React in skills.json; matching is case-insensitive.
    await renderResume(
      () => Promise.resolve(careerHistoryWithSkill),
      [{ pathname: '/', search: '?skill=reactjs' }]
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
