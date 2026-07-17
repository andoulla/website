import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    // Home route normalises to ?track=general; nav links carry it.
    const homeLink = screen.getByRole('link', { name: 'Home' });

    expect(homeLink).toBeVisible();
    expect(homeLink).toHaveAttribute('href', '/?track=general');

    const skillsLink = screen.getByRole('link', { name: 'Skills' });

    expect(skillsLink).toBeVisible();
    expect(skillsLink).toHaveAttribute('href', '/skills?track=general');

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
    expect(
      screen.getByText('Hit refresh to relaunch it — that usually does the trick.')
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeVisible();

    consoleErrorSpy.mockRestore();
  });

  test('reloads the page when the refresh button is clicked', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockLoadCareerHistory.mockRejectedValue(new Error('failed to load'));

    const user = userEvent.setup();
    const screen = await act(async () => {
      const result = render(<App />);

      await Promise.resolve();

      return result;
    });

    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    // location.reload is unforgeable in jsdom (not spyable); the attempted navigation surfaces
    // as jsdom's not-implemented error on the console instead.
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Not implemented: navigation (except hash changes)' })
    );

    consoleErrorSpy.mockRestore();
  });
});
