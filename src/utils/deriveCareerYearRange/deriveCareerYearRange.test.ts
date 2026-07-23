import { Skill, TimelineEvent, Track } from '@/testing';

import { deriveCareerYearRange } from './deriveCareerYearRange';

describe('deriveCareerYearRange', () => {
  test('spans the earliest track-relevant job to the current year, ignoring out-of-track events', () => {
    const track = new Track()
      .id('lead')
      .categories([
        {
          id: 'leadership',
          name: 'Leadership',
          subCategories: [{ id: 'people', name: 'People', skillIds: ['team-leadership'] }],
        },
      ])
      .mock();

    const allSkills = [
      new Skill().id('team-leadership').jobIds(['job-1', 'job-2']).mock(),
      new Skill().id('react').jobIds(['job-0']).mock(),
    ];

    const careerHistory = [
      // earliest overall, but only contributes an out-of-track skill → excluded from the range
      new TimelineEvent().id('job-0').startDate('2010-01-01').mock(),
      new TimelineEvent().id('job-1').startDate('2015-01-01').mock(),
      new TimelineEvent().id('job-2').startDate('2018-01-01').mock(),
    ];

    const range = deriveCareerYearRange(careerHistory, track, allSkills, new Date('2026-07-22'));

    // minYear from a Jan-1 startDate — pins UTC-safe year extraction, timezone-independent.
    expect(range).toEqual({ minYear: 2015, maxYear: 2026 });
  });
});
