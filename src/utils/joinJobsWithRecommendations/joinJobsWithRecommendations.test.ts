import type { WorkExperience } from '../../data/jobs';
import type { Recommendation } from '../../data/recommendations';

import { joinJobsWithRecommendations } from './joinJobsWithRecommendations';

function makeJob(overrides: Partial<WorkExperience> = {}): WorkExperience {
  return {
    id: 'job-1',
    companyName: 'Acme Corp',
    location: 'Remote',
    startDate: '2020-01-01',
    endDate: null,
    responsibilities: [],
    skills: [],
    logo: '',
    experienceUrl: 'https://www.linkedin.com/in/example/details/experience/',
    ...overrides,
  };
}

function makeRecommendation(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    id: 'rec-1',
    jobId: 'job-1',
    authorInitials: 'J.D.',
    authorRole: { jobTitle: 'Manager', company: 'Acme Corp' },
    text: 'Great work.',
    postedDate: '2021-01-01',
    recommendationUrl: 'https://www.linkedin.com/in/example/details/recommendations/',
    ...overrides,
  };
}

describe('joinJobsWithRecommendations', () => {
  it('attaches matching recommendations to their job, in original order', () => {
    const jobs = [makeJob({ id: 'job-1' })];
    const recommendations = [
      makeRecommendation({ id: 'rec-1', jobId: 'job-1' }),
      makeRecommendation({ id: 'rec-2', jobId: 'job-1' }),
    ];

    const result = joinJobsWithRecommendations(jobs, recommendations);

    expect(result).toHaveLength(1);
    expect(result[0].recommendations.map((recommendation) => recommendation.id)).toEqual([
      'rec-1',
      'rec-2',
    ]);
  });

  it('returns an empty recommendations array when no recommendation matches', () => {
    const jobs = [makeJob({ id: 'job-3' })];
    const recommendations = [makeRecommendation({ jobId: 'job-1' })];

    const result = joinJobsWithRecommendations(jobs, recommendations);

    expect(result[0].recommendations).toEqual([]);
  });

  it('does not leak recommendations from one job onto another', () => {
    const jobs = [makeJob({ id: 'job-1' }), makeJob({ id: 'job-2' })];
    const recommendations = [makeRecommendation({ id: 'rec-1', jobId: 'job-1' })];

    const result = joinJobsWithRecommendations(jobs, recommendations);

    expect(result[0].recommendations.map((recommendation) => recommendation.id)).toEqual(['rec-1']);
    expect(result[1].recommendations).toEqual([]);
  });

  it('returns an empty array when there are no jobs', () => {
    expect(joinJobsWithRecommendations([], [makeRecommendation()])).toEqual([]);
  });

  it('preserves all original job fields', () => {
    const job = makeJob({ companyName: 'Acme Corp', skills: ['React'] });

    const [result] = joinJobsWithRecommendations([job], []);

    expect(result).toMatchObject({ companyName: 'Acme Corp', skills: ['React'] });
  });
});
