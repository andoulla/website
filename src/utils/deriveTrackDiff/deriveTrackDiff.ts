import type { Track } from '@/types';
import { deriveSkillCategoryMap } from '@/utils/deriveSkillCategoryMap';
import { trackSkillIds } from '@/utils/trackSkillIds';

import type { TrackDiffStatus } from './deriveTrackDiff.types';

// Maps every skill id present in either track to its diff status relative to trackA.
export const deriveTrackDiff = (trackA: Track, trackB: Track): Map<string, TrackDiffStatus> => {
  const idsA = trackSkillIds(trackA);
  const idsB = trackSkillIds(trackB);
  const catMapA = deriveSkillCategoryMap(trackA);
  const catMapB = deriveSkillCategoryMap(trackB);
  const result = new Map<string, TrackDiffStatus>();

  for (const id of idsA) {
    if (!idsB.has(id)) {
      result.set(id, 'only-a');
    } else {
      const catA = catMapA.get(id);
      const catB = catMapB.get(id);

      result.set(id, catA?.id === catB?.id ? 'both-same-category' : 'both-moved');
    }
  }

  for (const id of idsB) {
    if (!idsA.has(id)) {
      result.set(id, 'only-b');
    }
  }

  return result;
};
