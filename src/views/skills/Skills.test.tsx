import { act, render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { ResumeDataProvider } from '@/context/resumeData';
import { TimelineEvent } from '@/testing';

import { Skills } from './Skills';

const EXPERIENCES = [
  new TimelineEvent()
    .id('atom-learning-2021-01')
    .companyName('Acme')
    .startDate('2024-01-01')
    .endDate('2026-07-02')
    .mock(),
];

const neverResolve = () => new Promise<typeof EXPERIENCES>(() => undefined);

function renderWithProvider(loader = () => Promise.resolve(EXPERIENCES)) {
  return render(
    <MemoryRouter>
      <ResumeDataProvider loader={loader}>
        <Skills />
      </ResumeDataProvider>
    </MemoryRouter>
  );
}

describe('Skills', () => {
  test('renders the page heading', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Skills' })).toBeVisible();
  });

  test('renders skill list items after data loads', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });
    expect(screen.getByText('Team Leadership')).toBeVisible();
  });

  test('renders the List/Graph toggle after data loads', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider();
      await Promise.resolve();
    });
    expect(screen.getByRole('button', { name: 'List view' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Graph view' })).toBeVisible();
  });

  test('has no axe violations on initial render', async () => {
    let screen!: ReturnType<typeof render>;

    await act(async () => {
      screen = renderWithProvider(neverResolve);
      await Promise.resolve();
    });

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
