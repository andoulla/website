import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { NotFound } from './NotFound';

describe('NotFound', () => {
  test('explains the page is missing and links back home', async () => {
    const screen = render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    expect(screen.getByText("This page doesn't exist.")).toBeVisible();
    expect(screen.getByRole('link', { name: 'Go to home' })).toHaveAttribute('href', '/');
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
