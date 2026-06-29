import { fireEvent, render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { ThemeContextProvider } from '../../context/theme';

import { NavBar } from './NavBar';

function renderNavBar() {
  return render(
    <ThemeContextProvider>
      <NavBar />
    </ThemeContextProvider>,
    { wrapper: MemoryRouter }
  );
}

describe('NavBar', () => {
  test('renders Home and Skills links inside a navigation landmark', () => {
    const screen = renderNavBar();

    expect(screen.getByRole('navigation')).toBeVisible();

    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toBeVisible();
    expect(homeLink).toHaveAttribute('href', '/');

    const skillsLink = screen.getByRole('link', { name: 'Skills' });
    expect(skillsLink).toBeVisible();
    expect(skillsLink).toHaveAttribute('href', '/skills');
  });

  test('renders a theme toggle button defaulting to green', () => {
    const screen = renderNavBar();

    expect(screen.getByRole('button', { name: 'Switch to purple theme' })).toBeVisible();
  });

  test('toggle button label updates to green after switching to purple', () => {
    const screen = renderNavBar();

    fireEvent.click(screen.getByRole('button', { name: 'Switch to purple theme' }));

    expect(screen.getByRole('button', { name: 'Switch to green theme' })).toBeVisible();
  });

  test('toggle button cycles back to purple after two clicks', () => {
    const screen = renderNavBar();

    fireEvent.click(screen.getByRole('button', { name: 'Switch to purple theme' }));
    fireEvent.click(screen.getByRole('button', { name: 'Switch to green theme' }));

    expect(screen.getByRole('button', { name: 'Switch to purple theme' })).toBeVisible();
  });

  test('has no axe violations with green theme', async () => {
    const screen = renderNavBar();
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with purple theme', async () => {
    const screen = renderNavBar();
    fireEvent.click(screen.getByRole('button', { name: 'Switch to purple theme' }));
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
