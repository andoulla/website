import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import { CategoryLegend } from './CategoryLegend';

const CATEGORIES = [
  { id: 'frontend-development', name: 'Frontend Development', index: 0, colour: 'teal' as const },
  { id: 'leadership', name: 'Leadership', index: 1, colour: 'green' as const },
];

describe('CategoryLegend', () => {
  test('renders one label per category passed in', async () => {
    const screen = render(<CategoryLegend categories={CATEGORIES} />);

    expect(screen.getByText('Frontend Development')).toBeVisible();
    expect(screen.getByText('Leadership')).toBeVisible();
    expect(screen.queryByText('Tooling')).not.toBeInTheDocument();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders nothing when no categories are passed', () => {
    const screen = render(<CategoryLegend categories={[]} />);

    expect(screen.container).toBeEmptyDOMElement();
  });

  test('calls getBackground with the resolved colour and category index for each entry', () => {
    const getBackground = jest.fn().mockReturnValue('url(#pattern)');

    render(<CategoryLegend categories={CATEGORIES} getBackground={getBackground} />);

    expect(getBackground).toHaveBeenCalledTimes(2);
    expect(getBackground).toHaveBeenNthCalledWith(1, expect.any(String), 0);
    expect(getBackground).toHaveBeenNthCalledWith(2, expect.any(String), 1);
  });

  test('does not call getBackground when it is not provided', () => {
    // Renders without error and does not throw when getBackground is absent.
    expect(() => render(<CategoryLegend categories={CATEGORIES} />)).not.toThrow();
  });

  describe('when onSelectCategory is provided', () => {
    test('renders entries as buttons and reports the tapped category', async () => {
      const user = userEvent.setup();
      const onSelectCategory = jest.fn();
      const screen = render(
        <CategoryLegend categories={CATEGORIES} onSelectCategory={onSelectCategory} />
      );

      await user.click(screen.getByRole('button', { name: 'Highlight Leadership' }));

      expect(onSelectCategory).toHaveBeenCalledWith('leadership');
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('marks the selected category as pressed and dims the others', () => {
      const screen = render(
        <CategoryLegend
          categories={CATEGORIES}
          selectedCategoryId="leadership"
          onSelectCategory={jest.fn()}
        />
      );

      const selected = screen.getByRole('button', { name: 'Highlight Leadership' });
      const other = screen.getByRole('button', { name: 'Highlight Frontend Development' });

      expect(selected).toHaveAttribute('aria-pressed', 'true');
      expect(other).toHaveAttribute('aria-pressed', 'false');
      expect(other).toHaveStyle({ opacity: '0.5' });
    });
  });
});
