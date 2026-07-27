import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';

import { useSkillsViewContext } from '../SkillsViewContext';

import { skillElementId } from './SkillsTableView.helpers';
import { SkillsTable } from './skillsTable';
import type { CategoryGroup } from './SkillsTableView.types';

const TABLE_SKELETON_GROUPS: number[] = [3, 2, 3];

const TableSkeleton = () => (
  <Stack>
    {TABLE_SKELETON_GROUPS.map((rowCount, gi) => (
      <Box key={gi}>
        <Skeleton variant="rectangular" height={28} sx={{ mb: 0.5, borderRadius: 0 }} />
        {Array.from({ length: rowCount }).map((_, ri) => (
          <Stack key={ri} direction="row" spacing={2} sx={{ py: 0.75, px: 1 }}>
            <Skeleton variant="text" width="25%" />
            <Skeleton variant="text" width="8%" />
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="6%" />
          </Stack>
        ))}
      </Box>
    ))}
  </Stack>
);

export const SkillsTableView = () => {
  const { track, filteredSkills, highlightedSkills, searchTerm, onClearFilters } =
    useSkillsViewContext();

  const innerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = innerRef.current;

    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined) setTableHeight(entry.contentRect.height);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

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
  const categoryGroups: CategoryGroup[] = track.categories
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
      <SkillsEmptyState onClearFilters={onClearFilters}>
        <TableSkeleton />
      </SkillsEmptyState>
    );
  }

  return (
    <Box
      sx={{
        height: tableHeight,
        transition: tableHeight !== undefined ? 'height 250ms ease-out' : 'none',
        overflow: 'hidden',
      }}
    >
      <div ref={innerRef}>
        <SkillsTable categoryGroups={categoryGroups} highlightedSkills={highlightedSkills} />
      </div>
    </Box>
  );
};
