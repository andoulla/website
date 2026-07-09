import { Skill, TimelineEvent } from '@/testing';

import { calculateSkillYears } from './calculateSkillYears';

const TODAY = new Date('2026-07-02');

describe('calculateSkillYears', () => {
  describe('inclusion and filtering', () => {
    test('returns a SkillSummary for each skill that has matching job IDs', () => {
      const job = new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock();
      const result = calculateSkillYears(
        [job],
        [new Skill().name('React').jobIds(['j1']).mock()],
        TODAY
      );

      expect(result).toHaveLength(1);
      expect(result[0].skill).toBe('React');
    });

    test('excludes skills whose job IDs do not match any career history entry', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        [new Skill().name('React').jobIds(['unknown-id']).mock()],
        TODAY
      );

      expect(result).toHaveLength(0);
    });

    test('excludes skills with no job IDs', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        [new Skill().name('React').jobIds([]).mock()],
        TODAY
      );

      expect(result).toHaveLength(0);
    });

    test('accumulates only the matched job IDs when a skill has some unmatched job IDs', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        [new Skill().name('React').jobIds(['j1', 'unknown-id']).mock()],
        TODAY
      );
      const react = result.find((s) => s.skill === 'React');

      expect(react?.years).toBeCloseTo(2, 0);
    });
  });

  describe('duration calculation', () => {
    test('sums years for a skill appearing in multiple jobs', () => {
      const result = calculateSkillYears(
        [
          new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock(),
          new TimelineEvent().id('j2').startDate('2018-01-01').endDate('2020-01-01').mock(),
        ],
        [new Skill().name('React').jobIds(['j1', 'j2']).mock()],
        TODAY
      );
      const react = result.find((s) => s.skill === 'React');

      expect(react?.years).toBeCloseTo(4, 0);
    });

    test('uses today for a current role (null endDate)', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2024-07-02').endDate(null).mock()],
        [new Skill().name('TypeScript').jobIds(['j1']).mock()],
        TODAY
      );
      const ts = result.find((s) => s.skill === 'TypeScript');

      expect(ts?.years).toBeCloseTo(2, 0);
    });

    test('rounds years to one decimal place at a rounding boundary', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2021-01-19').mock()],
        [new Skill().name('React').jobIds(['j1']).mock()],
        TODAY
      );
      const react = result.find((s) => s.skill === 'React');

      expect(react?.years).toBe(1.1);
    });
  });

  describe('sorting', () => {
    test('sorts engineering, then quality & performance, then tooling, then leadership & delivery, then people & stakeholders', () => {
      const job = new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock();
      const result = calculateSkillYears(
        [job],
        [
          new Skill().name('React').jobIds(['j1']).mock(),
          new Skill()
            .name('Testing Strategy')
            .jobIds(['j1'])
            .category('quality-performance')
            .mock(),
          new Skill().name('Git/GitHub').jobIds(['j1']).category('tooling').mock(),
          new Skill().name('Team Leadership').jobIds(['j1']).category('leadership-delivery').mock(),
          new Skill().name('Mentoring').jobIds(['j1']).category('people-stakeholders').mock(),
        ],
        TODAY
      );
      const categories = result.map((s) => s.category);
      const engIdx = categories.indexOf('engineering');
      const qpIdx = categories.indexOf('quality-performance');
      const toolingIdx = categories.indexOf('tooling');
      const ldIdx = categories.indexOf('leadership-delivery');
      const psIdx = categories.indexOf('people-stakeholders');

      expect(engIdx).toBeLessThan(qpIdx);
      expect(qpIdx).toBeLessThan(toolingIdx);
      expect(toolingIdx).toBeLessThan(ldIdx);
      expect(ldIdx).toBeLessThan(psIdx);
    });

    test('sorts by years descending within the same category', () => {
      const result = calculateSkillYears(
        [
          new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock(),
          new TimelineEvent().id('j2').startDate('2018-01-01').endDate('2020-01-01').mock(),
        ],
        [
          new Skill().name('React').jobIds(['j1', 'j2']).mock(),
          new Skill().name('Jest').jobIds(['j2']).mock(),
        ],
        TODAY
      );
      const engineering = result.filter((s) => s.category === 'engineering');
      for (let i = 1; i < engineering.length; i++) {
        expect(engineering[i - 1].years).toBeGreaterThanOrEqual(engineering[i].years);
      }
    });
  });

  describe('metadata and category assignment', () => {
    test('assigns the correct category and colour to each skill', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        [new Skill().name('React').jobIds(['j1']).mock()],
        TODAY
      );
      const react = result.find((s) => s.skill === 'React');

      expect(react?.category).toBe('engineering');
      expect(react?.colour).toBe('teal');
    });

    test('passes through skill metadata fields unchanged: jobIds, recommendationIds, subCategory', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        [
          new Skill()
            .name('React Testing Library')
            .jobIds(['j1'])
            .recommendationIds(['rec-1'])
            .subCategory('testing')
            .mock(),
        ],
        TODAY
      );

      expect(result[0].jobIds).toEqual(['j1']);
      expect(result[0].recommendationIds).toEqual(['rec-1']);
      expect(result[0].subCategory).toBe('testing');
    });
  });

  describe('per-company breakdown', () => {
    test('breaks down years per company for a skill spanning multiple jobs', () => {
      const result = calculateSkillYears(
        [
          new TimelineEvent()
            .id('j1')
            .companyName('Acme')
            .startDate('2020-01-01')
            .endDate('2022-01-01')
            .mock(),
          new TimelineEvent()
            .id('j2')
            .companyName('Globex')
            .startDate('2018-01-01')
            .endDate('2020-01-01')
            .mock(),
        ],
        [new Skill().name('React').jobIds(['j1', 'j2']).mock()],
        TODAY
      );
      const react = result.find((s) => s.skill === 'React');

      expect(react?.companyYears).toEqual([
        { name: 'Acme', years: 2 },
        { name: 'Globex', years: 2 },
      ]);
    });

    test('sums years across jobs at the same company for one skill', () => {
      const result = calculateSkillYears(
        [
          new TimelineEvent()
            .id('j1')
            .companyName('Acme')
            .startDate('2020-01-01')
            .endDate('2021-01-01')
            .mock(),
          new TimelineEvent()
            .id('j2')
            .companyName('Acme')
            .startDate('2021-01-01')
            .endDate('2022-01-01')
            .mock(),
        ],
        [new Skill().name('React').jobIds(['j1', 'j2']).mock()],
        TODAY
      );
      const react = result.find((s) => s.skill === 'React');

      expect(react?.companyYears).toEqual([{ name: 'Acme', years: 2 }]);
    });
  });

  describe('defaults', () => {
    test('uses the current date when the today parameter is not provided', () => {
      const start = new Date();

      start.setFullYear(start.getFullYear() - 2);

      const result = calculateSkillYears(
        [
          new TimelineEvent()
            .id('j1')
            .startDate(start.toISOString().slice(0, 10))
            .endDate(null)
            .mock(),
        ],
        [new Skill().name('React').jobIds(['j1']).mock()]
      );
      const react = result.find((s) => s.skill === 'React');

      expect(react?.years).toBeCloseTo(2, 0);
    });
  });
});
