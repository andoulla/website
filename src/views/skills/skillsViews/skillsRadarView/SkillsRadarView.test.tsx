import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { SkillSummary, Track } from '@/testing';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';

import { SkillsViewContextProvider } from '../SkillsViewContext';
import type { SkillsViewContextValue } from '../SkillsViewContext.types';

import { SkillsRadarView } from './SkillsRadarView';

const SKILLS = [
  new SkillSummary().years(4).mock(),
  new SkillSummary()
    .id('team-leadership')
    .skill('Team Leadership')
    .years(2)
    .categoryId('leadership')
    .categoryName('Leadership & Delivery')
    .categoryIndex(1)
    .subCategoryId('people-management')
    .subCategoryName('People Management')
    .colour('green')
    .mock(),
];

const renderRadarView = (overrides: Partial<SkillsViewContextValue> = {}) => {
  const skills = overrides.skills ?? SKILLS;
  const selectedCategories = overrides.selectedCategories ?? [];
  const selectedSubCategories = overrides.selectedSubCategories ?? [];

  return render(
    <SkillsViewContextProvider
      track={new Track().mock()}
      skills={skills}
      filteredSkills={filterSkillsByCategory(skills, selectedCategories, selectedSubCategories)}
      selectedCategories={selectedCategories}
      selectedSubCategories={selectedSubCategories}
      searchTerm=""
      onClearFilters={jest.fn()}
      {...overrides}
    >
      <SkillsRadarView />
    </SkillsViewContextProvider>
  );
};

describe('SkillsRadarView', () => {
  test('renders category totals for the unfiltered skill set', async () => {
    const screen = renderRadarView();

    expect(
      screen.getByRole('cell', { name: 'Frontend Development' }).closest('tr')?.textContent
    ).toBe('Frontend Development41');
    expect(
      screen.getByRole('cell', { name: 'Leadership & Delivery' }).closest('tr')?.textContent
    ).toBe('Leadership & Delivery21');
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('keeps a filtered-out category present at 0, rather than removing its axis', () => {
    const screen = renderRadarView({ selectedCategories: ['leadership'] });

    expect(
      screen.getByRole('cell', { name: 'Frontend Development' }).closest('tr')?.textContent
    ).toBe('Frontend Development00');
    expect(
      screen.getByRole('cell', { name: 'Leadership & Delivery' }).closest('tr')?.textContent
    ).toBe('Leadership & Delivery21');
  });

  test('shows "no skill data" when there are no skills at all', () => {
    const screen = renderRadarView({ skills: [] });

    expect(screen.getByText('No skill data available.')).toBeVisible();
  });

  test('shows "no skills match" with a Clear filters button when a filter excludes every skill', async () => {
    const user = userEvent.setup();
    const onClearFilters = jest.fn();
    const screen = renderRadarView({ selectedSubCategories: ['testing'], onClearFilters });

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
