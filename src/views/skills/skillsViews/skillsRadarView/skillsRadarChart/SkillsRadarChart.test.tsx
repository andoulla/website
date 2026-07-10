import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary } from '@/testing';

import { SkillsRadarChart } from './SkillsRadarChart';

const SKILLS = [
  new SkillSummary().skill('React').years(4).category('engineering').mock(),
  new SkillSummary()
    .skill('Mentoring')
    .years(2)
    .category('people-stakeholders')
    .colour('success')
    .mock(),
];

const ALL_CATEGORIES = [
  'engineering',
  'quality-performance',
  'tooling',
  'leadership-delivery',
  'people-stakeholders',
] as const;

describe('SkillsRadarChart', () => {
  test('renders the accessible table with a row per category plus a header', async () => {
    const screen = render(<SkillsRadarChart skills={SKILLS} categories={[...ALL_CATEGORIES]} />);

    // thead row + 5 category rows = 6
    expect(screen.getAllByRole('row')).toHaveLength(6);
    expect(screen.getByRole('cell', { name: 'Engineering' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Tooling' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('keeps a filtered-out category at 0 years and 0 skills', () => {
    const screen = render(
      <SkillsRadarChart skills={SKILLS} categories={['engineering', 'tooling']} />
    );

    const toolingRow = screen.getByRole('cell', { name: 'Tooling' }).closest('tr');

    expect(toolingRow).not.toBeNull();
    expect(toolingRow?.textContent).toBe('Tooling00');
  });

  test('renders a legend entry for every category passed in, not just present ones', () => {
    const screen = render(<SkillsRadarChart skills={SKILLS} categories={[...ALL_CATEGORIES]} />);

    // Each label appears twice: once in the legend and once in the accessible table.
    expect(screen.getAllByText('Engineering')).toHaveLength(2);
    expect(screen.getAllByText('Tooling')).toHaveLength(2);
    expect(screen.getAllByText('People & Stakeholders')).toHaveLength(2);
  });
});
