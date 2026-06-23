import { skillColor } from './skillColor';

describe('skillColor', () => {
  test('maps a known skill to its curated color', () => {
    expect(skillColor('React')).toBe('info');
    expect(skillColor('TypeScript')).toBe('primary');
  });

  test('maps an unknown skill to a valid palette color', () => {
    expect(['primary', 'secondary', 'success', 'warning', 'info', 'error']).toContain(
      skillColor('Rust')
    );
  });

  test('always returns the same color for the same skill', () => {
    expect(skillColor('GraphQL')).toBe(skillColor('GraphQL'));
    expect(skillColor('Rust')).toBe(skillColor('Rust'));
  });
});
