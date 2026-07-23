import { Skill, TimelineEvent, Track } from '@/testing';

import { calculateSkillYears } from './calculateSkillYears';

const TODAY = new Date('2026-07-02');

// react + jest in frontend-development, team-leadership in leadership, in that track order.
const testTrack = new Track()
  .categories([
    {
      id: 'frontend-development',
      name: 'Frontend Development',
      subCategories: [
        { id: 'core-technologies', name: 'Core Technologies', skillIds: ['react', 'jest'] },
      ],
    },
    {
      id: 'leadership',
      name: 'Leadership',
      subCategories: [
        { id: 'people-management', name: 'People Management', skillIds: ['team-leadership'] },
      ],
    },
  ])
  .mock();

describe('calculateSkillYears', () => {
  describe('inclusion and filtering', () => {
    test('returns a SkillSummary for each track skill that has matching job IDs', () => {
      const job = new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock();
      const result = calculateSkillYears(
        [job],
        testTrack,
        [new Skill().jobIds(['j1']).mock()],
        TODAY
      );

      expect(result).toHaveLength(1);
      expect(result[0].skill).toBe('React');
    });

    test('excludes skills whose job IDs do not match any career history entry', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        testTrack,
        [new Skill().jobIds(['unknown-id']).mock()],
        TODAY
      );

      expect(result).toHaveLength(0);
    });

    test('excludes skills with no job IDs', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        testTrack,
        [new Skill().jobIds([]).mock()],
        TODAY
      );

      expect(result).toHaveLength(0);
    });

    test('excludes skills that are not in the track taxonomy', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        testTrack,
        [new Skill().id('graphql').name('GraphQL').jobIds(['j1']).mock()],
        TODAY
      );

      expect(result).toHaveLength(0);
    });

    test('accumulates only the matched job IDs when a skill has some unmatched job IDs', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        testTrack,
        [new Skill().jobIds(['j1', 'unknown-id']).mock()],
        TODAY
      );
      const react = result.find((summary) => summary.skill === 'React');

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
        testTrack,
        [new Skill().jobIds(['j1', 'j2']).mock()],
        TODAY
      );
      const react = result.find((summary) => summary.skill === 'React');

      expect(react?.years).toBeCloseTo(4, 0);
    });

    test('uses today for a current role (null endDate)', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2024-07-02').endDate(null).mock()],
        testTrack,
        [new Skill().jobIds(['j1']).mock()],
        TODAY
      );
      const react = result.find((summary) => summary.skill === 'React');

      expect(react?.years).toBeCloseTo(2, 0);
    });

    test('clips a closed endDate that is after asOf', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2024-07-02').endDate('2027-01-01').mock()],
        testTrack,
        [new Skill().jobIds(['j1']).mock()],
        TODAY
      );
      const react = result.find((summary) => summary.skill === 'React');

      expect(react?.years).toBeCloseTo(2, 0);
    });

    test('rounds years to one decimal place at a rounding boundary', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2021-01-19').mock()],
        testTrack,
        [new Skill().jobIds(['j1']).mock()],
        TODAY
      );
      const react = result.find((summary) => summary.skill === 'React');

      expect(react?.years).toBe(1.1);
    });
  });

  describe('ordering', () => {
    test('orders categories by their position in the track file', () => {
      const job = new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock();
      const result = calculateSkillYears(
        [job],
        testTrack,
        [
          new Skill().id('team-leadership').name('Team Leadership').jobIds(['j1']).mock(),
          new Skill().jobIds(['j1']).mock(),
        ],
        TODAY
      );

      expect(result.map((summary) => summary.categoryId)).toEqual([
        'frontend-development',
        'leadership',
      ]);
    });

    test('sorts by years descending within the same category', () => {
      const result = calculateSkillYears(
        [
          new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock(),
          new TimelineEvent().id('j2').startDate('2018-01-01').endDate('2020-01-01').mock(),
        ],
        testTrack,
        [
          new Skill().id('jest').name('Jest').jobIds(['j2']).mock(),
          new Skill().jobIds(['j1', 'j2']).mock(),
        ],
        TODAY
      );

      expect(result.map((summary) => summary.skill)).toEqual(['React', 'Jest']);
    });
  });

  describe('metadata and category assignment', () => {
    test('fills in the track category/subcategory fields and index-based colour', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        testTrack,
        [new Skill().id('team-leadership').name('Team Leadership').jobIds(['j1']).mock()],
        TODAY
      );
      const leadership = result.find((summary) => summary.skill === 'Team Leadership');

      expect(leadership).toMatchObject({
        id: 'team-leadership',
        categoryId: 'leadership',
        categoryName: 'Leadership',
        categoryIndex: 1,
        subCategoryId: 'people-management',
        subCategoryName: 'People Management',
        colour: 'green',
      });
    });

    test('passes through skill metadata fields unchanged: jobIds, recommendationIds, synonyms', () => {
      const result = calculateSkillYears(
        [new TimelineEvent().id('j1').startDate('2020-01-01').endDate('2022-01-01').mock()],
        testTrack,
        [new Skill().jobIds(['j1']).recommendationIds(['rec-1']).synonyms(['React.js']).mock()],
        TODAY
      );

      expect(result[0].jobIds).toEqual(['j1']);
      expect(result[0].recommendationIds).toEqual(['rec-1']);
      expect(result[0].synonyms).toEqual(['React.js']);
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
        testTrack,
        [new Skill().jobIds(['j1', 'j2']).mock()],
        TODAY
      );
      const react = result.find((summary) => summary.skill === 'React');

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
        testTrack,
        [new Skill().jobIds(['j1', 'j2']).mock()],
        TODAY
      );
      const react = result.find((summary) => summary.skill === 'React');

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
        testTrack,
        [new Skill().jobIds(['j1']).mock()]
      );
      const react = result.find((summary) => summary.skill === 'React');

      expect(react?.years).toBeCloseTo(2, 0);
    });
  });
});
