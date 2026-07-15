import { Track } from '@/testing';

import { deriveSkillCategoryMap } from './deriveSkillCategoryMap';

describe('deriveSkillCategoryMap', () => {
  test('maps each skill id to its owning category with the track position', () => {
    const track = new Track()
      .categories([
        {
          id: 'leadership',
          name: 'Leadership',
          subCategories: [
            { id: 'people', name: 'People', skillIds: ['team-leadership'] },
            { id: 'delivery', name: 'Delivery', skillIds: ['estimation-planning'] },
          ],
        },
        {
          id: 'frontend-development',
          name: 'Frontend Development',
          subCategories: [{ id: 'core', name: 'Core', skillIds: ['react'] }],
        },
      ])
      .mock();

    expect(deriveSkillCategoryMap(track)).toEqual(
      new Map([
        ['team-leadership', { id: 'leadership', name: 'Leadership', index: 0 }],
        ['estimation-planning', { id: 'leadership', name: 'Leadership', index: 0 }],
        ['react', { id: 'frontend-development', name: 'Frontend Development', index: 1 }],
      ])
    );
  });

  test('returns an empty map for a track with no skills', () => {
    const track = new Track().categories([]).mock();

    expect(deriveSkillCategoryMap(track)).toEqual(new Map());
  });
});
