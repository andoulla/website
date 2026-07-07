import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary } from '@/testing';

import { SkillsGraphView } from './SkillsGraphView';

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

describe('SkillsGraphView', () => {
  test('shows all skills in the accessible table when no filters are active', () => {
    const screen = render(
      <SkillsGraphView skills={SKILLS} selectedCategories={[]} selectedSubCategories={[]} />
    );

    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Team Leadership')).toBeVisible();
  });

  test('filtering to a category shows only matching skills', () => {
    const screen = render(
      <SkillsGraphView
        skills={SKILLS}
        selectedCategories={['engineering']}
        selectedSubCategories={[]}
      />
    );

    // header row + 1 data row for the one engineering skill
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.queryByText('Team Leadership')).not.toBeInTheDocument();
  });

  test('filtering to a subcategory shows only matching skills', () => {
    const screen = render(
      <SkillsGraphView
        skills={SKILLS}
        selectedCategories={[]}
        selectedSubCategories={['leadership']}
      />
    );

    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('Team Leadership')).toBeVisible();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  test('combines category and subcategory filters', () => {
    const screen = render(
      <SkillsGraphView
        skills={SKILLS}
        selectedCategories={['managerial']}
        selectedSubCategories={['frontend-development']}
      />
    );

    expect(screen.queryByText('React')).not.toBeInTheDocument();
    expect(screen.queryByText('Team Leadership')).not.toBeInTheDocument();
  });

  test('shows the empty-filter message from SkillsBarChart, not the no-data Alert, when filters exclude every skill', () => {
    const screen = render(
      <SkillsGraphView
        skills={SKILLS}
        selectedCategories={['managerial']}
        selectedSubCategories={['frontend-development']}
      />
    );

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('shows the no-data Alert when skills array is empty', () => {
    const screen = render(
      <SkillsGraphView skills={[]} selectedCategories={[]} selectedSubCategories={[]} />
    );

    expect(screen.getByRole('alert')).toBeVisible();
  });

  test('has no axe violations with data', async () => {
    const screen = render(
      <SkillsGraphView skills={SKILLS} selectedCategories={[]} selectedSubCategories={[]} />
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with empty data', async () => {
    const screen = render(
      <SkillsGraphView skills={[]} selectedCategories={[]} selectedSubCategories={[]} />
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
