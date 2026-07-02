import { skillCategory, skillColour, skillShadeIndex } from './skillColour.helpers';

describe('skillColour', () => {
  test('engineering skills map to primary', () => {
    expect(skillColour('React')).toBe('primary');
    expect(skillColour('TypeScript')).toBe('primary');
  });

  test('managerial skills map to secondary', () => {
    expect(skillColour('Team Leadership')).toBe('secondary');
    expect(skillColour('Roadmap Planning')).toBe('secondary');
  });

  test('soft skills map to success', () => {
    expect(skillColour('Mentoring')).toBe('success');
    expect(skillColour('Team Onboarding')).toBe('success');
  });

  test('unknown skills map to info', () => {
    expect(skillColour('Rust')).toBe('info');
    expect(skillColour('Cobol')).toBe('info');
  });

  test('always returns the same colour for the same skill', () => {
    expect(skillColour('GraphQL')).toBe(skillColour('GraphQL'));
    expect(skillColour('Rust')).toBe(skillColour('Rust'));
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

describe('skillShadeIndex', () => {
  test('returns a number between 0 and 5 inclusive', () => {
    const idx = skillShadeIndex('React');
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThanOrEqual(5);
  });

  test('always returns the same index for the same skill', () => {
    expect(skillShadeIndex('TypeScript')).toBe(skillShadeIndex('TypeScript'));
    expect(skillShadeIndex('Mentoring')).toBe(skillShadeIndex('Mentoring'));
  });

  test('different skills can produce different indices', () => {
    const indices = ['React', 'TypeScript', 'Jest', 'Playwright', 'Sass', 'Webpack'].map(
      skillShadeIndex
    );
    expect(new Set(indices).size).toBeGreaterThan(1);
  });
});
