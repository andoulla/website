import { Recommendation, Skill, TimelineEvent } from '@/testing';

import { joinJobsWithRecommendations } from './joinJobsWithRecommendations';

describe('joinJobsWithRecommendations', () => {
  it('attaches matching recommendations to their job, in original order', () => {
    const jobs = [new TimelineEvent().mock()];
    const recommendations = [new Recommendation().mock(), new Recommendation().id('rec-2').mock()];

    const result = joinJobsWithRecommendations(jobs, recommendations, []);

    expect(result).toHaveLength(1);
    expect(result[0].recommendations.map((r) => r.id)).toEqual(['rec-1', 'rec-2']);
  });

  it('returns an empty recommendations array when no recommendation matches', () => {
    const jobs = [new TimelineEvent().id('job-3').mock()];
    const recommendations = [new Recommendation().mock()];

    const result = joinJobsWithRecommendations(jobs, recommendations, []);

    expect(result[0].recommendations).toEqual([]);
  });

  it('does not leak recommendations from one job onto another', () => {
    const jobs = [new TimelineEvent().mock(), new TimelineEvent().id('job-2').mock()];
    const recommendations = [new Recommendation().mock()];

    const result = joinJobsWithRecommendations(jobs, recommendations, []);

    expect(result[0].recommendations.map((r) => r.id)).toEqual(['rec-1']);
    expect(result[1].recommendations).toEqual([]);
  });

  it('returns an empty array when there are no jobs', () => {
    expect(joinJobsWithRecommendations([], [new Recommendation().mock()], [])).toEqual([]);
  });

  it('populates techStack from skills with type "tech" matching the job ID', () => {
    const jobs = [new TimelineEvent().mock()];
    const skills = [
      new Skill().name('React').mock(),
      new Skill().name('TypeScript').mock(),
      new Skill().name('Jest').jobIds(['job-2']).mock(),
    ];

    const [result] = joinJobsWithRecommendations(jobs, [], skills);

    expect(result.techStack).toEqual(['React', 'TypeScript']);
  });

  it('populates skills from skills with type "skill" matching the job ID', () => {
    const jobs = [new TimelineEvent().mock()];
    const skills = [
      new Skill().name('Team Leadership').type('skill').mock(),
      new Skill().name('Mentoring').type('skill').jobIds(['job-2']).mock(),
    ];

    const [result] = joinJobsWithRecommendations(jobs, [], skills);

    expect(result.skills).toEqual(['Team Leadership']);
  });

  it('preserves all original job fields', () => {
    const job = new TimelineEvent().companyName('Acme Corp').mock();

    const [result] = joinJobsWithRecommendations([job], [], []);

    expect(result).toMatchObject({ companyName: 'Acme Corp' });
  });
});
