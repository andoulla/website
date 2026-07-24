import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeContextProvider, useThemeContext } from './ThemeContextProvider';

function ThemeDisplay() {
  const { themeName, toggleTheme, isDarkMode, toggleDarkMode, density, toggleDensity } =
    useThemeContext();

  return (
    <>
      <span>{themeName}</span>
      <span>{isDarkMode ? 'dark' : 'light'}</span>
      <span>{density}</span>
      <button onClick={toggleTheme}>toggle theme</button>
      <button onClick={toggleDarkMode}>toggle dark mode</button>
      <button onClick={toggleDensity}>toggle density</button>
    </>
  );
}

describe('ThemeContextProvider', () => {
  test('provides purple theme in light mode with compact density by default', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    expect(screen.getByText('purple')).toBeVisible();
    expect(screen.getByText('light')).toBeVisible();
    expect(screen.getByText('compact')).toBeVisible();
  });

  test('toggles theme to green on first click', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle theme' }));

    expect(screen.getByText('green')).toBeVisible();
  });

  test('toggles theme back to purple on second click', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle theme' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle theme' }));

    expect(screen.getByText('purple')).toBeVisible();
  });

  test('toggles to dark mode', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle dark mode' }));

    expect(screen.getByText('dark')).toBeVisible();
  });

  test('toggles back to light mode on second click', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle dark mode' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle dark mode' }));

    expect(screen.getByText('light')).toBeVisible();
  });

  test('toggles density to comfortable on first click', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle density' }));

    expect(screen.getByText('comfortable')).toBeVisible();
  });

  test('toggles density back to compact on second click', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle density' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle density' }));

    expect(screen.getByText('compact')).toBeVisible();
  });

  test('honours initialTheme and initialDarkMode overrides on first render', () => {
    const screen = render(
      <ThemeContextProvider initialTheme="purple" initialDarkMode={true}>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    expect(screen.getByText('purple')).toBeVisible();
    expect(screen.getByText('dark')).toBeVisible();
  });

  test('restores the persisted theme, dark mode, and density', () => {
    window.localStorage.setItem('theme-name', 'green');
    window.localStorage.setItem('dark-mode', 'true');
    window.localStorage.setItem('density', 'comfortable');

    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    expect(screen.getByText('green')).toBeVisible();
    expect(screen.getByText('dark')).toBeVisible();
    expect(screen.getByText('comfortable')).toBeVisible();
  });

  test('persists toggled theme, dark mode, and density for the next mount', async () => {
    const user = userEvent.setup();
    const firstMount = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    await user.click(firstMount.getByRole('button', { name: 'toggle theme' }));
    await user.click(firstMount.getByRole('button', { name: 'toggle dark mode' }));
    await user.click(firstMount.getByRole('button', { name: 'toggle density' }));
    firstMount.unmount();

    const secondMount = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    expect(secondMount.getByText('green')).toBeVisible();
    expect(secondMount.getByText('dark')).toBeVisible();
    expect(secondMount.getByText('comfortable')).toBeVisible();
  });

  test('explicit props win over a persisted preference', () => {
    window.localStorage.setItem('theme-name', 'green');
    window.localStorage.setItem('dark-mode', 'true');
    window.localStorage.setItem('density', 'comfortable');

    const screen = render(
      <ThemeContextProvider initialTheme="purple" initialDarkMode={false} initialDensity="compact">
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    expect(screen.getByText('purple')).toBeVisible();
    expect(screen.getByText('light')).toBeVisible();
    expect(screen.getByText('compact')).toBeVisible();
  });
});
