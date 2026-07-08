import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { CategoryLegend } from './CategoryLegend';

describe('CategoryLegend', () => {
  test('renders one label per category passed in', async () => {
    const screen = render(<CategoryLegend categories={['engineering', 'managerial']} />);

    expect(screen.getByText('Engineering')).toBeVisible();
    expect(screen.getByText('Managerial')).toBeVisible();
    expect(screen.queryByText('Soft Skills')).not.toBeInTheDocument();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders nothing when no categories are passed', () => {
    const screen = render(<CategoryLegend categories={[]} />);

    expect(screen.container).toBeEmptyDOMElement();
  });
});
