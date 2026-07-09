import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { ThemeContextProvider } from '@/context/theme';

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
  describe('navigation links', () => {
    test('renders Home, Skills, and Articles links inside a navigation landmark', () => {
      const screen = renderNavBar();

      expect(screen.getByRole('navigation')).toBeVisible();

      const homeLink = screen.getByRole('link', { name: 'Home' });

      expect(homeLink).toBeVisible();
      expect(homeLink).toHaveAttribute('href', '/');

      const skillsLink = screen.getByRole('link', { name: 'Skills' });

      expect(skillsLink).toBeVisible();
      expect(skillsLink).toHaveAttribute('href', '/skills');

      const articlesLink = screen.getByRole('link', { name: 'Articles' });

      expect(articlesLink).toBeVisible();
      expect(articlesLink).toHaveAttribute('href', '/articles');
    });
  });

  describe('theme toggle', () => {
    test('renders a theme toggle button defaulting to purple', async () => {
      const screen = renderNavBar();

      expect(screen.getByRole('button', { name: 'Switch to green theme' })).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('toggle button label updates to purple after switching to green', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Switch to green theme' }));

      expect(screen.getByRole('button', { name: 'Switch to purple theme' })).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('toggle button cycles back to green after two clicks', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Switch to green theme' }));
      await user.click(screen.getByRole('button', { name: 'Switch to purple theme' }));

      expect(screen.getByRole('button', { name: 'Switch to green theme' })).toBeVisible();
    });
  });

  describe('mode toggle', () => {
    test('renders Light and Dark buttons with Light selected by default', () => {
      const screen = renderNavBar();

      expect(screen.getByRole('button', { name: 'Light' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Dark' })).toBeVisible();
      expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'false');
    });

    test('clicking Dark selects dark mode', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Dark' }));

      expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('clicking Light after Dark returns to light mode', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Dark' }));
      await user.click(screen.getByRole('button', { name: 'Light' }));

      expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'true');
    });

    test('has no axe violations with purple and dark theme combined', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Dark' }));

      expect(await axe(screen.container)).toHaveNoViolations();
    });
  });
});
