import { Track } from '@/testing';

import { trackSkillIds } from './trackSkillIds';

describe('trackSkillIds', () => {
  test('collects skill ids across all categories and subcategories', () => {
    const track = new Track()
      .categories([
        {
          id: 'frontend-development',
          name: 'Frontend Development',
          subCategories: [
            { id: 'core-technologies', name: 'Core Technologies', skillIds: ['react', 'jest'] },
          ],
        },
        {
          id: 'leadership',
          name: 'Leadership',
          subCategories: [
            { id: 'people-management', name: 'People Management', skillIds: ['team-leadership'] },
          ],
        },
      ])
      .mock();

    expect(trackSkillIds(track)).toEqual(new Set(['react', 'jest', 'team-leadership']));
  });
});
