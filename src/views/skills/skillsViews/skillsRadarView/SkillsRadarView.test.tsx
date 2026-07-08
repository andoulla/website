import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary } from '@/testing';

import { SkillsViewContextProvider } from '../SkillsViewContext';
import type { SkillsViewContextValue } from '../SkillsViewContext.type';

import { SkillsRadarView } from './SkillsRadarView';

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

const renderRadarView = (overrides: Partial<SkillsViewContextValue> = {}) =>
  render(
    <SkillsViewContextProvider
      skills={SKILLS}
      recommendations={[]}
      selectedCategories={[]}
      selectedSubCategories={[]}
      searchTerm=""
      {...overrides}
    >
      <SkillsRadarView />
    </SkillsViewContextProvider>
  );

describe('SkillsRadarView', () => {
  test('renders category totals for the unfiltered skill set', () => {
    const screen = renderRadarView();

    expect(screen.getByRole('cell', { name: 'Engineering' }).closest('tr')?.textContent).toBe(
      'Engineering41'
    );
    expect(
      screen.getByRole('cell', { name: 'Leadership & Delivery' }).closest('tr')?.textContent
    ).toBe('Leadership & Delivery21');
  });

  test('keeps a filtered-out category present at 0, rather than removing its axis', () => {
    const screen = renderRadarView({ selectedCategories: ['leadership-delivery'] });

    expect(screen.getByRole('cell', { name: 'Engineering' }).closest('tr')?.textContent).toBe(
      'Engineering00'
    );
    expect(
      screen.getByRole('cell', { name: 'Leadership & Delivery' }).closest('tr')?.textContent
    ).toBe('Leadership & Delivery21');
  });

  test('shows "no skill data" when there are no skills at all', () => {
    const screen = renderRadarView({ skills: [] });

    expect(screen.getByText('No skill data available.')).toBeVisible();
  });

  test('shows "no skills match" when a filter excludes every skill', () => {
    const screen = renderRadarView({ selectedSubCategories: ['testing'] });

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = renderRadarView();

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
