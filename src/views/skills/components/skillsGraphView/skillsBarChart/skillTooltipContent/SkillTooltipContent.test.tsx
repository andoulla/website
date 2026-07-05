import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary } from '@/testing';

import { SkillTooltipContent } from './SkillTooltipContent';

describe('SkillTooltipContent', () => {
  test('renders plural "years" for counts greater than 1', () => {
    const skill = new SkillSummary().skill('TypeScript').years(4).mock();
    const screen = render(<SkillTooltipContent skill={skill} />);

    expect(screen.getByText('4 years')).toBeVisible();
  });

  test('renders singular "year" when years is exactly 1', () => {
    const skill = new SkillSummary().skill('TypeScript').years(1).mock();
    const screen = render(<SkillTooltipContent skill={skill} />);

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
    const screen = render(<SkillTooltipContent skill={skill} />);

    expect(screen.getByText('TypeScript')).toBeVisible();
    expect(screen.getByText('Acme · 2 years')).toBeVisible();
    expect(screen.getByText('Globex · 1 year')).toBeVisible();
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
    const screen = render(<SkillTooltipContent skill={skill} />);

    expect(screen.getByText(`${total} years`)).toBeVisible();
  });

  test('has no axe violations', async () => {
    const skill = new SkillSummary().skill('TypeScript').years(3).mock();
    const screen = render(<SkillTooltipContent skill={skill} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with no companies', async () => {
    const skill = new SkillSummary().skill('TypeScript').years(1).companyYears([]).mock();
    const screen = render(<SkillTooltipContent skill={skill} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
