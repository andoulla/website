import { act, render } from '@testing-library/react';
import { axe } from 'jest-axe';

import App from './App';
import { TimelineEvent } from './testing';

// Stub the deferred loader so the home route renders its data instantly in tests.
// (ts-jest hoists jest.mock above the imports above.)
jest.mock('./utils/loadExperiences', () => ({
  loadExperiences: () =>
    Promise.resolve([
      new TimelineEvent()
        .id('job-1')
        .companyName('Nimbus Analytics')
        .startDate('2022-04-01')
        .mock(),
    ]),
}));

describe('App', () => {
  test('renders the nav bar and the resume on the home route', async () => {
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

    expect(screen.getByRole('heading', { name: 'Mariandi Stylianou' })).toBeVisible();
    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
  });

  test('has no axe violations on the home route', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = render(<App />);
      await Promise.resolve();
    });
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
