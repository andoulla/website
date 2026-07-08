import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { alpha, createTheme } from '@mui/material/styles';

import { SkillSummary } from '@/testing';

import { SkillItemsList } from './SkillItemsList';

const SKILLS = [
  new SkillSummary().skill('React').years(4).mock(),
  new SkillSummary().skill('Docker').years(1).mock(),
];

const theme = createTheme();

describe('SkillItemsList', () => {
  test('renders each skill with its estimated years', async () => {
    const screen = render(<SkillItemsList skills={SKILLS} onItemClick={jest.fn()} />);

    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('est. 4 years')).toBeVisible();
    expect(screen.getByText('Docker')).toBeVisible();
    expect(screen.getByText('est. 1 year')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('shows the company/year breakdown in a tooltip on hover', async () => {
    const user = userEvent.setup();
    const screen = render(<SkillItemsList skills={SKILLS} onItemClick={jest.fn()} />);

    await user.hover(screen.getByText('React'));

    expect(await screen.findByText('Acme Corp · 1 year')).toBeVisible();
  });

  test('calls onItemClick with the clicked button and skill', async () => {
    const user = userEvent.setup();
    const onItemClick = jest.fn();
    const screen = render(<SkillItemsList skills={SKILLS} onItemClick={onItemClick} />);

    await user.click(screen.getByText('React'));

    expect(onItemClick).toHaveBeenCalledWith(expect.any(HTMLElement), SKILLS[0]);
  });

  test('exposes the skill name and years as the accessible name for its button', async () => {
    const screen = render(
      <SkillItemsList skills={SKILLS} highlightedSkill="React" onItemClick={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'React est. 4 years' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('applies a highlight background to the skill matching highlightedSkill', () => {
    const screen = render(
      <SkillItemsList skills={SKILLS} highlightedSkill="React" onItemClick={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'React est. 4 years' })).toHaveStyle({
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    });
  });
});
