import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { CategoryLegend } from './CategoryLegend';

describe('CategoryLegend', () => {
  test('renders one label per category passed in', async () => {
    const screen = render(
      <CategoryLegend
        categories={[
          { id: 'frontend-development', name: 'Frontend Development', index: 0, colour: 'teal' },
          { id: 'leadership', name: 'Leadership', index: 1, colour: 'green' },
        ]}
      />
    );

    expect(screen.getByText('Frontend Development')).toBeVisible();
    expect(screen.getByText('Leadership')).toBeVisible();
    expect(screen.queryByText('Tooling')).not.toBeInTheDocument();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders nothing when no categories are passed', () => {
    const screen = render(<CategoryLegend categories={[]} />);

    expect(screen.container).toBeEmptyDOMElement();
  });
});
