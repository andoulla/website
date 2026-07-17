import { Recommendation, Skill, TimelineEvent } from '@/testing';

import { joinCareerHistoryWithRecommendations } from './joinCareerHistoryWithRecommendations';

describe('joinCareerHistoryWithRecommendations', () => {
  it('attaches matching recommendations to their event, in original order', () => {
    const careerHistory = [new TimelineEvent().mock()];
    const recommendations = [new Recommendation().mock(), new Recommendation().id('rec-2').mock()];

    const result = joinCareerHistoryWithRecommendations(careerHistory, recommendations, []);

    expect(result).toHaveLength(1);
    expect(result[0].recommendations.map((r) => r.id)).toEqual(['rec-1', 'rec-2']);
  });

  it('returns an empty recommendations array when no recommendation matches', () => {
    const careerHistory = [new TimelineEvent().id('job-3').mock()];
    const recommendations = [new Recommendation().mock()];

    const result = joinCareerHistoryWithRecommendations(careerHistory, recommendations, []);

    expect(result[0].recommendations).toEqual([]);
  });

  it('does not leak recommendations from one event onto another', () => {
    const careerHistory = [new TimelineEvent().mock(), new TimelineEvent().id('job-2').mock()];
    const recommendations = [new Recommendation().mock()];

    const result = joinCareerHistoryWithRecommendations(careerHistory, recommendations, []);

    expect(result[0].recommendations.map((r) => r.id)).toEqual(['rec-1']);
    expect(result[1].recommendations).toEqual([]);
  });

  it('returns an empty array when there is no career history', () => {
    expect(joinCareerHistoryWithRecommendations([], [new Recommendation().mock()], [])).toEqual([]);
  });

  it('populates techStack and skills together, split by type, excluding unmatched job IDs', () => {
    const careerHistory = [new TimelineEvent().mock(), new TimelineEvent().id('job-2').mock()];
    const reactSkill = new Skill().id('react').name('React').type('tech').mock();
    const leadershipSkill = new Skill()
      .id('team-leadership')
      .name('Team Leadership')
      .type('skill')
      .mock();
    const jestSkill = new Skill().id('jest').name('Jest').type('tech').jobIds(['job-2']).mock();
    const skills = [reactSkill, leadershipSkill, jestSkill];

    const [result] = joinCareerHistoryWithRecommendations(careerHistory, [], skills);

    expect(result.techStack).toEqual([reactSkill]);
    expect(result.skills).toEqual([leadershipSkill]);
  });

  it('preserves all original event fields', () => {
    const event = new TimelineEvent().companyName('Acme Corp').mock();

    const [result] = joinCareerHistoryWithRecommendations([event], [], []);

    expect(result).toMatchObject({ companyName: 'Acme Corp' });
  });

  it('throws when a skill references an unknown jobId', () => {
    const careerHistory = [new TimelineEvent().mock()];
    const skill = new Skill().name('React').jobIds(['job-404']).mock();

    expect(() => joinCareerHistoryWithRecommendations(careerHistory, [], [skill])).toThrow(
      'skills.json: unknown jobId "job-404" on skill "React"'
    );
  });

  it('throws when a skill references an unknown recommendationId', () => {
    const careerHistory = [new TimelineEvent().mock()];
    const skill = new Skill().name('React').recommendationIds(['rec-404']).mock();

    expect(() => joinCareerHistoryWithRecommendations(careerHistory, [], [skill])).toThrow(
      'skills.json: unknown recommendationId "rec-404" on skill "React"'
    );
  });
});
