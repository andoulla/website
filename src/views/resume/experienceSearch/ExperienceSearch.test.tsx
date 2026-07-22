import { Suspense } from 'react';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { CareerDataContextProvider } from '@/context/careerData';
import { TrackContextProvider } from '@/context/track';
import { Recommendation, Responsibility, Skill, TimelineEvent } from '@/testing';
import type { TimelineEventWithRecommendations } from '@/types';

import { ExperienceSearch } from './ExperienceSearch';

const LocationDisplay = () => {
  const location = useLocation();
  return <span>{`location:${location.pathname}${location.search}`}</span>;
};

async function renderSearch(
  events: TimelineEventWithRecommendations[],
  initialEntries: Parameters<typeof MemoryRouter>[0]['initialEntries'] = ['/?track=general']
) {
  return act(async () => {
    const result = render(
      <MemoryRouter initialEntries={initialEntries}>
        <TrackContextProvider>
          <CareerDataContextProvider loader={() => Promise.resolve(events)}>
            <Suspense fallback={null}>
              <ExperienceSearch />
            </Suspense>
            <LocationDisplay />
          </CareerDataContextProvider>
        </TrackContextProvider>
      </MemoryRouter>
    );

    await Promise.resolve();

    return result;
  });
}

const reactSkill = new Skill().id('react').name('React').mock();
const teamLeadershipSkill = new Skill().id('team-leadership').name('Team Leadership').mock();

describe('ExperienceSearch', () => {
  test('builds one option per job a skill spans, and labels the input accessibly', async () => {
    const careerHistory = [
      new TimelineEvent()
        .id('job-1')
        .companyName('Meridian Dynamics')
        .startDate('2022-04-01')
        .endDate(null)
        .skills([reactSkill])
        .mock(),
      new TimelineEvent()
        .id('job-2')
        .companyName('Brightleaf Software')
        .startDate('2020-01-01')
        .endDate('2021-01-01')
        .skills([reactSkill])
        .mock(),
    ];
    const user = userEvent.setup();
    const screen = await renderSearch(careerHistory);
    const combobox = screen.getByRole('combobox', { name: 'Ask about my experience' });

    await user.type(combobox, 'React');

    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(
      screen.getByRole('option', { name: 'React · Meridian Dynamics · 2022–Present' })
    ).toBeVisible();
    expect(
      screen.getByRole('option', { name: 'React · Brightleaf Software · 2020–2021' })
    ).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('scopes options to the active track', async () => {
    const careerHistory = [
      new TimelineEvent()
        .id('job-1')
        .companyName('Meridian Dynamics')
        .startDate('2022-04-01')
        .endDate(null)
        .skills([teamLeadershipSkill])
        .mock(),
    ];
    const user = userEvent.setup();

    const general = await renderSearch(careerHistory, ['/?track=general']);

    await user.type(general.getByRole('combobox'), 'Leadership');

    expect(
      general.getByRole('option', { name: 'Team Leadership · Meridian Dynamics · 2022–Present' })
    ).toBeVisible();

    general.unmount();

    const senior = await renderSearch(careerHistory, ['/?track=senior-engineer']);

    await user.type(senior.getByRole('combobox'), 'Leadership');

    expect(senior.queryByRole('option')).not.toBeInTheDocument();
    expect(senior.getByText('No matching experience…')).toBeVisible();
  });

  test('partial-matches across skills, roles, and recommendations, and shows a no-match message', async () => {
    const careerHistory = [
      new TimelineEvent()
        .id('job-1')
        .companyName('Meridian Dynamics')
        .startDate('2022-04-01')
        .endDate(null)
        .skills([reactSkill])
        .responsibilities([
          new Responsibility().id('job-1-r01').text('Rebuilt the onboarding flow').mock(),
        ])
        .recommendations([
          new Recommendation()
            .id('rec-1')
            .authorInitials('P.S.')
            .authorRole({ jobTitle: 'Engineering Manager' })
            .text('Superb mentor')
            .mock(),
        ])
        .mock(),
    ];
    const user = userEvent.setup();
    const screen = await renderSearch(careerHistory);
    const combobox = screen.getByRole('combobox');

    await user.type(combobox, 'Rea');

    expect(
      screen.getByRole('option', { name: 'React · Meridian Dynamics · 2022–Present' })
    ).toBeVisible();

    await user.clear(combobox);
    await user.type(combobox, 'Meridian');

    expect(screen.getByRole('option', { name: 'Meridian Dynamics' })).toBeVisible();

    await user.clear(combobox);
    await user.type(combobox, 'onboarding');

    expect(screen.getByRole('option', { name: 'Meridian Dynamics' })).toBeVisible();

    await user.clear(combobox);
    await user.type(combobox, 'mentor');

    expect(screen.getByRole('option', { name: 'P.S. · Engineering Manager' })).toBeVisible();

    await user.clear(combobox);
    await user.type(combobox, 'zz');

    expect(screen.getByText('No matching experience…')).toBeVisible();

    // Below the minimum length the no-match text stays hidden.
    await user.clear(combobox);
    await user.type(combobox, 'z');

    expect(screen.queryByText('No matching experience…')).not.toBeInTheDocument();

    await user.clear(combobox);

    expect(combobox).toHaveValue('');
    expect(screen.queryByText('No matching experience…')).not.toBeInTheDocument();
  });

  test('navigates to the matching card per kind and clears the input', async () => {
    const careerHistory = [
      new TimelineEvent()
        .id('job-1')
        .companyName('Meridian Dynamics')
        .startDate('2022-04-01')
        .endDate(null)
        .skills([reactSkill])
        .recommendations([
          new Recommendation()
            .id('rec-1')
            .authorInitials('P.S.')
            .authorRole({ jobTitle: 'Engineering Manager' })
            .text('Superb mentor')
            .mock(),
        ])
        .mock(),
    ];
    const user = userEvent.setup();
    const screen = await renderSearch(careerHistory);
    const combobox = screen.getByRole('combobox');

    await user.type(combobox, 'React');
    await user.click(
      screen.getByRole('option', { name: 'React · Meridian Dynamics · 2022–Present' })
    );

    expect(screen.getByText('location:/?track=general&skill=React&focus=job-1')).toBeVisible();
    expect(combobox).toHaveValue('');

    await user.type(combobox, 'Meridian');
    await user.click(screen.getByRole('option', { name: 'Meridian Dynamics' }));

    expect(screen.getByText('location:/?track=general&focus=job-1')).toBeVisible();

    await user.type(combobox, 'mentor');
    await user.click(screen.getByRole('option', { name: 'P.S. · Engineering Manager' }));

    expect(screen.getByText('location:/?track=general&recommendation=rec-1')).toBeVisible();
  });
});
