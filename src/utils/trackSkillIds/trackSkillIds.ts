import type { Track } from '@/types';

// The set of skill ids present anywhere in the track's taxonomy.
export const trackSkillIds = (track: Track): Set<string> =>
  new Set(
    track.categories.flatMap((category) =>
      category.subCategories.flatMap((subCategory) => subCategory.skillIds)
    )
  );
