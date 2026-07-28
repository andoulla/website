import { SkillSummary, Track } from '@/testing';

import { groupSkillsByTrack, skillElementId } from './SkillsTableView.helpers';

const testTrack = new Track()
  .categories([
    {
      id: 'frontend',
      name: 'Frontend',
      subCategories: [
        { id: 'core', name: 'Core', skillIds: ['react'] },
        { id: 'tooling', name: 'Tooling', skillIds: ['webpack'] },
      ],
    },
    {
      id: 'backend',
      name: 'Backend',
      subCategories: [{ id: 'server', name: 'Server', skillIds: ['node'] }],
    },
  ])
  .mock();

describe('groupSkillsByTrack', () => {
  test('groups skills under their track category', () => {
    const skills = [
      new SkillSummary().id('react').skill('React').subCategoryId('core').mock(),
      new SkillSummary().id('node').skill('Node').subCategoryId('server').mock(),
    ];

    const groups = groupSkillsByTrack(testTrack, skills);

    expect(groups).toHaveLength(2);
    expect(groups[0].category.name).toBe('Frontend');
    expect(groups[0].skills).toHaveLength(1);
    expect(groups[0].skills[0].skill).toBe('React');
    expect(groups[1].category.name).toBe('Backend');
    expect(groups[1].skills[0].skill).toBe('Node');
  });

  test('omits categories with no matching skills', () => {
    const skills = [new SkillSummary().id('react').skill('React').subCategoryId('core').mock()];

    const groups = groupSkillsByTrack(testTrack, skills);

    expect(groups).toHaveLength(1);
    expect(groups[0].category.name).toBe('Frontend');
  });

  test('returns an empty array when no skills match', () => {
    const groups = groupSkillsByTrack(testTrack, []);

    expect(groups).toHaveLength(0);
  });

  test('creates sub-groups when multiple sub-categories have skills', () => {
    const skills = [
      new SkillSummary().id('react').skill('React').subCategoryId('core').mock(),
      new SkillSummary().id('webpack').skill('Webpack').subCategoryId('tooling').mock(),
    ];

    const groups = groupSkillsByTrack(testTrack, skills);

    expect(groups[0].subGroups).toHaveLength(2);
  });
});

describe('skillElementId', () => {
  test('prefixes the skill name', () => {
    expect(skillElementId('React')).toBe('skill-React');
  });

  test('URL-encodes special characters in the skill name', () => {
    expect(skillElementId('C++')).toBe('skill-C%2B%2B');
  });
});
