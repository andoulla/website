import { Skill, TimelineEvent } from '@/testing';

import { deriveAllSkills } from './deriveAllSkills';

describe('deriveAllSkills', () => {
  test('collects skills and tech stack across events, deduped by id', () => {
    const react = new Skill().id('react').name('React').mock();
    const leadership = new Skill().id('team-leadership').name('Team Leadership').mock();

    const careerHistory = [
      new TimelineEvent().id('job-1').skills([leadership]).techStack([react]).mock(),
      // react reappears on a second job — kept once.
      new TimelineEvent().id('job-2').skills([]).techStack([react]).mock(),
    ];

    const result = deriveAllSkills(careerHistory);

    expect(result).toHaveLength(2);
    expect(result.map((skill) => skill.id).sort()).toEqual(['react', 'team-leadership']);
  });

  test('returns an empty array for career history with no skills', () => {
    const careerHistory = [new TimelineEvent().id('job-1').skills([]).techStack([]).mock()];

    expect(deriveAllSkills(careerHistory)).toEqual([]);
  });
});
