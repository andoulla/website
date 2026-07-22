import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TimeMachineSlider } from './TimeMachineSlider';

describe('TimeMachineSlider', () => {
  test('renders the caption and an accessible slider, hiding "Present" below the max year', () => {
    const screen = render(
      <TimeMachineSlider year={2019} minYear={2015} maxYear={2026} onCommit={jest.fn()} />
    );
    const slider = screen.getByRole('slider', { name: 'Career year' });

    expect(screen.getByText('See skills as they stood at any point in time')).toBeVisible();
    expect(screen.getByText('2019')).toBeVisible();
    expect(slider).toHaveAttribute('aria-valuenow', '2019');
    expect(screen.queryByText('Present')).not.toBeInTheDocument();
  });

  test('shows "Present" at the max year', () => {
    const screen = render(
      <TimeMachineSlider year={2026} minYear={2015} maxYear={2026} onCommit={jest.fn()} />
    );

    expect(screen.getByText('Present')).toBeVisible();
  });

  test('commits the new year when the slider settles on a step', async () => {
    const user = userEvent.setup();
    const onCommit = jest.fn();
    const screen = render(
      <TimeMachineSlider year={2019} minYear={2015} maxYear={2026} onCommit={onCommit} />
    );
    const slider = screen.getByRole('slider', { name: 'Career year' });

    // Focus via act — a raw slider.focus() updates MUI's internal state outside React's batching.
    act(() => {
      slider.focus();
    });
    await user.keyboard('{ArrowRight}');

    expect(onCommit).toHaveBeenCalledWith(2020);
  });
});
