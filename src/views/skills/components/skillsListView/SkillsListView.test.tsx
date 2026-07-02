import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import type { Recommendation } from '../../../../types';
import type { SkillSummary } from '../../../../utils/calculateSkillYears';

import { SkillsListView } from './SkillsListView';

const SKILLS: SkillSummary[] = [
  {
    skill: 'React',
    years: 4,
    category: 'engineering',
    colour: 'primary',
    jobIds: ['job-1'],
    recommendationIds: [],
  },
  {
    skill: 'Team Leadership',
    years: 3,
    category: 'managerial',
    colour: 'secondary',
    jobIds: ['job-1'],
    recommendationIds: [],
  },
  {
    skill: 'Mentoring',
    years: 2,
    category: 'soft-skills',
    colour: 'success',
    jobIds: ['job-1'],
    recommendationIds: ['rec-1'],
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    jobId: 'job-1',
    authorInitials: 'A.B.',
    authorRole: { jobTitle: 'Engineer', company: 'Acme' },
    text: 'Excellent mentor.',
    postedDate: '2026-01-01',
    recommendationUrl: '',
  },
];

describe('SkillsListView', () => {
  test('renders a list item for each skill with name and years', () => {
    const screen = render(<SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} />);
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('est. 4 years')).toBeVisible();
    expect(screen.getByText('Team Leadership')).toBeVisible();
    expect(screen.getByText('est. 3 years')).toBeVisible();
    expect(screen.getByText('Mentoring')).toBeVisible();
    expect(screen.getByText('est. 2 years')).toBeVisible();
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

  test('opens a popover with linked recommendations on list item click', async () => {
    const user = userEvent.setup();
    const screen = render(<SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} />);
    await user.click(screen.getByText('Mentoring'));
    expect(screen.getByText('Excellent mentor.')).toBeVisible();
  });

  test('shows empty state in popover when no recommendations match', async () => {
    const user = userEvent.setup();
    const screen = render(<SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} />);
    await user.click(screen.getByText('React'));
    expect(screen.getByText('No recommendations yet.')).toBeVisible();
  });

  test('applies a highlight to the skill matching highlightedSkill', () => {
    const screen = render(
      <SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} highlightedSkill="React" />
    );
    expect(screen.getByRole('button', { name: /React/ })).toBeVisible();
  });

  test('has no axe violations', async () => {
    const screen = render(<SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} />);
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with a highlighted skill', async () => {
    const screen = render(
      <SkillsListView skills={SKILLS} recommendations={RECOMMENDATIONS} highlightedSkill="React" />
    );
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
