import { SkillSummary } from '@/testing';

import { derivePresentCategories } from './derivePresentCategories';

describe('derivePresentCategories', () => {
  test('returns one entry per category, deduped, ordered by track position', () => {
    const skills = [
      new SkillSummary()
        .skill('Team Leadership')
        .categoryId('leadership')
        .categoryName('Leadership')
        .categoryIndex(1)
        .colour('green')
        .mock(),
      new SkillSummary().skill('React').mock(),
      new SkillSummary().skill('TypeScript').mock(),
    ];

    expect(derivePresentCategories(skills)).toEqual([
      { id: 'frontend-development', name: 'Frontend Development', index: 0, colour: 'teal' },
      { id: 'leadership', name: 'Leadership', index: 1, colour: 'green' },
    ]);
  });

  test('returns an empty array for no skills', () => {
    expect(derivePresentCategories([])).toEqual([]);
  });
});
