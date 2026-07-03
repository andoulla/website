import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary } from '../../../../../../testing';

import { SkillsBarChart } from './SkillsBarChart';

const SKILLS = [
  new SkillSummary().years(4).mock(),
  new SkillSummary()
    .skill('Mentoring')
    .years(2)
    .category('soft-skills')
    .colour('success')
    .jobIds(['job-2'])
    .mock(),
];

const COMPANY_MAP = new Map([
  ['job-1', 'Acme Corp'],
  ['job-2', 'Globex'],
]);

describe('SkillsBarChart', () => {
  test('renders the accessible table with a row per skill plus a header', () => {
    const screen = render(<SkillsBarChart skills={SKILLS} companyNameMap={COMPANY_MAP} />);

    // thead row + 2 data rows = 3
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Mentoring')).toBeVisible();
  });

  test('renders legend entries for categories present in skills', () => {
    const screen = render(<SkillsBarChart skills={SKILLS} companyNameMap={COMPANY_MAP} />);

    // Each label appears twice: once in the legend and once in the accessible table
    expect(screen.getAllByText('Engineering')).toHaveLength(2);
    expect(screen.getAllByText('Soft Skills')).toHaveLength(2);
  });

  test('does not render a legend entry for absent categories', () => {
    const screen = render(<SkillsBarChart skills={SKILLS} companyNameMap={COMPANY_MAP} />);

    expect(screen.queryByText('Managerial')).not.toBeInTheDocument();
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
  });

  test('shows empty state message when skills array is empty', () => {
    const screen = render(<SkillsBarChart skills={[]} companyNameMap={new Map()} />);

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
  });

  test('has no axe violations with skills', async () => {
    const screen = render(<SkillsBarChart skills={SKILLS} companyNameMap={COMPANY_MAP} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations when empty', async () => {
    const screen = render(<SkillsBarChart skills={[]} companyNameMap={new Map()} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
