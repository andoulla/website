import { SkillSummary, TimelineEvent } from '@/testing';

import { deriveSkillGrowth } from './deriveSkillGrowth';

const CAREER = [
  new TimelineEvent().id('a').type('work').companyName('Acme').startDate('2018-01-01').mock(),
  new TimelineEvent().id('b').type('work').companyName('Globex').startDate('2021-01-01').mock(),
  new TimelineEvent().id('edu').type('education').companyName('Uni').startDate('2016-01-01').mock(),
];

describe('deriveSkillGrowth', () => {
  test('accumulates unique skills by earliest year and marks non-education steps', () => {
    const skills = [
      new SkillSummary().id('s1').jobIds(['a']).mock(),
      new SkillSummary().id('s2').jobIds(['a', 'b']).mock(), // earliest is 2018
      new SkillSummary().id('s3').jobIds(['b']).mock(),
      new SkillSummary().id('s4').jobIds(['missing']).mock(), // no known job → excluded
    ];

    const { points, markers } = deriveSkillGrowth(CAREER, skills);

    expect(points).toEqual([
      { year: 2018, count: 2 },
      { year: 2021, count: 3 },
    ]);
    expect(markers).toEqual([
      { year: 2018, companyName: 'Acme' },
      { year: 2021, companyName: 'Globex' },
    ]);
  });

  test('returns no points when no skill maps to a known job', () => {
    const { points } = deriveSkillGrowth(CAREER, [
      new SkillSummary().id('s1').jobIds(['missing']).mock(),
    ]);

    expect(points).toEqual([]);
  });
});
