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
    .colour('secondary')
    .mock(),
];

describe('SkillsGraphView', () => {
  test('shows all skills in the accessible table when filter is "all"', () => {
    const screen = render(<SkillsGraphView skills={SKILLS} filterCategory="all" />);

    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Team Leadership')).toBeVisible();
  });

  test('filtering to a category shows only matching skills', () => {
    const screen = render(<SkillsGraphView skills={SKILLS} filterCategory="engineering" />);

    // header row + 1 data row for the one engineering skill
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.queryByText('Team Leadership')).not.toBeInTheDocument();
  });

  test('shows the no-data Alert when skills array is empty', () => {
    const screen = render(<SkillsGraphView skills={[]} filterCategory="all" />);

    expect(screen.getByRole('alert')).toBeVisible();
  });

  test('has no axe violations with data', async () => {
    const screen = render(<SkillsGraphView skills={SKILLS} filterCategory="all" />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with empty data', async () => {
    const screen = render(<SkillsGraphView skills={[]} filterCategory="all" />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
