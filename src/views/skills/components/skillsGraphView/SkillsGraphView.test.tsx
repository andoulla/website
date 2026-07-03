import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { SkillSummary, TimelineEvent } from '../../../../testing';

import { SkillsGraphView } from './SkillsGraphView';

const EXPERIENCE = new TimelineEvent()
  .companyName('Acme')
  .startDate('2022-01-01')
  .endDate('2024-01-01')
  .mock();

const SKILLS = [
  new SkillSummary().years(4).mock(),
  new SkillSummary()
    .skill('Team Leadership')
    .years(2)
    .category('managerial')
    .colour('secondary')
    .mock(),
];

describe('SkillsGraphView', () => {
  test('renders the All filter button', () => {
    const screen = render(<SkillsGraphView skills={SKILLS} experiences={[EXPERIENCE]} />);

    expect(screen.getByRole('button', { name: 'All' })).toBeVisible();
  });

  test('renders a filter button for each category present in skills', () => {
    const screen = render(<SkillsGraphView skills={SKILLS} experiences={[EXPERIENCE]} />);

    expect(screen.getByRole('button', { name: 'Engineering' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Managerial' })).toBeVisible();
  });

  test('does not render a filter button for categories absent from skills', () => {
    const screen = render(<SkillsGraphView skills={SKILLS} experiences={[EXPERIENCE]} />);

    expect(screen.queryByRole('button', { name: 'Soft Skills' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Other' })).not.toBeInTheDocument();
  });

  test('shows all skills in the accessible table by default', () => {
    const screen = render(<SkillsGraphView skills={SKILLS} experiences={[EXPERIENCE]} />);

    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('Team Leadership')).toBeVisible();
  });

  test('filtering to a category shows only matching skills', async () => {
    const user = userEvent.setup();
    const screen = render(<SkillsGraphView skills={SKILLS} experiences={[EXPERIENCE]} />);

    await user.click(screen.getByRole('button', { name: 'Engineering' }));
    // header row + 1 data row for the one engineering skill
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.queryByText('Team Leadership')).not.toBeInTheDocument();
  });

  test('shows the no-data Alert when skills array is empty', () => {
    const screen = render(<SkillsGraphView skills={[]} experiences={[]} />);

    expect(screen.getByRole('alert')).toBeVisible();
  });

  test('has no axe violations with data', async () => {
    const screen = render(<SkillsGraphView skills={SKILLS} experiences={[EXPERIENCE]} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with empty data', async () => {
    const screen = render(<SkillsGraphView skills={[]} experiences={[]} />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
