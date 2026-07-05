import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { SkillSummary } from '@/testing';

import { SkillTooltipContent } from './SkillTooltipContent';

describe('SkillTooltipContent', () => {
  test('renders plural "years" for counts greater than 1', () => {
    const skill = new SkillSummary().skill('TypeScript').years(4).mock();
    const screen = render(<SkillTooltipContent skill={skill} companyNames={['Acme']} />);

    expect(screen.getByText('4 years')).toBeVisible();
  });

  test('renders singular "year" when years is exactly 1', () => {
    const skill = new SkillSummary().skill('TypeScript').years(1).mock();
    const screen = render(<SkillTooltipContent skill={skill} companyNames={['Acme']} />);

    expect(screen.getByText('1 year')).toBeVisible();
  });

  test('renders skill name and company chips', () => {
    const skill = new SkillSummary().skill('TypeScript').years(3).mock();
    const screen = render(<SkillTooltipContent skill={skill} companyNames={['Acme', 'Globex']} />);

    expect(screen.getByText('TypeScript')).toBeVisible();
    expect(screen.getByText('Acme')).toBeVisible();
    expect(screen.getByText('Globex')).toBeVisible();
  });

  test('has no axe violations', async () => {
    const skill = new SkillSummary().skill('TypeScript').years(3).mock();
    const screen = render(<SkillTooltipContent skill={skill} companyNames={['Acme']} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with singular year', async () => {
    const skill = new SkillSummary().skill('TypeScript').years(1).mock();
    const screen = render(<SkillTooltipContent skill={skill} companyNames={[]} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
