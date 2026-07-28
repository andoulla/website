import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import { sortMatchesFirst } from '@/utils/sortMatchesFirst';
import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';
import { SkillsNoData } from '@/views/skills/skillsNoData';

import { useSkillsViewContext } from '../SkillsViewContext';

import { SkillsBarChart } from './skillsBarChart';

const BAR_SKELETON_WIDTHS = ['75%', '60%', '90%', '45%', '80%', '55%', '70%', '50%'] as const;

const BarChartSkeleton = () => (
  <Stack spacing={1.5} sx={{ py: 1, px: 2 }}>
    {BAR_SKELETON_WIDTHS.map((width, i) => (
      <Stack key={i} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 80, flexShrink: 0 }}>
          <Skeleton variant="text" width="100%" />
        </Box>
        <Skeleton variant="rectangular" height={14} width={width} sx={{ borderRadius: 1 }} />
      </Stack>
    ))}
  </Stack>
);

export const SkillsGraphView = () => {
  const { skills, filteredSkills, searchTerm, highlightedSkills, showPatterns, onClearFilters } =
    useSkillsViewContext();

  const sortedSkills = useMemo(() => {
    // Copy first — filteredSkills is shared via context, so sorting in place would mutate it.
    const alphabetical = [...filteredSkills].sort((a, b) => a.skill.localeCompare(b.skill));
    // Stable-sort matches to the top, keeping matches and non-matches alphabetical among themselves.
    const searchSorted = sortMatchesFirst(alphabetical, (skill) =>
      skillMatchesSearch(skill, searchTerm)
    );

    // Float a highlighted skill (arrived at via a Resume deep link) above everything else.
    return sortMatchesFirst(searchSorted, (skill) => highlightedSkills.includes(skill.skill));
  }, [filteredSkills, searchTerm, highlightedSkills]);

  // When a search is active, only pass matching skills (or highlighted) to the chart — unmatched
  // bars are hidden rather than dimmed.
  const displaySkills = useMemo(() => {
    if (!hasSearchTerm(searchTerm)) return sortedSkills;

    return sortedSkills.filter(
      (skill) => skillMatchesSearch(skill, searchTerm) || highlightedSkills.includes(skill.skill)
    );
  }, [sortedSkills, searchTerm, highlightedSkills]);

  if (skills.length === 0) {
    return <SkillsNoData />;
  }

  if (displaySkills.length === 0) {
    return (
      <SkillsEmptyState onClearFilters={onClearFilters}>
        <BarChartSkeleton />
      </SkillsEmptyState>
    );
  }

  return (
    <SkillsBarChart
      skills={displaySkills}
      searchTerm={searchTerm}
      showPatterns={showPatterns}
      highlightedSkills={highlightedSkills}
    />
  );
};
