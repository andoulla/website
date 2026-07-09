import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { alpha, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';

import { SkillSummary } from '@/testing';

import { SkillItemsList } from './SkillItemsList';

const SKILLS = [
  new SkillSummary().skill('React').years(4).mock(),
  new SkillSummary().skill('Docker').years(1).mock(),
];

const theme = createTheme();

const renderSkillItemsList = (props: Parameters<typeof SkillItemsList>[0]) =>
  render(
    <MemoryRouter>
      <SkillItemsList {...props} />
    </MemoryRouter>
  );

describe('SkillItemsList', () => {
  test('renders each skill with its estimated years', async () => {
    const screen = renderSkillItemsList({ skills: SKILLS });

    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('est. 4 years')).toBeVisible();
    expect(screen.getByText('Docker')).toBeVisible();
    expect(screen.getByText('est. 1 year')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('shows the company/year breakdown in a tooltip on hover', async () => {
    const user = userEvent.setup();
    const screen = renderSkillItemsList({ skills: SKILLS });

    await user.hover(screen.getByText('React'));

    expect(await screen.findByText('Acme Corp · 1 year')).toBeVisible();
  });

  test('shows the tooltip on keyboard focus, for parity with hover', async () => {
    const user = userEvent.setup();
    const screen = renderSkillItemsList({ skills: SKILLS });

    await user.tab();

    expect(await screen.findByText('Acme Corp · 1 year')).toBeVisible();
  });

  test('exposes the skill name and years as the accessible name for its button', async () => {
    const screen = renderSkillItemsList({ skills: SKILLS, highlightedSkills: ['React'] });

    expect(screen.getByRole('button', { name: 'React est. 4 years' })).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('applies a highlight background to the skill matching highlightedSkills', () => {
    const screen = renderSkillItemsList({ skills: SKILLS, highlightedSkills: ['React'] });

    expect(screen.getByRole('button', { name: 'React est. 4 years' })).toHaveStyle({
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    });
  });

  test('applies a highlight background to every skill matching multiple highlightedSkills', () => {
    const screen = renderSkillItemsList({
      skills: SKILLS,
      highlightedSkills: ['React', 'Docker'],
    });

    expect(screen.getByRole('button', { name: 'React est. 4 years' })).toHaveStyle({
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    });
    expect(screen.getByRole('button', { name: 'Docker est. 1 year' })).toHaveStyle({
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    });
  });
});
