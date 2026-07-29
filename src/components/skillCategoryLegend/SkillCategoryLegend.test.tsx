import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { axe } from 'jest-axe';

import { createGreenTheme } from '@/themes/green';

import { SkillCategoryLegend } from './SkillCategoryLegend';

describe('SkillCategoryLegend', () => {
  const renderWithTheme = (component: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
    const theme = createGreenTheme(mode, 'comfortable');

    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('renders all 6 category legend items in light mode', () => {
    const screen = renderWithTheme(<SkillCategoryLegend />);

    expect(screen.getByText('Leadership & Delivery')).toBeVisible();
    expect(screen.getByText('Engineering Practices & Quality')).toBeVisible();
    expect(screen.getByText('Frontend Development')).toBeVisible();
    expect(screen.getByText('Architecture & Design')).toBeVisible();
    expect(screen.getByText('Backend Development')).toBeVisible();
    expect(screen.getByText('Tools & Development Workflow')).toBeVisible();
  });

  test('renders colored dots for each category', () => {
    const screen = renderWithTheme(<SkillCategoryLegend />);

    const dots = screen.getAllByRole('presentation');

    expect(dots.length).toBeGreaterThanOrEqual(6);
  });

  test('applies theme primary colours to first three categories', () => {
    const screen = renderWithTheme(<SkillCategoryLegend />, 'light');
    const theme = createGreenTheme('light', 'comfortable');

    const leadershipItem = screen.getByText('Leadership & Delivery').closest('div');
    const leadershipDot = leadershipItem?.querySelector('[role="presentation"]');

    expect(leadershipDot).toHaveStyle(`background-color: ${theme.palette.primary.dark}`);
  });

  test('applies theme secondary colours to last three categories', () => {
    const screen = renderWithTheme(<SkillCategoryLegend />, 'light');
    const theme = createGreenTheme('light', 'comfortable');

    const architectureItem = screen.getByText('Architecture & Design').closest('div');
    const architectureDot = architectureItem?.querySelector('[role="presentation"]');

    expect(architectureDot).toHaveStyle(`background-color: ${theme.palette.secondary.dark}`);
  });

  test('maintains contrast in dark mode', () => {
    const screen = renderWithTheme(<SkillCategoryLegend />, 'dark');

    expect(screen.getByText('Leadership & Delivery')).toBeVisible();
    expect(screen.getByText('Backend Development')).toBeVisible();
  });

  test('has no accessibility violations in light mode', async () => {
    const screen = renderWithTheme(<SkillCategoryLegend />);

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no accessibility violations in dark mode', async () => {
    const screen = renderWithTheme(<SkillCategoryLegend />, 'dark');

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
