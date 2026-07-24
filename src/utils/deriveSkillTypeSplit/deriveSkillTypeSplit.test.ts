import { SkillSummary } from '@/testing';

import { deriveSkillTypeSplit } from './deriveSkillTypeSplit';

describe('deriveSkillTypeSplit', () => {
  test('returns correct counts and percentage for a mixed set', () => {
    const skills = [
      new SkillSummary().type('tech').mock(),
      new SkillSummary().type('tech').mock(),
      new SkillSummary().type('skill').mock(),
    ];

    const result = deriveSkillTypeSplit(skills);

    expect(result.techCount).toBe(2);
    expect(result.skillCount).toBe(1);
    expect(result.techPct).toBe(66.7);
  });

  test('returns techPct of 100 when all skills are tech', () => {
    const skills = [new SkillSummary().type('tech').mock(), new SkillSummary().type('tech').mock()];

    const result = deriveSkillTypeSplit(skills);

    expect(result.techCount).toBe(2);
    expect(result.skillCount).toBe(0);
    expect(result.techPct).toBe(100);
  });

  test('returns techPct of 0 when all skills are non-technical', () => {
    const skills = [
      new SkillSummary().type('skill').mock(),
      new SkillSummary().type('skill').mock(),
    ];

    const result = deriveSkillTypeSplit(skills);

    expect(result.techCount).toBe(0);
    expect(result.skillCount).toBe(2);
    expect(result.techPct).toBe(0);
  });

  test('returns all zeros for an empty skills array', () => {
    const result = deriveSkillTypeSplit([]);

    expect(result.techCount).toBe(0);
    expect(result.skillCount).toBe(0);
    expect(result.techPct).toBe(0);
  });
});
