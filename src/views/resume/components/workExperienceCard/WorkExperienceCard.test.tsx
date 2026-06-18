import { render, screen } from '@testing-library/react';

import type { WorkExperienceWithReferences } from '../../../../utils/joinJobsWithReferences';

import { WorkExperienceCard } from './WorkExperienceCard';

function makeExperience(
  overrides: Partial<WorkExperienceWithReferences> = {}
): WorkExperienceWithReferences {
  return {
    id: 'job-1',
    companyName: 'Nimbus Analytics',
    location: 'London, UK',
    startDate: '2022-04-01',
    endDate: null,
    responsibilities: ['Lead frontend architecture'],
    skills: ['React', 'TypeScript'],
    references: [],
    ...overrides,
  };
}

describe('WorkExperienceCard', () => {
  test('renders company details, responsibilities, and skills', () => {
    render(<WorkExperienceCard experience={makeExperience()} />);

    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
    expect(screen.getByText('London, UK · Apr 2022 – Present')).toBeVisible();
    expect(screen.getByText('Lead frontend architecture')).toBeVisible();
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('TypeScript')).toBeVisible();
  });

  test('renders the end month for a past role instead of "Present"', () => {
    render(<WorkExperienceCard experience={makeExperience({ endDate: '2023-09-30' })} />);
    expect(screen.getByText('London, UK · Apr 2022 – Sep 2023')).toBeVisible();
  });

  test('renders references when present', () => {
    render(
      <WorkExperienceCard
        experience={makeExperience({
          references: [
            {
              id: 'ref-1',
              jobId: 'job-1',
              authorName: 'Priya Shah',
              authorRole: 'Engineering Manager',
              quote: 'Great work.',
            },
          ],
        })}
      />
    );

    expect(screen.getByText('References')).toBeVisible();
    expect(screen.getByText('Priya Shah, Engineering Manager')).toBeVisible();
  });

  test('omits the References section when there are none', () => {
    render(<WorkExperienceCard experience={makeExperience({ references: [] })} />);
    expect(screen.queryByText('References')).not.toBeInTheDocument();
  });
});
