import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { Tag } from './Tag';

describe('Tag', () => {
  test('renders children as the tag label', () => {
    const screen = render(<Tag>React</Tag>);
    expect(screen.getByText('React')).toBeVisible();
  });

  test('has no axe violations with default color', async () => {
    const screen = render(<Tag>React</Tag>);
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with a chip color', async () => {
    const screen = render(<Tag color="primary">React</Tag>);
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders with a shade override when shadeIndex is provided', () => {
    const screen = render(
      <Tag color="primary" shadeIndex={2}>
        React
      </Tag>
    );
    expect(screen.getByText('React')).toBeVisible();
  });

  test('has no axe violations with a shade override', async () => {
    const screen = render(
      <Tag color="primary" shadeIndex={2}>
        React
      </Tag>
    );
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
