import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { SkillSummary, Track } from '@/testing';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';

import { SkillsViewContextProvider } from '../SkillsViewContext';
import type { SkillsViewContextValue } from '../SkillsViewContext.types';

import { SkillsTableView } from './SkillsTableView';

const testTrack = new Track()
  .categories([
    {
      id: 'frontend-development',
      name: 'Frontend Development',
      subCategories: [
        {
          id: 'core-technologies',
          name: 'Core Technologies',
          skillIds: ['react', 'typescript', 'docker'],
        },
        { id: 'styling', name: 'Styling & UI', skillIds: ['css-in-js'] },
        { id: 'testing', name: 'Testing', skillIds: ['jest'] },
      ],
    },
    {
      id: 'leadership',
      name: 'Leadership & Delivery',
      subCategories: [
        { id: 'people-management', name: 'People Management', skillIds: ['team-leadership'] },
      ],
    },
    {
      id: 'people-stakeholders',
      name: 'People & Stakeholders',
      subCategories: [{ id: 'mentoring', name: 'Mentoring', skillIds: ['mentoring'] }],
    },
    {
      id: 'tooling',
      name: 'Tooling',
      subCategories: [{ id: 'dev-tools', name: 'Dev Tools', skillIds: [] }],
    },
  ])
  .mock();

const SKILLS = [
  new SkillSummary().years(4).mock(),
  new SkillSummary()
    .id('team-leadership')
    .skill('Team Leadership')
    .years(3)
    .categoryId('leadership')
    .categoryName('Leadership & Delivery')
    .categoryIndex(1)
    .subCategoryId('people-management')
    .subCategoryName('People Management')
    .colour('green')
    .mock(),
  new SkillSummary()
    .id('mentoring')
    .skill('Mentoring')
    .years(2)
    .categoryId('people-stakeholders')
    .categoryName('People & Stakeholders')
    .categoryIndex(2)
    .subCategoryId('mentoring')
    .subCategoryName('Mentoring')
    .colour('plum')
    .recommendationIds(['rec-1'])
    .mock(),
];

const renderTableView = (overrides: Partial<SkillsViewContextValue> = {}) => {
  const skills = overrides.skills ?? SKILLS;
  const selectedCategories = overrides.selectedCategories ?? [];
  const selectedSubCategories = overrides.selectedSubCategories ?? [];

  return render(
    <MemoryRouter>
      <SkillsViewContextProvider
        track={testTrack}
        skills={skills}
        filteredSkills={filterSkillsByCategory(skills, selectedCategories, selectedSubCategories)}
        selectedCategories={selectedCategories}
        selectedSubCategories={selectedSubCategories}
        searchTerm=""
        onClearFilters={jest.fn()}
        {...overrides}
      >
        <SkillsTableView />
      </SkillsViewContextProvider>
    </MemoryRouter>
  );
};

describe('SkillsTableView', () => {
  describe('render and grouping', () => {
    test('renders a table row for each skill with name and years', async () => {
      const screen = renderTableView();

      expect(screen.getByText('React')).toBeVisible();
      expect(screen.getByText('4 years')).toBeVisible();
      expect(screen.getByText('Team Leadership')).toBeVisible();
      expect(screen.getByText('3 years')).toBeVisible();
      expect(screen.getByText('Mentoring')).toBeVisible();
      expect(screen.getByText('2 years')).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('renders "year" (singular) when a skill has exactly 1 year', () => {
      const skills = [new SkillSummary().id('docker').skill('Docker').years(1).mock()];
      const screen = renderTableView({ skills });

      expect(screen.getByText('1 year')).toBeVisible();
    });

    test('renders category group rows from the track', () => {
      const screen = renderTableView();

      expect(screen.getByText('Frontend Development')).toBeVisible();
      expect(screen.getByText('Leadership & Delivery')).toBeVisible();
      expect(screen.getByText('People & Stakeholders')).toBeVisible();
    });

    test('does not render a group row for a category with no skills', () => {
      const screen = renderTableView();

      expect(screen.queryByText('Tooling')).not.toBeInTheDocument();
    });

    test('groups skills into sub-category rows when a category has more than one sub-category present', () => {
      const skills = [
        new SkillSummary().mock(),
        new SkillSummary()
          .id('css-in-js')
          .skill('CSS-in-JS')
          .subCategoryId('styling')
          .subCategoryName('Styling & UI')
          .mock(),
      ];
      const screen = renderTableView({ skills });

      expect(screen.getByText('Core Technologies')).toBeVisible();
      expect(screen.getByText('Styling & UI')).toBeVisible();
    });

    test('does not render a sub-category row when a category has only one sub-category present', () => {
      const skills = [
        new SkillSummary().mock(),
        new SkillSummary().id('typescript').skill('TypeScript').mock(),
      ];
      const screen = renderTableView({ skills });

      expect(screen.queryByText('Core Technologies')).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    test('hides skills outside the selected categories', () => {
      const screen = renderTableView({ selectedCategories: ['leadership'] });

      expect(screen.getByText('Team Leadership')).toBeVisible();
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });

    test('does not render a group row for a category with no matching skills after filtering', () => {
      const screen = renderTableView({ selectedCategories: ['leadership'] });

      expect(screen.queryByText('Frontend Development')).not.toBeInTheDocument();
      expect(screen.queryByText('People & Stakeholders')).not.toBeInTheDocument();
    });

    test('hides skills outside the selected subcategories', () => {
      const skills = [
        new SkillSummary().mock(),
        new SkillSummary()
          .id('jest')
          .skill('Jest')
          .subCategoryId('testing')
          .subCategoryName('Testing')
          .mock(),
      ];
      const screen = renderTableView({
        skills,
        selectedSubCategories: ['testing'],
      });

      expect(screen.getByText('Jest')).toBeVisible();
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });
  });

  describe('search', () => {
    test('hides skills that do not match the search term', async () => {
      const screen = renderTableView({ searchTerm: 'rea' });

      expect(screen.getByText('React')).toBeVisible();
      expect(screen.queryByText('Team Leadership')).not.toBeInTheDocument();
      expect(screen.queryByText('Mentoring')).not.toBeInTheDocument();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('does not render a group row for a category with no matches after search', () => {
      const screen = renderTableView({ searchTerm: 'rea' });

      expect(screen.queryByText('Leadership & Delivery')).not.toBeInTheDocument();
      expect(screen.queryByText('People & Stakeholders')).not.toBeInTheDocument();
    });

    test('shows every skill for a single-character term, below the minimum match length', () => {
      const screen = renderTableView({ searchTerm: 'r' });

      expect(screen.getByText('React')).toBeVisible();
      expect(screen.getByText('Team Leadership')).toBeVisible();
      expect(screen.getByText('Mentoring')).toBeVisible();
    });
  });

  describe('empty state', () => {
    test('shows the empty message and a Clear filters button when a category/subcategory filter excludes every skill', async () => {
      const user = userEvent.setup();
      const onClearFilters = jest.fn();
      const screen = renderTableView({
        selectedCategories: ['tooling'],
        onClearFilters,
      });

      expect(screen.getByText('No skills match the selected filter.')).toBeVisible();

      await user.click(screen.getByRole('button', { name: 'Clear filters' }));

      expect(onClearFilters).toHaveBeenCalledTimes(1);
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('hides the Clear filters button when the search term alone excludes every skill', () => {
      const screen = renderTableView({ searchTerm: 'nonexistent skill' });

      expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
    });
  });

  describe('highlight and scroll', () => {
    test('applies a highlight to the skill matching highlightedSkills', async () => {
      const screen = renderTableView({ highlightedSkills: ['React'] });

      const row = screen.getByText('React').closest('tr');

      expect(row).toHaveStyle({
        backgroundColor: expect.stringContaining('rgb'),
      });
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('applies a highlight to every skill matching multiple highlightedSkills', () => {
      const screen = renderTableView({ highlightedSkills: ['React', 'Mentoring'] });

      const reactRow = screen.getByText('React').closest('tr');
      const mentoringRow = screen.getByText('Mentoring').closest('tr');

      expect(reactRow).toHaveStyle({
        backgroundColor: expect.stringContaining('rgb'),
      });
      expect(mentoringRow).toHaveStyle({
        backgroundColor: expect.stringContaining('rgb'),
      });
    });

    test('scrolls the highlighted skill into view', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      renderTableView({ highlightedSkills: ['React'] });

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });

      scrollIntoViewSpy.mockRestore();
    });

    test('scrolls to the first of several highlighted skills', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      const screen = renderTableView({ highlightedSkills: ['Team Leadership', 'React'] });

      expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Team Leadership')).toBeVisible();

      scrollIntoViewSpy.mockRestore();
    });

    test('does not scroll when there is no highlighted skill', () => {
      const scrollIntoViewSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');

      renderTableView();

      expect(scrollIntoViewSpy).not.toHaveBeenCalled();

      scrollIntoViewSpy.mockRestore();
    });
  });
});
