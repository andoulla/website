import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { Recommendation, SkillSummary } from '@/testing';

import { SkillsListView, type SkillsListViewProps } from './SkillsListView';

const SKILLS = [
  new SkillSummary().years(4).mock(),
  new SkillSummary()
    .skill('Team Leadership')
    .years(3)
    .category('managerial')
    .colour('secondary')
    .mock(),
  new SkillSummary()
    .skill('Mentoring')
    .years(2)
    .category('soft-skills')
    .colour('success')
    .recommendationIds(['rec-1'])
    .mock(),
];

const RECOMMENDATIONS = [
  new Recommendation()
    .authorInitials('A.B.')
    .authorRole({ jobTitle: 'Engineer' })
    .text('Excellent mentor.')
    .postedDate('2026-01-01')
    .recommendationUrl('https://www.linkedin.com/in/example/details/recommendations/')
    .mock(),
];

const renderListView = (props: Partial<SkillsListViewProps> = {}) =>
  render(
    <SkillsListView
      skills={SKILLS}
      recommendations={RECOMMENDATIONS}
      selectedCategories={[]}
      selectedSubCategories={[]}
      {...props}
    />
  );

describe('SkillsListView', () => {
  test('renders a list item for each skill with name and years', () => {
    const screen = renderListView();

    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('est. 4 years')).toBeVisible();
    expect(screen.getByText('Team Leadership')).toBeVisible();
    expect(screen.getByText('est. 3 years')).toBeVisible();
    expect(screen.getByText('Mentoring')).toBeVisible();
    expect(screen.getByText('est. 2 years')).toBeVisible();
  });

  test('renders "year" (singular) when a skill has exactly 1 year', () => {
    const skills = [new SkillSummary().skill('Docker').years(1).mock()];
    const screen = renderListView({ skills, recommendations: [] });

    expect(screen.getByText('est. 1 year')).toBeVisible();
  });

  test('renders category section headings', () => {
    const screen = renderListView();

    expect(screen.getByText('Engineering')).toBeVisible();
    expect(screen.getByText('Managerial')).toBeVisible();
    expect(screen.getByText('Soft Skills')).toBeVisible();
  });

  test('does not render a section for a category with no skills', () => {
    const screen = renderListView();

    expect(screen.queryByText('Other')).not.toBeInTheDocument();
  });

  test('groups skills into sub-category headings when a category has more than one sub-category present', () => {
    const skills = [
      new SkillSummary().skill('React').subCategory('frontend-development').mock(),
      new SkillSummary().skill('Jest').subCategory('testing').mock(),
    ];
    const screen = renderListView({ skills, recommendations: [] });

    expect(screen.getByText('Frontend Development')).toBeVisible();
    expect(screen.getByText('Testing')).toBeVisible();
  });

  test('does not render a sub-category heading when a category has only one sub-category present', () => {
    const skills = [
      new SkillSummary().skill('React').subCategory('frontend-development').mock(),
      new SkillSummary().skill('TypeScript').subCategory('frontend-development').mock(),
    ];
    const screen = renderListView({ skills, recommendations: [] });

    expect(screen.queryByText('Frontend Development')).not.toBeInTheDocument();
  });

  test('shows the company/year breakdown in a tooltip on hover', async () => {
    const user = userEvent.setup();
    const screen = renderListView();

    await user.hover(screen.getByText('React'));

    expect(await screen.findByText('Acme Corp · 1 year')).toBeVisible();
  });

  test('opens a popover with linked recommendations on list item click', async () => {
    const user = userEvent.setup();
    const screen = renderListView();

    await user.click(screen.getByText('Mentoring'));
    expect(screen.getByText('Excellent mentor.')).toBeVisible();
  });

  test('shows empty state in popover when no recommendations match', async () => {
    const user = userEvent.setup();
    const screen = renderListView();

    await user.click(screen.getByText('React'));
    expect(screen.getByText('No recommendations yet.')).toBeVisible();
  });

  test('applies a highlight to the skill matching highlightedSkill', () => {
    const screen = renderListView({ highlightedSkill: 'React' });

    expect(screen.getByRole('button', { name: 'React est. 4 years' })).toBeVisible();
  });

  test('hides skills outside the selected categories', () => {
    const screen = renderListView({ selectedCategories: ['managerial'] });

    expect(screen.getByText('Team Leadership')).toBeVisible();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  test('does not render a section for a category with no matching skills after filtering', () => {
    const screen = renderListView({ selectedCategories: ['managerial'] });

    expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
    expect(screen.queryByText('Soft Skills')).not.toBeInTheDocument();
  });

  test('hides skills outside the selected subcategories', () => {
    const skills = [
      new SkillSummary().skill('React').subCategory('frontend-development').mock(),
      new SkillSummary().skill('Jest').subCategory('testing').mock(),
    ];
    const screen = renderListView({
      skills,
      recommendations: [],
      selectedSubCategories: ['testing'],
    });

    expect(screen.getByText('Jest')).toBeVisible();
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  test('has no axe violations', async () => {
    const screen = renderListView();

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with a highlighted skill', async () => {
    const screen = renderListView({ highlightedSkill: 'React' });

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with the popover open and recommendations shown', async () => {
    const user = userEvent.setup();
    const screen = renderListView();

    await user.click(screen.getByText('Mentoring'));

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
