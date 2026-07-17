import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { ThemeContextProvider } from '@/context/theme';

import { NavBar } from './NavBar';

function renderNavBar(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ThemeContextProvider>
        <NavBar />
      </ThemeContextProvider>
    </MemoryRouter>
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

    test('carries a valid track param on the Home and Skills links but not Articles', () => {
      const screen = renderNavBar('/?track=lead');

      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/?track=lead');
      expect(screen.getByRole('link', { name: 'Skills' })).toHaveAttribute(
        'href',
        '/skills?track=lead'
      );
      expect(screen.getByRole('link', { name: 'Articles' })).toHaveAttribute('href', '/articles');
    });

    test('drops an invalid track param from the links', () => {
      const screen = renderNavBar('/?track=astronaut');

      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: 'Skills' })).toHaveAttribute('href', '/skills');
    });
  });

  describe('theme toggle', () => {
    test('renders a theme toggle menu item defaulting to purple', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      expect(screen.getByRole('menuitem', { name: 'Switch to green theme' })).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('theme item label updates to purple after switching to green', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      await user.click(screen.getByRole('menuitem', { name: 'Switch to green theme' }));
      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      expect(screen.getByRole('menuitem', { name: 'Switch to purple theme' })).toBeVisible();
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('theme item cycles back to green after two clicks', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      await user.click(screen.getByRole('menuitem', { name: 'Switch to green theme' }));
      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      await user.click(screen.getByRole('menuitem', { name: 'Switch to purple theme' }));
      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      expect(screen.getByRole('menuitem', { name: 'Switch to green theme' })).toBeVisible();
    });
  });

  describe('mode toggle', () => {
    test('renders Light and Dark items with Light checked by default', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      expect(screen.getByRole('menuitemradio', { name: 'Light' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });

    test('clicking Dark checks dark mode', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }));
      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      expect(screen.getByRole('menuitemradio', { name: 'Dark' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      expect(screen.getByRole('menuitemradio', { name: 'Light' })).toHaveAttribute(
        'aria-checked',
        'false'
      );
      expect(await axe(screen.container)).toHaveNoViolations();
    });

    test('clicking Light after Dark returns to light mode', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }));
      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      await user.click(screen.getByRole('menuitemradio', { name: 'Light' }));
      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      expect(screen.getByRole('menuitemradio', { name: 'Light' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    test('has no axe violations with purple and dark mode combined', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));
      await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }));

      expect(await axe(screen.container)).toHaveNoViolations();
    });
  });

  describe('external links', () => {
    test('View Source link points to the repo and opens in a new tab', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      const link = screen.getByRole('menuitem', { name: 'View Source' });

      expect(link).toHaveAttribute('href', 'https://github.com/andoulla/website/');
      expect(link).toHaveAttribute('target', '_blank');
    });

    test('Report a Problem link points to the new-issue page and opens in a new tab', async () => {
      const user = userEvent.setup();
      const screen = renderNavBar();

      await user.click(screen.getByRole('button', { name: 'Open menu' }));

      const link = screen.getByRole('menuitem', { name: 'Report a Problem' });

      expect(link).toHaveAttribute('href', 'https://github.com/andoulla/website/issues/new');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});
