import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary } from '@/testing';

import { SkillsBarChart } from './SkillsBarChart';

const SKILLS = [
  new SkillSummary().years(4).mock(),
  new SkillSummary()
    .skill('Mentoring')
    .years(2)
    .category('people-stakeholders')
    .colour('success')
    .companyYears([{ name: 'Globex', years: 2 }])
    .mock(),
];

describe('SkillsBarChart', () => {
  test('renders the accessible table with a row per skill plus a header', () => {
    const screen = render(<SkillsBarChart skills={SKILLS} />);

    // thead row + 2 data rows = 3
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Mentoring')).toBeVisible();
  });

  test('renders legend entries for categories present in skills', () => {
    const screen = render(<SkillsBarChart skills={SKILLS} />);

    // Each label appears twice: once in the legend and once in the accessible table
    expect(screen.getAllByText('Engineering')).toHaveLength(2);
    expect(screen.getAllByText('People & Stakeholders')).toHaveLength(2);
  });

  test('renders legend entries when showPatterns is false', async () => {
    const screen = render(<SkillsBarChart skills={SKILLS} showPatterns={false} />);

    expect(screen.getAllByText('Engineering')).toHaveLength(2);
    expect(screen.getAllByText('People & Stakeholders')).toHaveLength(2);
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('does not render a legend entry for absent categories', () => {
    const screen = render(<SkillsBarChart skills={SKILLS} />);

    expect(screen.queryByText('Quality & Performance')).not.toBeInTheDocument();
    expect(screen.queryByText('Tooling')).not.toBeInTheDocument();
  });

  test('shows empty state message when skills array is empty', () => {
    const screen = render(<SkillsBarChart skills={[]} />);

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
  });

  test('has no axe violations with skills', async () => {
    const screen = render(<SkillsBarChart skills={SKILLS} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations when empty', async () => {
    const screen = render(<SkillsBarChart skills={[]} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
