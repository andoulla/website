import { useEffect, useMemo } from 'react';
import Stack from '@mui/material/Stack';

import { Section } from '@/components/section';
import type { SkillCategory, SkillSubCategory } from '@/data/skills.types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { hasSearchTerm } from '@/utils/hasSearchTerm';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  SUBCATEGORIES_BY_CATEGORY,
  SUBCATEGORY_LABELS,
} from '@/utils/skillCategory';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import { useSkillsViewContext } from '../SkillsViewContext';
import { SkillsEmptyState } from '../skillsEmptyState';

import { createEmptyByCategory, skillElementId } from './SkillsListView.helpers';
import { SkillItemsList } from './skillItemsList';

interface SubCategoryGroup {
  subCategory: SkillSubCategory;
  skills: SkillSummary[];
}

export const SkillsListView = () => {
  const {
    filteredSkills,
    highlightedSkills,
    searchTerm,
    selectedCategories,
    selectedSubCategories,
    onClearFilters,
  } = useSkillsViewContext();

  useEffect(() => {
    if (highlightedSkills.length === 0) return;
    const el = document.getElementById(skillElementId(highlightedSkills[0]));
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedSkills]);

  // A search term at or above the minimum match length hides everything but the matches, rather
  // than just accenting them.
  const searchedSkills = useMemo(
    () =>
      !hasSearchTerm(searchTerm)
        ? filteredSkills
        : filteredSkills.filter((skill) => skillMatchesSearch(skill, searchTerm)),
    [filteredSkills, searchTerm]
  );

  const byCategory = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<SkillCategory, SkillSummary[]>>((acc, cat) => {
        acc[cat] = searchedSkills.filter((skill) => skill.category === cat);
        return acc;
      }, createEmptyByCategory<SkillSummary>()),
    [searchedSkills]
  );

  const subGroupsByCategory = useMemo(
    () =>
      CATEGORY_ORDER.reduce<Record<SkillCategory, SubCategoryGroup[]>>((acc, cat) => {
        acc[cat] = SUBCATEGORIES_BY_CATEGORY[cat]
          .map((subCategory) => ({
            subCategory,
            skills: byCategory[cat].filter((skill) => skill.subCategory === subCategory),
          }))
          .filter((group) => group.skills.length > 0);
        return acc;
      }, createEmptyByCategory<SubCategoryGroup>()),
    [byCategory]
  );

  const nonEmptyCategories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => byCategory[cat].length > 0),
    [byCategory]
  );

  if (nonEmptyCategories.length === 0) {
    return (
      <SkillsEmptyState
        hasActiveFilters={selectedCategories.length > 0 || selectedSubCategories.length > 0}
        onClearFilters={onClearFilters}
      />
    );
  }

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
