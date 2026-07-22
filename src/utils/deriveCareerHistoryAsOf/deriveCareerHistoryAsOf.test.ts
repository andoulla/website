import { Skill, TimelineEvent, Track } from '@/testing';

import { deriveCareerHistoryAsOf, deriveCareerYearRange } from './deriveCareerHistoryAsOf';

describe('deriveCareerHistoryAsOf', () => {
  test('drops not-yet-started events and clamps still-running endDates to the cutoff', () => {
    const cutoff = new Date('2020-12-31');
    const events = [
      // closed, ends before cutoff → kept, endDate untouched
      new TimelineEvent().id('before').startDate('2017-01-01').endDate('2019-06-01').mock(),
      // closed, ends after cutoff → kept, endDate clamped
      new TimelineEvent().id('straddle').startDate('2019-01-01').endDate('2022-01-01').mock(),
      // starts after cutoff → dropped
      new TimelineEvent().id('after').startDate('2021-05-01').endDate(null).mock(),
      // starts exactly on cutoff, open-ended → kept, endDate clamped
      new TimelineEvent().id('exact').startDate('2020-12-31').endDate('2021-01-01').mock(),
      // open-ended, started before → kept, endDate clamped
      new TimelineEvent().id('open').startDate('2018-01-01').endDate(null).mock(),
    ];

    const result = deriveCareerHistoryAsOf(events, cutoff).map((event) => ({
      id: event.id,
      endDate: event.endDate,
    }));

    expect(result).toEqual([
      { id: 'before', endDate: '2019-06-01' },
      { id: 'straddle', endDate: '2020-12-31' },
      { id: 'exact', endDate: '2020-12-31' },
      { id: 'open', endDate: '2020-12-31' },
    ]);
  });
});

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

    expect(range).toEqual({ minYear: 2015, maxYear: 2026 });
  });
});
