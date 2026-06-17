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

test('renders company details, responsibilities, and skills', () => {
  render(<WorkExperienceCard experience={makeExperience()} />);

  expect(screen.getByText('Nimbus Analytics')).toBeInTheDocument();
  expect(screen.getByText(/London, UK/)).toBeInTheDocument();
  expect(screen.getByText('Lead frontend architecture')).toBeInTheDocument();
  expect(screen.getByText('React')).toBeInTheDocument();
  expect(screen.getByText('TypeScript')).toBeInTheDocument();
});

test('renders "Present" for a current role', () => {
  render(<WorkExperienceCard experience={makeExperience({ endDate: null })} />);
  expect(screen.getByText(/Present/)).toBeInTheDocument();
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

  expect(screen.getByText('References')).toBeInTheDocument();
  expect(screen.getByText('Priya Shah, Engineering Manager')).toBeInTheDocument();
});

test('omits the References section when there are none', () => {
  render(<WorkExperienceCard experience={makeExperience({ references: [] })} />);
  expect(screen.queryByText('References')).not.toBeInTheDocument();
});
