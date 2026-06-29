import { fireEvent, render } from '@testing-library/react';

import { ThemeContextProvider, useThemeContext } from './ThemeContextProvider';

function ThemeDisplay() {
  const { themeName, toggleTheme } = useThemeContext();
  return (
    <>
      <span>{themeName}</span>
      <button onClick={toggleTheme}>toggle</button>
    </>
  );
}

describe('ThemeContextProvider', () => {
  test('provides green theme by default', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    expect(screen.getByText('green')).toBeVisible();
  });

  test('toggles to purple on first click', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getByText('purple')).toBeVisible();
  });

  test('toggles back to green on second click', () => {
    const screen = render(
      <ThemeContextProvider>
        <ThemeDisplay />
      </ThemeContextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getByText('green')).toBeVisible();
  });
});
