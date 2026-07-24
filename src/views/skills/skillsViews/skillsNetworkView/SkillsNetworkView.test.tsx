import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary, TimelineEvent, Track } from '@/testing';

import { SkillsCareerContextProvider } from '../SkillsCareerContext';
import { SkillsViewContextProvider } from '../SkillsViewContext';
import type { SkillsViewContextValue } from '../SkillsViewContext.types';

import { SkillsNetworkView } from './SkillsNetworkView';

const CAREER = [
  new TimelineEvent().id('job-a').type('work').companyName('Acme').startDate('2020-01-01').mock(),
];

const SKILLS = [
  new SkillSummary()
    .id('ts')
    .skill('TypeScript')
    .categoryId('lang')
    .categoryName('Languages')
    .mock(),
  new SkillSummary()
    .id('react')
    .skill('React')
    .categoryId('ui')
    .categoryName('UI Frameworks')
    .mock(),
];

const renderNetworkView = (
  overrides: Partial<SkillsViewContextValue> & { careerHistory?: typeof CAREER } = {}
) => {
  const skills = overrides.skills ?? SKILLS;

  return render(
    <SkillsCareerContextProvider careerHistory={overrides.careerHistory ?? CAREER}>
      <SkillsViewContextProvider
        track={new Track().mock()}
        skills={skills}
        filteredSkills={overrides.filteredSkills ?? skills}
        selectedCategories={overrides.selectedCategories ?? []}
        selectedSubCategories={overrides.selectedSubCategories ?? []}
        searchTerm={overrides.searchTerm ?? ''}
        onClearFilters={overrides.onClearFilters ?? jest.fn()}
      >
        <SkillsNetworkView />
      </SkillsViewContextProvider>
    </SkillsCareerContextProvider>
  );
};

describe('SkillsNetworkView', () => {
  test('shows the no-data alert when there are no skills in the active track', async () => {
    const screen = renderNetworkView({ skills: [] });

    expect(screen.getByRole('alert')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('shows the empty-state when career history has no co-occurrence data for the active skills', async () => {
    // Career history with no responsibilities → no co-occurrence nodes → empty state.
    const screen = renderNetworkView({ careerHistory: CAREER });

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
