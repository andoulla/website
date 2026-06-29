import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { NavBar } from './NavBar';

describe('NavBar', () => {
  test('renders Home and Skills links inside a navigation landmark', () => {
    const screen = render(<NavBar />, { wrapper: MemoryRouter });

    expect(screen.getByRole('navigation')).toBeVisible();

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toBeVisible();
    expect(homeLink).toHaveAttribute('href', '/');

    const skillsLink = screen.getByRole('link', { name: 'Skills' });
    expect(skillsLink).toBeVisible();
    expect(skillsLink).toHaveAttribute('href', '/skills');
  });
});
