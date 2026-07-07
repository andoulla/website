import { skillElementId } from './SkillsListView.helpers';

describe('skillElementId', () => {
  test('prefixes the skill name', () => {
    expect(skillElementId('React')).toBe('skill-React');
  });

  test('URL-encodes special characters in the skill name', () => {
    expect(skillElementId('C++')).toBe('skill-C%2B%2B');
  });
});
