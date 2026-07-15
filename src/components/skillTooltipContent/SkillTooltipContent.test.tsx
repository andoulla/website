import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { TrackContextProvider } from '@/context/track';
import { SkillSummary } from '@/testing';
import type { SkillSummary as SkillSummaryData } from '@/utils/calculateSkillYears';

import { SkillTooltipContent } from './SkillTooltipContent';

// The provider normalises the missing ?track= param to the default 'general'.
const renderTooltip = (skill: SkillSummaryData) =>
  render(
    <MemoryRouter>
      <TrackContextProvider>
        <SkillTooltipContent skill={skill} />
      </TrackContextProvider>
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

  test('renders the sub-category name from the summary', () => {
    const skill = new SkillSummary()
      .skill('React Testing Library')
      .subCategoryName('Testing')
      .mock();
    const screen = renderTooltip(skill);

    expect(screen.getByText('Testing')).toBeVisible();
  });

  test('renders a total years figure that matches the sum of the per-company breakdown', () => {
    const companyYears = [
      { name: 'Acme', years: 2 },
      { name: 'Globex', years: 1.5 },
    ];
    const total = companyYears.reduce((sum, company) => sum + company.years, 0);
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
    test('links to the Resume page with this skill and the active track', () => {
      const skill = new SkillSummary().skill('React').mock();
      const screen = renderTooltip(skill);

      expect(screen.getByRole('link', { name: 'View on Resume' })).toHaveAttribute(
        'href',
        '/?skill=React&track=general'
      );
    });

    test('URL-encodes a skill name containing a space', () => {
      const skill = new SkillSummary().skill('Team Leadership').mock();
      const screen = renderTooltip(skill);

      expect(screen.getByRole('link', { name: 'View on Resume' })).toHaveAttribute(
        'href',
        '/?skill=Team%20Leadership&track=general'
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
        '/?recommendation=rec-1&track=general'
      );
    });

    test('shows a plural count linking to the first recommendation', () => {
      const skill = new SkillSummary().recommendationIds(['rec-1', 'rec-2']).mock();
      const screen = renderTooltip(skill);

      expect(screen.getByRole('link', { name: '2 recommendations' })).toHaveAttribute(
        'href',
        '/?recommendation=rec-1&track=general'
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
