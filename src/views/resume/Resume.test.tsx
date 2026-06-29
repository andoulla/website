import { act, render, screen } from '@testing-library/react';

import { ResumeDataProvider } from '../../context/resumeData';
import type { WorkExperienceWithReferences } from '../../utils/joinJobsWithReferences';

import { Resume } from './Resume';

// TODO: replace with test class
const testExperiences: WorkExperienceWithReferences[] = [
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
  references: [],
}));

function renderResume(loader: () => Promise<WorkExperienceWithReferences[]>) {
  return render(
    <ResumeDataProvider loader={loader}>
      <Resume />
    </ResumeDataProvider>
  );
}

describe('Resume', () => {
  test('shows the loading state until the data resolves', () => {
    // A promise that never settles keeps the component suspended on the fallback.
    renderResume(() => new Promise<WorkExperienceWithReferences[]>(() => undefined));

    expect(screen.getByRole('status', { name: 'Loading work experience' })).toBeVisible();
  });

  test('renders the name heading and every job once the data resolves', async () => {
    await act(async () => {
      renderResume(() => Promise.resolve(testExperiences));
      // Flush the resolved data promise + Suspense reveal within the act scope.
      await Promise.resolve();
    });

    expect(screen.getByRole('heading', { level: 1, name: 'Mariandi Stylianou' })).toBeVisible();
    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
    expect(screen.getByText('Brightleaf Software')).toBeVisible();
    expect(screen.getByText('Harborview Digital')).toBeVisible();
  });
});
