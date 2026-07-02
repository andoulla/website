import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import type { Recommendation } from '../../../../types';
import type { SkillSummary } from '../../../../utils/calculateSkillYears';

import { SkillsListView } from './SkillsListView';

const SKILLS: SkillSummary[] = [
  { skill: 'React', years: 4, category: 'engineering', colour: 'primary' },
  { skill: 'Team Leadership', years: 3, category: 'managerial', colour: 'secondary' },
  { skill: 'Mentoring', years: 2, category: 'soft-skills', colour: 'success' },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    jobId: 'job-1',
    authorInitials: 'A.B.',
    authorRole: { jobTitle: 'Engineer', company: 'Acme' },
    text: 'Excellent mentor.',
    skills: ['Mentoring'],
    postedDate: '2026-01-01',
    recommendationUrl: '',
  },
];

describe('SkillsListView', () => {
  test('renders a chip for each skill with years', () => {
    const screen = render(<SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} />);
    expect(screen.getByText('React · est. 4 years')).toBeVisible();
    expect(screen.getByText('Team Leadership · est. 3 years')).toBeVisible();
    expect(screen.getByText('Mentoring · est. 2 years')).toBeVisible();
  });

  test('renders category section headings', () => {
    const screen = render(<SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} />);
    expect(screen.getByText('Engineering')).toBeVisible();
    expect(screen.getByText('Managerial')).toBeVisible();
    expect(screen.getByText('Soft Skills')).toBeVisible();
  });

  test('does not render a section for a category with no skills', () => {
    const screen = render(<SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} />);
    expect(screen.queryByText('Other')).not.toBeInTheDocument();
  });

  test('opens a popover with linked recommendations on chip click', async () => {
    const user = userEvent.setup();
    const screen = render(<SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} />);
    await user.click(screen.getByText('Mentoring · est. 2 years'));
    expect(screen.getByText('Excellent mentor.')).toBeVisible();
  });

  test('shows empty state in popover when no recommendations match', async () => {
    const user = userEvent.setup();
    const screen = render(<SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} />);
    await user.click(screen.getByText('React · est. 4 years'));
    expect(screen.getByText('No recommendations yet.')).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = render(<SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} />);
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
