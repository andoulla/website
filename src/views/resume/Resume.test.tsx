import { act, render } from '@testing-library/react';
import { axe } from 'jest-axe';

import { ResumeDataProvider } from '../../context/resumeData';
import type { WorkExperienceWithRecommendations } from '../../utils/joinJobsWithRecommendations';

import { Resume } from './Resume';

// TODO: replace with test class
const testExperiences: WorkExperienceWithRecommendations[] = [
  'Nimbus Analytics',
  'Brightleaf Software',
  'Harborview Digital',
].map((companyName, index) => ({
  id: `job-${index + 1}`,
  companyName,
  location: 'Remote',
  startDate: '2022-04-01',
  endDate: null,
  responsibilities: [],
  skills: [],
  logo: '',
  experienceUrl: 'https://www.linkedin.com/in/example/details/experience/',
  recommendations: [],
}));

async function renderResume(loader: () => Promise<WorkExperienceWithRecommendations[]>) {
  let result!: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <ResumeDataProvider loader={loader}>
        <Resume />
      </ResumeDataProvider>
    );
    await Promise.resolve();
  });
  return result;
}

describe('Resume', () => {
  test('shows the loading state until the data resolves', async () => {
    // A promise that never settles keeps the component suspended on the fallback.
    const screen = await renderResume(
      () => new Promise<WorkExperienceWithRecommendations[]>(() => undefined)
    );

    expect(screen.getByRole('status', { name: 'Loading work experience' })).toBeVisible();
  });

  test('renders the name heading and every job once the data resolves', async () => {
    const screen = await renderResume(() => Promise.resolve(testExperiences));

    expect(screen.getByRole('heading', { level: 1, name: 'Mariandi Stylianou' })).toBeVisible();
    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
    expect(screen.getByText('Brightleaf Software')).toBeVisible();
    expect(screen.getByText('Harborview Digital')).toBeVisible();
  });

  test('has no axe violations in the loading state', async () => {
    const screen = await renderResume(
      () => new Promise<WorkExperienceWithRecommendations[]>(() => undefined)
    );
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations in the loaded state', async () => {
    const screen = await renderResume(() => Promise.resolve(testExperiences));
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
