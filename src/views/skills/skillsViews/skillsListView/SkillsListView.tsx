import { useEffect, useMemo } from 'react';
import Stack from '@mui/material/Stack';

import { Section } from '@/components/section';
import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  SUBCATEGORIES_BY_CATEGORY,
  SUBCATEGORY_LABELS,
} from '@/utils/skillCategory';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import { useSkillsViewContext } from '../SkillsViewContext';

import { skillElementId } from './SkillsListView.helpers';
import { SkillItemsList } from './skillItemsList';

interface SubCategoryGroup {
  subCategory: SkillSubCategory;
  skills: SkillSummary[];
}

export const SkillsListView = () => {
  const { filteredSkills, highlightedSkills, searchTerm } = useSkillsViewContext();

  useEffect(() => {
    if (highlightedSkills.length === 0) return;
    const el = document.getElementById(skillElementId(highlightedSkills[0]));
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedSkills]);

  // A non-empty search term hides everything but the matches, rather than just accenting them.
  const searchedSkills = useMemo(
    () =>
      searchTerm === undefined || searchTerm.trim() === ''
        ? filteredSkills
        : filteredSkills.filter((skill) => skillMatchesSearch(skill, searchTerm)),
    [filteredSkills, searchTerm]
  );

  const byCategory = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<SkillCategory, SkillSummary[]>>(
        (acc, cat) => {
          acc[cat] = searchedSkills.filter((skill) => skill.category === cat);
          return acc;
        },
        {
          engineering: [],
          'quality-performance': [],
          tooling: [],
          'leadership-delivery': [],
          'people-stakeholders': [],
        }
      ),
    [searchedSkills]
  );

  const subGroupsByCategory = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<SkillCategory, SubCategoryGroup[]>>(
        (acc, cat) => {
          acc[cat] = SUBCATEGORIES_BY_CATEGORY[cat]
            .map((subCategory) => ({
              subCategory,
              skills: byCategory[cat].filter((skill) => skill.subCategory === subCategory),
            }))
            .filter((group) => group.skills.length > 0);
          return acc;
        },
        {
          engineering: [],
          'quality-performance': [],
          tooling: [],
          'leadership-delivery': [],
          'people-stakeholders': [],
        }
      ),
    [byCategory]
  );

  const nonEmptyCategories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => byCategory[cat].length > 0),
    [byCategory]
  );

  return (
    <Stack spacing={2}>
      {nonEmptyCategories.map((cat) => (
        <Section key={cat} title={CATEGORY_LABELS[cat]}>
          {subGroupsByCategory[cat].length > 1 ? (
            <Stack spacing={1.5}>
              {subGroupsByCategory[cat].map((group) => (
                <Section
                  key={group.subCategory}
                  title={SUBCATEGORY_LABELS[group.subCategory]}
                  titleLevel={3}
                >
                  <SkillItemsList skills={group.skills} highlightedSkills={highlightedSkills} />
                </Section>
              ))}
            </Stack>
          ) : (
            <SkillItemsList skills={byCategory[cat]} highlightedSkills={highlightedSkills} />
          )}
        </Section>
      ))}
    </Stack>
  );
};
