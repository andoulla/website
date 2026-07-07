import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import * as computeShadeColourModule from '@/utils/computeShadeColour';

import { Tag } from './Tag';

describe('Tag', () => {
  test('renders children as the tag label', () => {
    const screen = render(<Tag>React</Tag>);

    expect(screen.getByText('React')).toBeVisible();
  });

  test('has no axe violations with default colour', async () => {
    const screen = render(<Tag>React</Tag>);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with a chip colour', async () => {
    const screen = render(<Tag colour="primary">React</Tag>);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders with a shade override when shadeIndex is provided', () => {
    const screen = render(
      <Tag colour="primary" shadeIndex={2}>
        React
      </Tag>
    );

    expect(screen.getByText('React')).toBeVisible();
  });

  test('has no axe violations with a shade override', async () => {
    const screen = render(
      <Tag colour="primary" shadeIndex={2}>
        React
      </Tag>
    );

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('calls onClick when the tag is clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const screen = render(<Tag onClick={onClick}>React</Tag>);

    await user.click(screen.getByText('React'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('takes the plain Chip fallback path when colour is "default", even with a shadeIndex set', () => {
    const computeShadeColourSpy = jest.spyOn(computeShadeColourModule, 'computeShadeColour');

    const screen = render(
      <Tag colour="default" shadeIndex={2}>
        React
      </Tag>
    );

    expect(screen.getByText('React')).toBeVisible();
    expect(computeShadeColourSpy).not.toHaveBeenCalled();

    computeShadeColourSpy.mockRestore();
  });
});
