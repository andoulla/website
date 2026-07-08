import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary } from '@/testing';

import { SkillsRadarChart } from './SkillsRadarChart';

const SKILLS = [
  new SkillSummary().skill('React').years(4).category('engineering').mock(),
  new SkillSummary().skill('Mentoring').years(2).category('soft-skills').colour('success').mock(),
];

describe('SkillsRadarChart', () => {
  test('renders the accessible table with a row per category plus a header', async () => {
    const screen = render(
      <SkillsRadarChart
        skills={SKILLS}
        categories={['engineering', 'managerial', 'soft-skills', 'other']}
      />
    );

    // thead row + 4 category rows = 5
    expect(screen.getAllByRole('row')).toHaveLength(5);
    expect(screen.getByRole('cell', { name: 'Engineering' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Managerial' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('keeps a filtered-out category at 0 years and 0 skills', () => {
    const screen = render(
      <SkillsRadarChart skills={SKILLS} categories={['engineering', 'managerial']} />
    );

    const managerialRow = screen.getByRole('cell', { name: 'Managerial' }).closest('tr');

    expect(managerialRow).not.toBeNull();
    expect(managerialRow?.textContent).toBe('Managerial00');
  });

  test('renders a legend entry for every category passed in, not just present ones', () => {
    const screen = render(
      <SkillsRadarChart
        skills={SKILLS}
        categories={['engineering', 'managerial', 'soft-skills', 'other']}
      />
    );

    // Each label appears twice: once in the legend and once in the accessible table.
    expect(screen.getAllByText('Engineering')).toHaveLength(2);
    expect(screen.getAllByText('Managerial')).toHaveLength(2);
    expect(screen.getAllByText('Other')).toHaveLength(2);
  });

  test('shows empty state message when skills array is empty', async () => {
    const screen = render(<SkillsRadarChart skills={[]} categories={['engineering']} />);

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
