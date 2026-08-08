import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { DensityToggle } from '@/components/densityToggle';
import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import { SkillsEmptyState } from '@/views/skills/skillsEmptyState';

import { useSkillsViewContext } from '../SkillsViewContext';

import { groupSkillsByTrack, skillElementId } from './SkillsTableView.helpers';
import { SkillsTable } from './skillsTable';
import { SkillsMobileCardView } from './skillsMobileCardView';

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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px

  const innerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = innerRef.current;

    if (!el || isMobile) return; // Skip height tracking on mobile

    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined) setTableHeight(entry.contentRect.height);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (highlightedSkills.length === 0) return;

    const el = document.getElementById(skillElementId(highlightedSkills[0]));

    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedSkills]);

  // Hides non-matches rather than just accenting them.
  const searchedSkills = !hasSearchTerm(searchTerm)
    ? filteredSkills
    : filteredSkills.filter((skill) => skillMatchesSearch(skill, searchTerm));

  const categoryGroups = groupSkillsByTrack(track, searchedSkills);

  if (categoryGroups.length === 0) {
    return (
      <SkillsEmptyState onClearFilters={onClearFilters}>
        <TableSkeleton />
      </SkillsEmptyState>
    );
  }

  // Render mobile card view on small screens
  if (isMobile) {
    return <SkillsMobileCardView categoryGroups={categoryGroups} highlightedSkills={highlightedSkills} />;
  }

  // Render desktop table view
  return (
    <>
      {/* Sits directly above the table it controls — row density is its most visible effect. */}
      <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 1 }}>
        <DensityToggle />
      </Stack>
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
    </>
  );
};
