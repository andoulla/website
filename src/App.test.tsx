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
        .companyName('Nimbus Analytics')
        .startDate('2022-04-01')
        .mock(),
    ]);

    // TODO: remove the usage of !
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(<App />);
      await Promise.resolve();
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
    expect(screen.getByText('Nimbus Analytics')).toBeVisible();

    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('renders a fallback with a refresh button when career data fails to load', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockLoadCareerHistory.mockRejectedValue(new Error('failed to load'));

    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(<App />);
      await Promise.resolve();
    });

    expect(screen.getByText('Whoops — my career history just rage-quit. Try again?')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh' })).toBeVisible();

    consoleErrorSpy.mockRestore();
  });
});
