import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary } from '@/testing';
import type { PresentCategory } from '@/utils/derivePresentCategories';

import { SkillsRadarChart } from './SkillsRadarChart';

const SKILLS = [
  new SkillSummary().skill('React').years(4).mock(),
  new SkillSummary()
    .id('mentoring')
    .skill('Mentoring')
    .years(2)
    .categoryId('people-stakeholders')
    .categoryName('People & Stakeholders')
    .categoryIndex(2)
    .colour('plum')
    .mock(),
];

const ALL_CATEGORIES: PresentCategory[] = [
  { id: 'frontend-development', name: 'Frontend Development', index: 0, colour: 'teal' },
  { id: 'leadership', name: 'Leadership', index: 1, colour: 'green' },
  { id: 'people-stakeholders', name: 'People & Stakeholders', index: 2, colour: 'plum' },
  { id: 'tooling', name: 'Tooling', index: 3, colour: 'brown' },
];

describe('SkillsRadarChart', () => {
  test('renders the accessible table with a row per category plus a header', async () => {
    const screen = render(<SkillsRadarChart skills={SKILLS} categories={ALL_CATEGORIES} />);

    // thead row + 4 category rows = 5
    expect(screen.getAllByRole('row')).toHaveLength(5);
    expect(screen.getByRole('cell', { name: 'Frontend Development' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Tooling' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('keeps a filtered-out category at 0 years and 0 skills', () => {
    const screen = render(
      <SkillsRadarChart skills={SKILLS} categories={ALL_CATEGORIES.slice(0, 2)} />
    );

    const leadershipRow = screen.getByRole('cell', { name: 'Leadership' }).closest('tr');

    expect(leadershipRow).not.toBeNull();
    expect(leadershipRow?.textContent).toBe('Leadership00');
  });

  test('renders a legend entry for every category passed in, not just present ones', () => {
    const screen = render(<SkillsRadarChart skills={SKILLS} categories={ALL_CATEGORIES} />);

    // Each label appears twice: once in the legend and once in the accessible table.
    expect(screen.getAllByText('Frontend Development')).toHaveLength(2);
    expect(screen.getAllByText('Tooling')).toHaveLength(2);
    expect(screen.getAllByText('People & Stakeholders')).toHaveLength(2);
  });
});
