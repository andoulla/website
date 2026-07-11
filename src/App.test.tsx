import { act, render } from '@testing-library/react';
import { axe } from 'jest-axe';

import App from './App';
import { TimelineEvent } from './testing';
import { loadCareerHistory } from './utils/loadCareerHistory';

jest.mock('./utils/loadCareerHistory');

const mockLoadCareerHistory = jest.mocked(loadCareerHistory);

describe('App', () => {
  test('renders the nav bar and the resume on the home route', async () => {
    mockLoadCareerHistory.mockResolvedValue([
      new TimelineEvent()
        .id('job-1')
        .companyName('Meridian Dynamics')
        .startDate('2022-04-01')
        .mock(),
    ]);

    const screen = await act(async () => {
      const result = render(<App />);

      await Promise.resolve();

      return result;
    });

    const homeLink = screen.getByRole('link', { name: 'Home' });

    expect(homeLink).toBeVisible();
    expect(homeLink).toHaveAttribute('href', '/');

    const skillsLink = screen.getByRole('link', { name: 'Skills' });

    expect(skillsLink).toBeVisible();
    expect(skillsLink).toHaveAttribute('href', '/skills');

    const articlesLink = screen.getByRole('link', { name: 'Articles' });

    expect(articlesLink).toBeVisible();
    expect(articlesLink).toHaveAttribute('href', '/articles');

    expect(screen.getByRole('heading', { name: 'Mariandi Stylianou' })).toBeVisible();
    expect(screen.getByText('Meridian Dynamics')).toBeVisible();

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders a fallback with a refresh button when career data fails to load', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockLoadCareerHistory.mockRejectedValue(new Error('failed to load'));

    const screen = await act(async () => {
      const result = render(<App />);

      await Promise.resolve();

      return result;
    });

    expect(screen.getByText('Whoops — my career history just rage-quit. Try again?')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeVisible();

    consoleErrorSpy.mockRestore();
  });
});
