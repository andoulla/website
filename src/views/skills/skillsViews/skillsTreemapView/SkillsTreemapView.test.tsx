import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary, Track } from '@/testing';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';

import { SkillsViewContextProvider } from '../SkillsViewContext';
import type { SkillsViewContextValue } from '../SkillsViewContext.types';

import { SkillsTreemapView } from './SkillsTreemapView';

const SKILLS = [
  new SkillSummary().years(5).mock(),
  new SkillSummary()
    .id('team-leadership')
    .skill('Team Leadership')
    .years(2)
    .categoryId('leadership')
    .categoryName('Leadership & Delivery')
    .categoryIndex(1)
    .subCategoryId('people-management')
    .subCategoryName('People Management')
    .mock(),
];

const renderTreemapView = (overrides: Partial<SkillsViewContextValue> = {}) => {
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
      <SkillsTreemapView />
    </SkillsViewContextProvider>
  );
};

describe('SkillsTreemapView', () => {
  test('renders and passes axe with skill data', async () => {
    const screen = renderTreemapView();

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('shows "no skill data" when there are no skills at all', () => {
    const screen = renderTreemapView({ skills: [] });

    expect(screen.getByText('No skill data available.')).toBeVisible();
  });

  test('shows empty state when every skill is filtered out', async () => {
    const screen = renderTreemapView({ selectedSubCategories: ['testing'] });

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
