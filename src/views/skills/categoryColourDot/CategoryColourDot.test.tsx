import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { CategoryColourDot } from './CategoryColourDot';

describe('CategoryColourDot', () => {
  test('renders a circle with the given colour by default', async () => {
    const screen = render(<CategoryColourDot colour="rgb(1, 2, 3)" />);

    expect(screen.container.firstChild).toHaveStyle({
      backgroundColor: 'rgb(1, 2, 3)',
      borderRadius: '50%',
    });
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders a square when shape is "square"', async () => {
    const screen = render(<CategoryColourDot shape="square" colour="rgb(1, 2, 3)" />);

    expect(screen.container.firstChild).toHaveStyle({ borderRadius: '2px' });
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('uses the background prop over colour when both are given', async () => {
    const screen = render(
      <CategoryColourDot
        colour="rgb(1, 2, 3)"
        background="repeating-linear-gradient(45deg, red, blue)"
      />
    );

    expect(screen.container.firstChild).toHaveStyle({
      background: 'repeating-linear-gradient(45deg, red, blue)',
    });
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
