import { act, render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';

import { ResumeDataProvider } from '../../context/resumeData';
import { WorkExperience } from '../../testing';

import { Skills } from './Skills';

const EXPERIENCES = [
  new WorkExperience()
    .id('atom-learning-2021-01')
    .companyName('Acme')
    .startDate('2024-01-01')
    .endDate('2026-07-02')
    .mock(),
];

function renderWithProvider() {
  return render(
    <MemoryRouter>
      <ResumeDataProvider loader={() => Promise.resolve(EXPERIENCES)}>
        <Skills />
      </ResumeDataProvider>
    </MemoryRouter>
  );
}

describe('Skills', () => {
  test('renders the page heading', () => {
    const screen = renderWithProvider();

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
    const screen = renderWithProvider();

    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
