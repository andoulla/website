import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary, TimelineEvent, Track } from '@/testing';

import { SkillsCareerContextProvider } from '../SkillsCareerContext';
import { SkillsViewContextProvider } from '../SkillsViewContext';
import type { SkillsViewContextValue } from '../SkillsViewContext.types';

import { SkillsGrowthView } from './SkillsGrowthView';

const CAREER = [
  new TimelineEvent().id('a').type('work').companyName('Acme').startDate('2018-01-01').mock(),
  new TimelineEvent().id('b').type('work').companyName('Globex').startDate('2021-01-01').mock(),
];

const SKILLS = [
  new SkillSummary().id('s1').skill('S1').jobIds(['a']).mock(),
  new SkillSummary().id('s2').skill('S2').jobIds(['b']).mock(),
];

const renderGrowthView = (
  overrides: Partial<SkillsViewContextValue> & { careerHistory?: typeof CAREER } = {}
) => {
  const skills = overrides.skills ?? SKILLS;

  return render(
    <SkillsCareerContextProvider careerHistory={overrides.careerHistory ?? CAREER}>
      <SkillsViewContextProvider
        track={new Track().mock()}
        skills={skills}
        filteredSkills={skills}
        selectedCategories={[]}
        selectedSubCategories={[]}
        searchTerm=""
        onClearFilters={jest.fn()}
      >
        <SkillsGrowthView />
      </SkillsViewContextProvider>
    </SkillsCareerContextProvider>
  );
};

describe('SkillsGrowthView', () => {
  test('lists cumulative skills per acquisition year in the accessible table', async () => {
    const screen = renderGrowthView();

    expect(screen.getByRole('cell', { name: '2018' }).closest('tr')?.textContent).toBe('20181');
    expect(screen.getByRole('cell', { name: '2021' }).closest('tr')?.textContent).toBe('20212');
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('shows the no-data alert when there are no skills', () => {
    const screen = renderGrowthView({ skills: [] });

    expect(screen.getByRole('alert')).toBeVisible();
  });
});
