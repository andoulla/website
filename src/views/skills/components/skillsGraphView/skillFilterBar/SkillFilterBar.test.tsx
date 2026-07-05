import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import type { SkillCategory } from '@/utils/skillColour';

import { SkillFilterBar } from './SkillFilterBar';

const CATEGORIES: SkillCategory[] = ['engineering', 'managerial'];

describe('SkillFilterBar', () => {
  test('renders All button and one button per category', () => {
    const screen = render(
      <SkillFilterBar categories={CATEGORIES} activeFilter="all" onChange={jest.fn()} />
    );

    expect(screen.getByRole('button', { name: 'All' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Engineering' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Managerial' })).toBeVisible();
  });

  test('calls onChange with the selected category when a category button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const screen = render(
      <SkillFilterBar categories={CATEGORIES} activeFilter="all" onChange={onChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Engineering' }));
    expect(onChange).toHaveBeenCalledWith('engineering');
  });

  test('calls onChange with all when the All button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const screen = render(
      <SkillFilterBar categories={CATEGORIES} activeFilter="engineering" onChange={onChange} />
    );

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(onChange).toHaveBeenCalledWith('all');
  });

  test('does not call onChange when clicking the already-active button', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const screen = render(
      <SkillFilterBar categories={CATEGORIES} activeFilter="all" onChange={onChange} />
    );

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  test('has no axe violations', async () => {
    const screen = render(
      <SkillFilterBar categories={CATEGORIES} activeFilter="all" onChange={jest.fn()} />
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
