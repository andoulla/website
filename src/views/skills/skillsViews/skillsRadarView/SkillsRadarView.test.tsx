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
    .category('managerial')
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
      {...overrides}
    >
      <SkillsRadarView />
    </SkillsViewContextProvider>
  );

describe('SkillsRadarView', () => {
  test('shows a placeholder message with the filtered skill count', () => {
    const screen = renderRadarView();

    expect(screen.getByText('Radar view coming soon (2 skills).')).toBeVisible();
  });

  test('reflects the active category filter in the placeholder count', () => {
    const screen = renderRadarView({ selectedCategories: ['managerial'] });

    expect(screen.getByText('Radar view coming soon (1 skills).')).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = renderRadarView();

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
