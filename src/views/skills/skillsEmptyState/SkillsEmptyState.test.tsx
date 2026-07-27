import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { SkillsEmptyState } from './SkillsEmptyState';

describe('SkillsEmptyState', () => {
  test('shows the header, instruction, and a Reset button', async () => {
    const user = userEvent.setup();
    const onClearFilters = jest.fn();
    const screen = render(<SkillsEmptyState onClearFilters={onClearFilters} />);

    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
    expect(
      screen.getByText('Try a different search term or remove the active filters.')
    ).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('overlays the message card on top of a skeleton child', () => {
    const screen = render(
      <SkillsEmptyState onClearFilters={jest.fn()}>
        <div data-testid="skeleton">skeleton</div>
      </SkillsEmptyState>
    );

    expect(screen.getByTestId('skeleton')).toBeVisible();
    expect(screen.getByText('No skills match the selected filter.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeVisible();
  });
});
