import type { Skill } from '../../data/skills.types';
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
    logo: '',
    experienceUrl: '',
    ...overrides,
  };
}

function makeSkill(
  name: string,
  jobIds: string[],
  overrides: Partial<Omit<Skill, 'name' | 'jobIds'>> = {}
): Skill {
  return {
    name,
    category: 'engineering',
    type: 'tech',
    jobIds,
    recommendationIds: [],
    ...overrides,
  };
}

describe('calculateSkillYears', () => {
  test('returns a SkillSummary for each skill that has matching job IDs', () => {
    const job = makeJob({ id: 'j1', startDate: '2020-01-01', endDate: '2022-01-01' });
    const result = calculateSkillYears([job], [makeSkill('React', ['j1'])], TODAY);
    expect(result).toHaveLength(1);
    expect(result[0].skill).toBe('React');
  });

  test('sums years for a skill appearing in multiple jobs', () => {
    const result = calculateSkillYears(
      [
        makeJob({ id: 'j1', startDate: '2020-01-01', endDate: '2022-01-01' }),
        makeJob({ id: 'j2', startDate: '2018-01-01', endDate: '2020-01-01' }),
      ],
      [makeSkill('React', ['j1', 'j2'])],
      TODAY
    );
    const react = result.find((s) => s.skill === 'React');
    expect(react?.years).toBeCloseTo(4, 0);
  });

  test('uses today for a current role (null endDate)', () => {
    const result = calculateSkillYears(
      [makeJob({ id: 'j1', startDate: '2024-07-02', endDate: null })],
      [makeSkill('TypeScript', ['j1'])],
      TODAY
    );
    const ts = result.find((s) => s.skill === 'TypeScript');
    expect(ts?.years).toBeCloseTo(2, 0);
  });

  test('excludes skills whose job IDs do not match any experience', () => {
    const result = calculateSkillYears(
      [makeJob({ id: 'j1', startDate: '2020-01-01', endDate: '2022-01-01' })],
      [makeSkill('React', ['unknown-id'])],
      TODAY
    );
    expect(result).toHaveLength(0);
  });

  test('excludes skills with no job IDs', () => {
    const result = calculateSkillYears(
      [makeJob({ id: 'j1', startDate: '2020-01-01', endDate: '2022-01-01' })],
      [makeSkill('React', [])],
      TODAY
    );
    expect(result).toHaveLength(0);
  });

  test('sorts engineering before managerial, then soft-skills, then other', () => {
    const job = makeJob({ id: 'j1', startDate: '2020-01-01', endDate: '2022-01-01' });
    const result = calculateSkillYears(
      [job],
      [
        makeSkill('React', ['j1'], { category: 'engineering' }),
        makeSkill('Team Leadership', ['j1'], { category: 'managerial' }),
        makeSkill('Mentoring', ['j1'], { category: 'soft-skills' }),
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
        makeJob({ id: 'j1', startDate: '2020-01-01', endDate: '2022-01-01' }),
        makeJob({ id: 'j2', startDate: '2018-01-01', endDate: '2020-01-01' }),
      ],
      [makeSkill('React', ['j1', 'j2']), makeSkill('Jest', ['j2'])],
      TODAY
    );
    const engineering = result.filter((s) => s.category === 'engineering');
    for (let i = 1; i < engineering.length; i++) {
      expect(engineering[i - 1].years).toBeGreaterThanOrEqual(engineering[i].years);
    }
  });

  test('assigns the correct category and colour to each skill', () => {
    const result = calculateSkillYears(
      [makeJob({ id: 'j1', startDate: '2020-01-01', endDate: '2022-01-01' })],
      [makeSkill('React', ['j1'], { category: 'engineering' })],
      TODAY
    );
    const react = result.find((s) => s.skill === 'React');
    expect(react?.category).toBe('engineering');
    expect(react?.colour).toBe('primary');
  });

  test('passes through jobIds and recommendationIds from the skill definition', () => {
    const result = calculateSkillYears(
      [makeJob({ id: 'j1', startDate: '2020-01-01', endDate: '2022-01-01' })],
      [makeSkill('React', ['j1'], { recommendationIds: ['rec-1'] })],
      TODAY
    );
    expect(result[0].jobIds).toEqual(['j1']);
    expect(result[0].recommendationIds).toEqual(['rec-1']);
  });
});
