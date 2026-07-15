import type { Track } from '@/types';

import type { TrackCategoryRef } from './deriveSkillCategoryMap.types';

// Maps every skill id in the track to its owning category (skill ids are unique per track).
export const deriveSkillCategoryMap = (track: Track): Map<string, TrackCategoryRef> => {
  const categoryBySkillId = new Map<string, TrackCategoryRef>();

  track.categories.forEach((category, index) => {
    category.subCategories.forEach((subCategory) => {
      subCategory.skillIds.forEach((skillId) => {
        categoryBySkillId.set(skillId, { id: category.id, name: category.name, index });
      });
    });
  });

  return categoryBySkillId;
};
