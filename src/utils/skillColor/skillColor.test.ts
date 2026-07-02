import { skillCategory, skillColor } from './skillColor';

describe('skillColor', () => {
  test('engineering skills map to primary', () => {
    expect(skillColor('React')).toBe('primary');
    expect(skillColor('TypeScript')).toBe('primary');
  });

  test('managerial skills map to secondary', () => {
    expect(skillColor('Team Leadership')).toBe('secondary');
    expect(skillColor('Roadmap Planning')).toBe('secondary');
  });

  test('soft skills map to success', () => {
    expect(skillColor('Mentoring')).toBe('success');
    expect(skillColor('Team Onboarding')).toBe('success');
  });

  test('unknown skills map to info', () => {
    expect(skillColor('Rust')).toBe('info');
    expect(skillColor('Cobol')).toBe('info');
  });

  test('always returns the same color for the same skill', () => {
    expect(skillColor('GraphQL')).toBe(skillColor('GraphQL'));
    expect(skillColor('Rust')).toBe(skillColor('Rust'));
  });
});

describe('skillCategory', () => {
  test('returns the correct category for known skills', () => {
    expect(skillCategory('React')).toBe('engineering');
    expect(skillCategory('Team Leadership')).toBe('managerial');
    expect(skillCategory('Mentoring')).toBe('soft-skills');
  });

  test('returns other for unknown skills', () => {
    expect(skillCategory('Rust')).toBe('other');
  });
});
