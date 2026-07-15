import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { SkillsEmptyState } from './SkillsEmptyState';

describe('SkillsEmptyState', () => {
  test('shows the message and a Clear filters button when filters are active', async () => {
    const user = userEvent.setup();
    const onClearFilters = jest.fn();
    const screen = render(<SkillsEmptyState hasActiveFilters onClearFilters={onClearFilters} />);

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('hides the Clear filters button when no filters are active', async () => {
    const screen = render(<SkillsEmptyState hasActiveFilters={false} onClearFilters={jest.fn()} />);

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
