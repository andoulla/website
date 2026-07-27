import type { Track } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

import type { CategoryGroup } from './SkillsTableView.types';

export const skillElementId = (name: string): string => `skill-${encodeURIComponent(name)}`;

// Groups a flat SkillSummary[] by the active track's taxonomy, preserving years-desc order.
export const groupSkillsByTrack = (track: Track, skills: SkillSummary[]): CategoryGroup[] =>
  track.categories
    .map((category) => {
      const subGroups = category.subCategories
        .map((subCategory) => ({
          subCategory,
          skills: skills.filter((skill) => skill.subCategoryId === subCategory.id),
        }))
        .filter((group) => group.skills.length > 0);

      return {
        category,
        subGroups,
        skills: subGroups.flatMap((group) => group.skills),
      };
    })
    .filter((group) => group.skills.length > 0);
