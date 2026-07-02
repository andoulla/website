import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

import type { WorkExperienceWithRecommendations } from '../../../../utils/joinJobsWithRecommendations';

import { WorkExperienceCard } from './WorkExperienceCard';

function makeExperience(
  overrides: Partial<WorkExperienceWithRecommendations> = {}
): WorkExperienceWithRecommendations {
  return {
    id: 'job-1',
    companyName: 'Nimbus Analytics',
    location: 'London, UK',
    startDate: '2022-04-01',
    endDate: null,
    responsibilities: ['Lead frontend architecture'],
    skills: ['React', 'TypeScript'],
    logo: '',
    experienceUrl: 'https://www.linkedin.com/in/example/details/experience/',
    recommendations: [],
    ...overrides,
  };
}

describe('WorkExperienceCard', () => {
  test('renders company details, responsibilities, and skills', () => {
    const screen = render(<WorkExperienceCard experience={makeExperience()} />);

    expect(screen.getByText('Nimbus Analytics')).toBeVisible();
    expect(screen.getByText('London, UK · Apr 2022 – Present')).toBeVisible();
    expect(screen.getByText('Lead frontend architecture')).toBeVisible();
    expect(screen.getByText('React')).toBeVisible();
    expect(screen.getByText('TypeScript')).toBeVisible();
  });

  test('places the company and its sections correctly in the heading hierarchy', () => {
    const screen = render(<WorkExperienceCard experience={makeExperience()} />);

    expect(screen.getByRole('heading', { level: 3, name: 'Nimbus Analytics' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 4, name: 'Responsibilities' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 4, name: 'Key Skills' })).toBeVisible();
  });

  test('renders the end month for a past role instead of "Present"', () => {
    const screen = render(
      <WorkExperienceCard experience={makeExperience({ endDate: '2023-09-30' })} />
    );
    expect(screen.getByText('London, UK · Apr 2022 – Sep 2023')).toBeVisible();
  });

  test('renders recommendations when present', () => {
    const screen = render(
      <WorkExperienceCard
        experience={makeExperience({
          recommendations: [
            {
              id: 'rec-1',
              jobId: 'job-1',
              authorInitials: 'P.S.',
              authorRole: { jobTitle: 'Engineering Manager', company: 'Nimbus Analytics' },
              text: 'Great work.',
              postedDate: '2023-06-12',
              recommendationUrl: 'https://www.linkedin.com/in/example/details/recommendations/',
            },
          ],
        })}
      />
    );

    expect(screen.getByText('Recommendations')).toBeVisible();
    expect(screen.getByText('P.S., Engineering Manager, Nimbus Analytics')).toBeVisible();
  });

  test('omits the Recommendations section when there are none', () => {
    const screen = render(
      <WorkExperienceCard experience={makeExperience({ recommendations: [] })} />
    );
    expect(screen.queryByText('Recommendations')).not.toBeInTheDocument();
  });

  test('has no axe violations without recommendations', async () => {
    const screen = render(<WorkExperienceCard experience={makeExperience()} />);
    expect(await axe(screen.container)).toHaveNoViolations();
  });

  test('has no axe violations with recommendations', async () => {
    const screen = render(
      <WorkExperienceCard
        experience={makeExperience({
          recommendations: [
            {
              id: 'rec-1',
              jobId: 'job-1',
              authorInitials: 'P.S.',
              authorRole: { jobTitle: 'Engineering Manager', company: 'Nimbus Analytics' },
              text: 'Great work.',
              postedDate: '2023-06-12',
              recommendationUrl: 'https://www.linkedin.com/in/example/details/recommendations/',
            },
          ],
        })}
      />
    );
    expect(await axe(screen.container)).toHaveNoViolations();
  });
});
