import { Skill, TimelineEvent } from '@/testing';

import { findMostRecentSkillMatchIndex } from './Resume.helpers';

const reactSkill = new Skill().id('react').name('React').mock();
const otherSkill = new Skill().id('vue').name('Vue').mock();

describe('findMostRecentSkillMatchIndex', () => {
  test('returns -1 when no event has the skill', () => {
    const events = [
      new TimelineEvent().startDate('2020-01-01').endDate('2021-01-01').skills([otherSkill]).mock(),
    ];

    expect(findMostRecentSkillMatchIndex(events, 'react')).toBe(-1);
  });

  test('picks the job with the later startDate when both are past jobs', () => {
    const events = [
      new TimelineEvent().startDate('2018-01-01').endDate('2020-01-01').skills([reactSkill]).mock(),
      new TimelineEvent().startDate('2021-01-01').endDate('2023-01-01').skills([reactSkill]).mock(),
    ];

    expect(findMostRecentSkillMatchIndex(events, 'react')).toBe(1);
  });

  test('picks the current job (endDate: null) over a past job regardless of array order', () => {
    const events = [
      new TimelineEvent().startDate('2023-01-01').endDate(null).skills([reactSkill]).mock(),
      new TimelineEvent().startDate('2021-01-01').endDate('2022-01-01').skills([reactSkill]).mock(),
    ];

    expect(findMostRecentSkillMatchIndex(events, 'react')).toBe(0);
  });

  test('picks the current job even when it appears after a past job in the array', () => {
    const events = [
      new TimelineEvent().startDate('2021-01-01').endDate('2022-01-01').skills([reactSkill]).mock(),
      new TimelineEvent().startDate('2023-01-01').endDate(null).skills([reactSkill]).mock(),
    ];

    expect(findMostRecentSkillMatchIndex(events, 'react')).toBe(1);
  });

  test('compares startDate when both matches default to endDate: null', () => {
    const events = [
      new TimelineEvent().startDate('2022-01-01').skills([reactSkill]).mock(),
      new TimelineEvent().startDate('2020-01-01').skills([reactSkill]).mock(),
    ];

    expect(findMostRecentSkillMatchIndex(events, 'react')).toBe(0);
  });
});
