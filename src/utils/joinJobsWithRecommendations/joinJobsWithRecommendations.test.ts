import type { Skill } from '../../data/skills.types';
import type { Recommendation, WorkExperience } from '../../types';

import { joinJobsWithRecommendations } from './joinJobsWithRecommendations';

function makeJob(overrides: Partial<WorkExperience> = {}): WorkExperience {
  return {
    id: 'job-1',
    companyName: 'Acme Corp',
    location: 'Remote',
    startDate: '2020-01-01',
    endDate: null,
    responsibilities: [],
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

function makeSkill(
  name: string,
  jobIds: string[],
  overrides: Partial<Omit<Skill, 'name' | 'jobIds'>> = {}
): Skill {
  return {
    name,
    category: 'engineering',
    type: 'tech',
    jobIds,
    recommendationIds: [],
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

    const result = joinJobsWithRecommendations(jobs, recommendations, []);

    expect(result).toHaveLength(1);
    expect(result[0].recommendations.map((r) => r.id)).toEqual(['rec-1', 'rec-2']);
  });

  it('returns an empty recommendations array when no recommendation matches', () => {
    const jobs = [makeJob({ id: 'job-3' })];
    const recommendations = [makeRecommendation({ jobId: 'job-1' })];

    const result = joinJobsWithRecommendations(jobs, recommendations, []);

    expect(result[0].recommendations).toEqual([]);
  });

  it('does not leak recommendations from one job onto another', () => {
    const jobs = [makeJob({ id: 'job-1' }), makeJob({ id: 'job-2' })];
    const recommendations = [makeRecommendation({ id: 'rec-1', jobId: 'job-1' })];

    const result = joinJobsWithRecommendations(jobs, recommendations, []);

    expect(result[0].recommendations.map((r) => r.id)).toEqual(['rec-1']);
    expect(result[1].recommendations).toEqual([]);
  });

  it('returns an empty array when there are no jobs', () => {
    expect(joinJobsWithRecommendations([], [makeRecommendation()], [])).toEqual([]);
  });

  it('populates techStack from skills with type "tech" matching the job ID', () => {
    const jobs = [makeJob({ id: 'job-1' })];
    const skills = [
      makeSkill('React', ['job-1'], { type: 'tech' }),
      makeSkill('TypeScript', ['job-1'], { type: 'tech' }),
      makeSkill('Jest', ['job-2'], { type: 'tech' }),
    ];

    const [result] = joinJobsWithRecommendations(jobs, [], skills);

    expect(result.techStack).toEqual(['React', 'TypeScript']);
  });

  it('populates skills from skills with type "skill" matching the job ID', () => {
    const jobs = [makeJob({ id: 'job-1' })];
    const skills = [
      makeSkill('Team Leadership', ['job-1'], { type: 'skill' }),
      makeSkill('Mentoring', ['job-2'], { type: 'skill' }),
    ];

    const [result] = joinJobsWithRecommendations(jobs, [], skills);

    expect(result.skills).toEqual(['Team Leadership']);
  });

  it('preserves all original job fields', () => {
    const job = makeJob({ companyName: 'Acme Corp' });

    const [result] = joinJobsWithRecommendations([job], [], []);

    expect(result).toMatchObject({ companyName: 'Acme Corp' });
  });
});
