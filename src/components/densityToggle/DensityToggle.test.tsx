import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { ThemeContextProvider } from '@/context/theme';

import { DensityToggle } from './DensityToggle';

const renderToggle = () =>
  render(
    <ThemeContextProvider>
      <DensityToggle />
    </ThemeContextProvider>
  );

describe('DensityToggle', () => {
  test('renders a Compact switch checked by default, named with its current state', async () => {
    const screen = renderToggle();

    // MUI visually hides the switch input — assert visibility on the label instead.
    expect(screen.getByText('Compact')).toBeVisible();
    expect(screen.getByRole('switch', { name: 'Compact view: on' })).toBeChecked();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('unchecking the switch selects comfortable density and updates the accessible name', async () => {
    const user = userEvent.setup();
    const screen = renderToggle();

    await user.click(screen.getByRole('switch', { name: 'Compact view: on' }));

    expect(screen.getByRole('switch', { name: 'Compact view: off' })).not.toBeChecked();
  });

  test('toggling twice returns to compact density', async () => {
    const user = userEvent.setup();
    const screen = renderToggle();

    await user.click(screen.getByRole('switch', { name: 'Compact view: on' }));
    await user.click(screen.getByRole('switch', { name: 'Compact view: off' }));

    expect(screen.getByRole('switch', { name: 'Compact view: on' })).toBeChecked();
  });
});
