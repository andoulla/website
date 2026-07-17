import type { TrackCategory, TrackSubCategory } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';

export interface SubCategoryGroup {
  subCategory: TrackSubCategory;
  skills: SkillSummary[];
}

export interface CategoryGroup {
  category: TrackCategory;
  subGroups: SubCategoryGroup[];
  skills: SkillSummary[];
}
