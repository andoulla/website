import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { SkillSummary } from '@/testing';

import { SkillsViewContextProvider } from '../SkillsViewContext';
import type { SkillsViewContextValue } from '../SkillsViewContext.type';

import { SkillsGraphView } from './SkillsGraphView';

const SKILLS = [
  new SkillSummary().years(4).mock(),
  new SkillSummary()
    .skill('Team Leadership')
    .years(2)
    .category('leadership-delivery')
    .subCategory('leadership')
    .colour('secondary')
    .mock(),
];

const renderGraphView = (overrides: Partial<SkillsViewContextValue> = {}) =>
  render(
    <SkillsViewContextProvider
      skills={SKILLS}
      selectedCategories={[]}
      selectedSubCategories={[]}
      searchTerm=""
      onClearFilters={jest.fn()}
      {...overrides}
    >
      <SkillsGraphView />
    </SkillsViewContextProvider>
  );

describe('SkillsGraphView', () => {
  test('shows all skills in the accessible table when no filters are active', async () => {
    const screen = renderGraphView();

    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Team Leadership')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('filtering to a category shows only matching skills', () => {
    const screen = renderGraphView({ selectedCategories: ['engineering'] });

    // header row + 1 data row for the one engineering skill
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.queryByText('Team Leadership')).not.toBeInTheDocument();
  });

  test('filtering to a subcategory shows only matching skills', () => {
    const screen = renderGraphView({ selectedSubCategories: ['leadership'] });

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('Team Leadership')).toBeVisible();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  test('combines category and subcategory filters', () => {
    const screen = renderGraphView({
      selectedCategories: ['leadership-delivery'],
      selectedSubCategories: ['development'],
    });

    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(screen.queryByText('Team Leadership')).not.toBeInTheDocument();
  });

  test('passes the search term through to the bar chart', () => {
    const screen = renderGraphView({ searchTerm: 'react' });

    expect(screen.getByText('React')).toBeVisible();
  });

  test('shows the empty-filter message and a Clear filters button, not the no-data Alert, when filters exclude every skill', async () => {
    const user = userEvent.setup();
    const onClearFilters = jest.fn();
    const screen = renderGraphView({
      selectedCategories: ['leadership-delivery'],
      selectedSubCategories: ['development'],
      onClearFilters,
    });

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('shows the no-data Alert when skills array is empty', async () => {
    const screen = renderGraphView({ skills: [] });

    expect(screen.getByRole('alert')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
