import { Responsibility, Skill, TimelineEvent, Track } from '@/testing';

import { filterEventsByTrack } from './filterEventsByTrack';

const track = new Track()
  .id('lead')
  .label('Lead / Engineering Manager')
  .categories([
    {
      id: 'leadership',
      name: 'Leadership',
      subCategories: [{ id: 'people', name: 'People', skillIds: ['team-leadership', 'mentoring'] }],
    },
  ])
  .mock();

describe('filterEventsByTrack', () => {
  test('keeps only responsibilities, skills, and tech stack that intersect the track', () => {
    const events = [
      new TimelineEvent()
        .id('job-1')
        .responsibilities([
          new Responsibility().id('job-1-r01').skillIds(['team-leadership']).mock(),
          new Responsibility().id('job-1-r02').skillIds(['react']).mock(),
        ])
        .skills([
          new Skill().id('team-leadership').name('Team Leadership').mock(),
          new Skill().id('react').name('React').mock(),
        ])
        .techStack([new Skill().id('react').name('React').mock()])
        .mock(),
    ];

    const [filtered] = filterEventsByTrack(events, track);

    expect(filtered.responsibilities.map((responsibility) => responsibility.id)).toEqual([
      'job-1-r01',
    ]);
    expect(filtered.skills.map((skill) => skill.id)).toEqual(['team-leadership']);
    expect(filtered.techStack).toEqual([]);
  });

  test('keeps responsibilities with no skill ids in every track', () => {
    const events = [
      new TimelineEvent()
        .id('education-1')
        .responsibilities([new Responsibility().id('education-1-r01').skillIds([]).mock()])
        .skills([])
        .techStack([])
        .mock(),
    ];

    const [filtered] = filterEventsByTrack(events, track);

    expect(filtered.responsibilities.map((responsibility) => responsibility.id)).toEqual([
      'education-1-r01',
    ]);
  });

  test('keeps every event even when nothing in it matches the track', () => {
    const events = [
      new TimelineEvent()
        .id('job-1')
        .responsibilities([new Responsibility().id('job-1-r01').skillIds(['react']).mock()])
        .skills([new Skill().id('react').name('React').mock()])
        .techStack([new Skill().id('react').name('React').mock()])
        .mock(),
    ];

    const filtered = filterEventsByTrack(events, track);

    expect(filtered.map((event) => event.id)).toEqual(['job-1']);
    expect(filtered[0].responsibilities).toEqual([]);
    expect(filtered[0].skills).toEqual([]);
    expect(filtered[0].techStack).toEqual([]);
  });

  test('is an identity transform when the track covers every referenced skill', () => {
    const events = [
      new TimelineEvent()
        .id('job-1')
        .responsibilities([
          new Responsibility().id('job-1-r01').skillIds(['team-leadership']).mock(),
        ])
        .skills([new Skill().id('mentoring').name('Mentoring').mock()])
        .techStack([])
        .mock(),
    ];

    const [filtered] = filterEventsByTrack(events, track);

    expect(filtered.responsibilities).toEqual(events[0].responsibilities);
    expect(filtered.skills).toEqual(events[0].skills);
  });
});
