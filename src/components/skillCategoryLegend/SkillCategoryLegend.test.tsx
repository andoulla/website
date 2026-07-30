import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { axe } from 'jest-axe';

import { createGreenTheme } from '@/themes/green';

import { SkillCategoryLegend } from './SkillCategoryLegend';

describe('SkillCategoryLegend', () => {
  const renderWithTheme = (mode: 'light' | 'dark' = 'light') => {
    const theme = createGreenTheme(mode, 'comfortable');

    return render(
      <ThemeProvider theme={theme}>
        <SkillCategoryLegend />
      </ThemeProvider>
    );
  };

  test('renders all 6 categories with correct colours and no accessibility issues', async () => {
    const screen = renderWithTheme('light');
    const theme = createGreenTheme('light', 'comfortable');

    expect(screen.getByText('Leadership & Delivery')).toBeVisible();
    expect(screen.getByText('Engineering Practices & Quality')).toBeVisible();
    expect(screen.getByText('Frontend Development')).toBeVisible();
    expect(screen.getByText('Architecture & Design')).toBeVisible();
    expect(screen.getByText('Backend Development')).toBeVisible();
    expect(screen.getByText('Tools & Development Workflow')).toBeVisible();

    const leadershipDot = screen
      .getByText('Leadership & Delivery')
      .closest('div')
      ?.querySelector('[role="presentation"]');

    expect(leadershipDot).toHaveStyle(`background-color: ${theme.palette.primary.dark}`);

    const architectureDot = screen
      .getByText('Architecture & Design')
      .closest('div')
      ?.querySelector('[role="presentation"]');

    expect(architectureDot).toHaveStyle(`background-color: ${theme.palette.secondary.dark}`);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('maintains visibility and contrast in dark mode', async () => {
    const screen = renderWithTheme('dark');

    expect(screen.getByText('Leadership & Delivery')).toBeVisible();
    expect(screen.getByText('Backend Development')).toBeVisible();
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
