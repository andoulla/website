import type { WorkExperience } from '../../types';

import { calculateSkillYears } from './calculateSkillYears';

const TODAY = new Date('2026-07-02');

function makeJob(
  overrides: Partial<WorkExperience> & Pick<WorkExperience, 'startDate' | 'endDate'>
): WorkExperience {
  return {
    id: 'job',
    companyName: 'Acme',
    location: 'Remote',
    responsibilities: [],
    skills: [],
    techStack: [],
    logo: '',
    experienceUrl: '',
    ...overrides,
  };
}

describe('calculateSkillYears', () => {
  test('returns a SkillSummary for each unique skill', () => {
    const result = calculateSkillYears(
      [makeJob({ startDate: '2020-01-01', endDate: '2022-01-01', techStack: ['React'] })],
      TODAY
    );
    expect(result).toHaveLength(1);
    expect(result[0].skill).toBe('React');
  });

  test('sums years for a skill appearing in multiple jobs', () => {
    const result = calculateSkillYears(
      [
        makeJob({ startDate: '2020-01-01', endDate: '2022-01-01', techStack: ['React'] }),
        makeJob({ startDate: '2018-01-01', endDate: '2020-01-01', techStack: ['React'] }),
      ],
      TODAY
    );
    const react = result.find((s) => s.skill === 'React');
    expect(react?.years).toBeCloseTo(4, 0);
  });

  test('deduplicates a skill present in both techStack and skills of the same job', () => {
    const result = calculateSkillYears(
      [
        makeJob({
          startDate: '2024-07-02',
          endDate: '2026-07-02',
          techStack: ['React'],
          skills: ['React'],
        }),
      ],
      TODAY
    );
    const react = result.find((s) => s.skill === 'React');
    // Should be ~2 years (not ~4 from double-counting)
    expect(react?.years).toBeCloseTo(2, 0);
  });

  test('uses today for a current role (null endDate)', () => {
    const result = calculateSkillYears(
      [makeJob({ startDate: '2024-07-02', endDate: null, techStack: ['TypeScript'] })],
      TODAY
    );
    const ts = result.find((s) => s.skill === 'TypeScript');
    expect(ts?.years).toBeCloseTo(2, 0);
  });

  test('includes skills from both techStack and skills arrays', () => {
    const result = calculateSkillYears(
      [
        makeJob({
          startDate: '2020-01-01',
          endDate: '2022-01-01',
          techStack: ['React'],
          skills: ['Mentoring'],
        }),
      ],
      TODAY
    );
    expect(result.some((s) => s.skill === 'React')).toBe(true);
    expect(result.some((s) => s.skill === 'Mentoring')).toBe(true);
  });

  test('sorts engineering before managerial, then soft-skills, then other', () => {
    const result = calculateSkillYears(
      [
        makeJob({
          startDate: '2020-01-01',
          endDate: '2022-01-01',
          techStack: ['React'],
          skills: ['Team Leadership', 'Mentoring'],
        }),
      ],
      TODAY
    );
    const categories = result.map((s) => s.category);
    const engIdx = categories.indexOf('engineering');
    const manIdx = categories.indexOf('managerial');
    const softIdx = categories.indexOf('soft-skills');
    expect(engIdx).toBeLessThan(manIdx);
    expect(manIdx).toBeLessThan(softIdx);
  });

  test('sorts by years descending within the same category', () => {
    const result = calculateSkillYears(
      [
        makeJob({ startDate: '2020-01-01', endDate: '2022-01-01', techStack: ['React'] }),
        makeJob({ startDate: '2018-01-01', endDate: '2020-01-01', techStack: ['React', 'Jest'] }),
      ],
      TODAY
    );
    const engineering = result.filter((s) => s.category === 'engineering');
    for (let i = 1; i < engineering.length; i++) {
      expect(engineering[i - 1].years).toBeGreaterThanOrEqual(engineering[i].years);
    }
  });

  test('assigns the correct category and colour to each skill', () => {
    const result = calculateSkillYears(
      [makeJob({ startDate: '2020-01-01', endDate: '2022-01-01', techStack: ['React'] })],
      TODAY
    );
    const react = result.find((s) => s.skill === 'React');
    expect(react?.category).toBe('engineering');
    expect(react?.colour).toBe('primary');
  });
});
