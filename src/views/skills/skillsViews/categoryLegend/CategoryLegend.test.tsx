import { render } from '@testing-library/react';
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
});
