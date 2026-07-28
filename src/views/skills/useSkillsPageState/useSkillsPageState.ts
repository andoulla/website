import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { Track } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { matchSkill } from '@/utils/matchSkill';
import { CATEGORY_PARAM, SKILL_PARAM, SUBCATEGORY_PARAM } from '@/utils/skillsUrlParams';

import { parseCategoryIds, parseSubCategoryIds, reorderFilterParams } from '../Skills.helpers';

export const useSkillsPageState = (track: Track, skills: SkillSummary[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Params resolve through matchSkill: synonyms map to canonical names.
  const highlightedSkills = useMemo(
    () =>
      searchParams
        .getAll(SKILL_PARAM)
        .map((term) => matchSkill(term)?.skill.name)
        .filter((name): name is string => name !== undefined),
    [searchParams]
  );

  const categoriesRaw = searchParams.get(CATEGORY_PARAM);
  const selectedCategories = useMemo(
    () => parseCategoryIds(categoriesRaw, track),
    [categoriesRaw, track]
  );

  const setSelectedCategories = useCallback(
    (next: string[]) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);

          if (next.length > 0) {
            params.set(CATEGORY_PARAM, next.join(','));
          } else {
            params.delete(CATEGORY_PARAM);
          }

          return reorderFilterParams(params);
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const subCategoriesRaw = searchParams.get(SUBCATEGORY_PARAM);
  const selectedSubCategories = useMemo(
    () => parseSubCategoryIds(subCategoriesRaw, track),
    [subCategoriesRaw, track]
  );

  const setSelectedSubCategories = useCallback(
    (next: string[]) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);

          if (next.length > 0) {
            params.set(SUBCATEGORY_PARAM, next.join(','));
          } else {
            params.delete(SUBCATEGORY_PARAM);
          }

          return reorderFilterParams(params);
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Active track's subcategories, narrowed to those with at least one present summary.
  const subCategoriesByCategory = useMemo(
    () =>
      track.categories.reduce<Record<string, { id: string; name: string }[]>>((acc, category) => {
        const presentSubCategories = category.subCategories
          .filter((subCategory) => skills.some((skill) => skill.subCategoryId === subCategory.id))
          .map(({ id, name }) => ({ id, name }));

        if (presentSubCategories.length > 0) acc[category.id] = presentSubCategories;

        return acc;
      }, {}),
    [track, skills]
  );

  return {
    highlightedSkills,
    selectedCategories,
    setSelectedCategories,
    selectedSubCategories,
    setSelectedSubCategories,
    subCategoriesByCategory,
  };
};
