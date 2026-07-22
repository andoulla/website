import { Recommendation, Responsibility, Skill, TimelineEvent } from '@/testing';

import {
  buildSearchResults,
  groupLabel,
  matchesQuery,
  optionLabel,
  resultTo,
} from './ExperienceSearch.helpers';

const reactSkill = new Skill().id('react').name('React').synonyms(['reactjs']).mock();

const olderJob = new TimelineEvent()
  .id('job-1')
  .companyName('Acme Corp')
  .title('Engineer')
  .startDate('2021-01-01')
  .endDate('2022-01-01')
  .skills([reactSkill])
  .responsibilities([
    new Responsibility().id('job-1-r01').text('Migrated the billing platform').mock(),
  ])
  .mock();

const currentJob = new TimelineEvent()
  .id('job-2')
  .companyName('Globex')
  .title('Senior Engineer')
  .startDate('2023-01-01')
  .endDate(null)
  .skills([reactSkill])
  .mock();

const recommendation = new Recommendation()
  .id('rec-1')
  .authorInitials('J.D.')
  .authorRole({ jobTitle: 'CTO' })
  .text('Brilliant engineer')
  .mock();

const jobWithRecommendation = new TimelineEvent()
  .id('job-3')
  .recommendations([recommendation])
  .mock();

const typeScriptTech = new Skill()
  .id('typescript')
  .name('TypeScript')
  .type('tech')
  .synonyms(['ts'])
  .mock();

const jobWithTechStack = new TimelineEvent()
  .id('job-4')
  .companyName('Initech')
  .title('Developer')
  .startDate('2020-01-01')
  .endDate(null)
  .techStack([typeScriptTech])
  .mock();

describe('ExperienceSearch helpers', () => {
  test('buildSearchResults yields one skill row per job and groups skills → roles → recommendations', () => {
    const results = buildSearchResults([olderJob, currentJob, jobWithRecommendation]);

    expect(results.map((result) => result.kind)).toEqual([
      'skill',
      'skill',
      'role',
      'role',
      'role',
      'recommendation',
    ]);
  });

  test('buildSearchResults orders skill rows by job recency, current job first', () => {
    const skillRows = buildSearchResults([olderJob, currentJob]).filter(
      (result) => result.kind === 'skill'
    );

    expect(skillRows.map((result) => result.id)).toEqual([
      'skill:react:job-2',
      'skill:react:job-1',
    ]);
  });

  test('matchesQuery partial-matches a skill on its name and synonyms, above the length threshold', () => {
    const [skillRow] = buildSearchResults([olderJob]);

    expect(matchesQuery(skillRow, 'rea')).toBe(true);
    expect(matchesQuery(skillRow, 'reactjs')).toBe(true);
    expect(matchesQuery(skillRow, 'r')).toBe(false);
    expect(matchesQuery(skillRow, 'python')).toBe(false);
  });

  test('matchesQuery partial-matches "jav" and "js" against a JavaScript skill', () => {
    const javaScriptTech = new Skill()
      .id('javascript-es6')
      .name('JavaScript (ES6+)')
      .type('tech')
      .synonyms(['JavaScript', 'JS', 'ECMAScript'])
      .mock();
    const jobWithJavaScript = new TimelineEvent().id('job-5').techStack([javaScriptTech]).mock();
    const [skillRow] = buildSearchResults([jobWithJavaScript]);

    expect(matchesQuery(skillRow, 'jav')).toBe(true);
    expect(matchesQuery(skillRow, 'js')).toBe(true);
    expect(matchesQuery(skillRow, 'script')).toBe(true);
  });

  test('builds skill rows from tech-stack entries and matches them on name and synonyms', () => {
    const [skillRow] = buildSearchResults([jobWithTechStack]);

    expect(skillRow.id).toBe('skill:typescript:job-4');
    expect(matchesQuery(skillRow, 'typescript')).toBe(true);
    expect(matchesQuery(skillRow, 'ts')).toBe(true);
    expect(matchesQuery(skillRow, 'python')).toBe(false);
  });

  test('matchesQuery matches a role on company, title, and responsibility text', () => {
    const [, roleRow] = buildSearchResults([olderJob]);

    expect(matchesQuery(roleRow, 'acme')).toBe(true);
    expect(matchesQuery(roleRow, 'engineer')).toBe(true);
    expect(matchesQuery(roleRow, 'billing')).toBe(true);
    expect(matchesQuery(roleRow, 'globex')).toBe(false);
  });

  test('matchesQuery matches a recommendation on job title, text, and author initials', () => {
    const [, recRow] = buildSearchResults([jobWithRecommendation]);

    expect(matchesQuery(recRow, 'cto')).toBe(true);
    expect(matchesQuery(recRow, 'brilliant')).toBe(true);
    expect(matchesQuery(recRow, 'jd')).toBe(true);
  });

  test('resultTo builds a fresh query per kind', () => {
    const [skillRow, roleRow] = buildSearchResults([olderJob]);
    const [, recRow] = buildSearchResults([jobWithRecommendation]);

    expect(resultTo(skillRow, 'general')).toBe('/?track=general&skill=React&focus=job-1');
    expect(resultTo(roleRow, 'general')).toBe('/?track=general&focus=job-1');
    expect(resultTo(recRow, 'lead')).toBe('/?track=lead&recommendation=rec-1');
  });

  test('optionLabel labels each kind', () => {
    const [pastSkillRow, roleRow] = buildSearchResults([olderJob]);
    const [currentSkillRow] = buildSearchResults([currentJob]);
    const [, recRow] = buildSearchResults([jobWithRecommendation]);

    expect(optionLabel(pastSkillRow)).toBe('React · Acme Corp · 2021–2022');
    expect(optionLabel(currentSkillRow)).toBe('React · Globex · 2023–Present');
    expect(optionLabel(roleRow)).toBe('Acme Corp');
    expect(optionLabel(recRow)).toBe('J.D. · CTO');
  });

  test('groupLabel maps each kind to a group heading', () => {
    expect(groupLabel('skill')).toBe('Skills');
    expect(groupLabel('role')).toBe('Roles');
    expect(groupLabel('recommendation')).toBe('Recommendations');
  });
});
