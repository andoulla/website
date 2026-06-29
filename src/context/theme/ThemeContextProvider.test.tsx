import { fireEvent, render } from '@testing-library/react';

import { ThemeContextProvider, useThemeContext } from './ThemeContextProvider';

function ThemeDisplay() {
  const { themeName, toggleTheme, isDarkMode, toggleDarkMode } = useThemeContext();
  return (
    <>
      <span>{themeName}</span>
      <span>{isDarkMode ? 'dark' : 'light'}</span>
      <button onClick={toggleTheme}>toggle theme</button>
      <button onClick={toggleDarkMode}>toggle dark mode</button>
    </>
  );
}

describe('ThemeContextProvider', () => {
  test('provides green theme in light mode by default', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    expect(screen.getByText('green')).toBeVisible();
    expect(screen.getByText('light')).toBeVisible();
  });

  test('toggles theme to purple on first click', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle theme' }));

    expect(screen.getByText('purple')).toBeVisible();
  });

  test('toggles theme back to green on second click', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle theme' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle theme' }));

    expect(screen.getByText('green')).toBeVisible();
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
});
