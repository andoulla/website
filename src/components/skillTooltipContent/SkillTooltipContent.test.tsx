import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { SkillSummary } from '@/testing';
import type { SkillSummary as SkillSummaryData } from '@/utils/calculateSkillYears';

import { SkillTooltipContent } from './SkillTooltipContent';

const renderTooltip = (skill: SkillSummaryData) =>
  render(
    <MemoryRouter>
      <SkillTooltipContent skill={skill} />
    </MemoryRouter>
  );

describe('SkillTooltipContent', () => {
  test('renders plural "years" for counts greater than 1', () => {
    const skill = new SkillSummary().skill('TypeScript').years(4).mock();
    const screen = renderTooltip(skill);

    expect(screen.getByText('4 years')).toBeVisible();
  });

  test('renders singular "year" when years is exactly 1', () => {
    const skill = new SkillSummary().skill('TypeScript').years(1).mock();
    const screen = renderTooltip(skill);

    expect(screen.getByText('1 year')).toBeVisible();
  });

  test('renders skill name and a chip with years per company', () => {
    const skill = new SkillSummary()
      .skill('TypeScript')
      .years(3)
      .companyYears([
        { name: 'Acme', years: 2 },
        { name: 'Globex', years: 1 },
      ])
      .mock();
    const screen = renderTooltip(skill);

    expect(screen.getByText('TypeScript')).toBeVisible();
    expect(screen.getByText('Acme · 2 years')).toBeVisible();
    expect(screen.getByText('Globex · 1 year')).toBeVisible();
  });

  test('renders the sub-category label', () => {
    const skill = new SkillSummary().skill('React Testing Library').subCategory('testing').mock();
    const screen = renderTooltip(skill);

    expect(screen.getByText('Testing')).toBeVisible();
  });

  test('renders a total years figure that matches the sum of the per-company breakdown', () => {
    const companyYears = [
      { name: 'Acme', years: 2 },
      { name: 'Globex', years: 1.5 },
    ];
    const total = companyYears.reduce((sum, c) => sum + c.years, 0);
    const skill = new SkillSummary()
      .skill('TypeScript')
      .years(total)
      .companyYears(companyYears)
      .mock();
    const screen = renderTooltip(skill);

    expect(screen.getByText(`${total} years`)).toBeVisible();
  });

  test('does not render a chip stack when there are no companies', () => {
    const skill = new SkillSummary().skill('TypeScript').years(1).companyYears([]).mock();
    const screen = renderTooltip(skill);

    expect(screen.queryByText('·', { exact: false })).not.toBeInTheDocument();
  });

  describe('View on Resume link', () => {
    test('links to the Resume page with this skill', () => {
      const skill = new SkillSummary().skill('React').mock();
      const screen = renderTooltip(skill);

      expect(screen.getByRole('link', { name: 'View on Resume' })).toHaveAttribute(
        'href',
        '/?skill=React'
      );
    });

    test('URL-encodes a skill name containing a space', () => {
      const skill = new SkillSummary().skill('Team Leadership').mock();
      const screen = renderTooltip(skill);

      expect(screen.getByRole('link', { name: 'View on Resume' })).toHaveAttribute(
        'href',
        '/?skill=Team%20Leadership'
      );
    });
  });

  describe('recommendation count and link', () => {
    test('renders no recommendation link or message when the skill has none linked', () => {
      const skill = new SkillSummary().recommendationIds([]).mock();
      const screen = renderTooltip(skill);

      expect(screen.queryByText('No recommendations yet.')).not.toBeInTheDocument();
      expect(screen.queryByText('recommendation', { exact: false })).not.toBeInTheDocument();
    });

    test('shows a singular count linking to the recommendation', () => {
      const skill = new SkillSummary().recommendationIds(['rec-1']).mock();
      const screen = renderTooltip(skill);

      expect(screen.getByRole('link', { name: '1 recommendation' })).toHaveAttribute(
        'href',
        '/?recommendation=rec-1'
      );
    });

    test('shows a plural count linking to the first recommendation', () => {
      const skill = new SkillSummary().recommendationIds(['rec-1', 'rec-2']).mock();
      const screen = renderTooltip(skill);

      expect(screen.getByRole('link', { name: '2 recommendations' })).toHaveAttribute(
        'href',
        '/?recommendation=rec-1'
      );
    });
  });

  test('has no axe violations', async () => {
    const skill = new SkillSummary().skill('TypeScript').years(3).mock();
    const screen = renderTooltip(skill);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with no companies', async () => {
    const skill = new SkillSummary().skill('TypeScript').years(1).companyYears([]).mock();
    const screen = renderTooltip(skill);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
