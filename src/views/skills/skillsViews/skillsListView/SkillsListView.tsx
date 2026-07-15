import { useEffect } from 'react';
import Stack from '@mui/material/Stack';

import { Section } from '@/components/section';
import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';

import { useSkillsViewContext } from '../SkillsViewContext';

import { skillElementId } from './SkillsListView.helpers';
import { SkillItemsList } from './skillItemsList';

export const SkillsListView = () => {
  const {
    track,
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

  // Hides non-matches rather than just accenting them.
  const searchedSkills = !hasSearchTerm(searchTerm)
    ? filteredSkills
    : filteredSkills.filter((skill) => skillMatchesSearch(skill, searchTerm));

  // Group by the active track's taxonomy; summaries keep their years-descending order.
  const categoryGroups = track.categories
    .map((category) => {
      const subGroups = category.subCategories
        .map((subCategory) => ({
          subCategory,
          skills: searchedSkills.filter((skill) => skill.subCategoryId === subCategory.id),
        }))
        .filter((group) => group.skills.length > 0);
      return {
        category,
        subGroups,
        skills: subGroups.flatMap((group) => group.skills),
      };
    })
    .filter((group) => group.skills.length > 0);

  if (categoryGroups.length === 0) {
    return (
      <SkillsEmptyState
        hasActiveFilters={selectedCategories.length > 0 || selectedSubCategories.length > 0}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <Stack spacing={2}>
      {categoryGroups.map(({ category, subGroups, skills }) => (
        <Section key={category.id} title={category.name}>
          {subGroups.length > 1 ? (
            <Stack spacing={1.5}>
              {subGroups.map((group) => (
                <Section key={group.subCategory.id} title={group.subCategory.name} titleLevel={3}>
                  <SkillItemsList skills={group.skills} highlightedSkills={highlightedSkills} />
                </Section>
              ))}
            </Stack>
          ) : (
            <SkillItemsList skills={skills} highlightedSkills={highlightedSkills} />
          )}
        </Section>
      ))}
    </Stack>
  );
};
