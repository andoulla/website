import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Track } from '@/types';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { deriveTrackDiff } from '@/utils/deriveTrackDiff';
import { filterSkillsByCategory } from '@/utils/filterSkillsByCategory';
import { hasSearchTerm } from '@/utils/hasSearchTerm';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import { groupSkillsByTrack, SkillsTable, useSkillsViewContext } from '..';

import { alignCompareGroups } from './SkillsCompareView.helpers';
import { CompareLegend } from './compareLegend';

interface SkillsCompareViewProps {
  compareTrack: Track;
  compareSkills: SkillSummary[];
}

export const SkillsCompareView = ({ compareTrack, compareSkills }: SkillsCompareViewProps) => {
  const {
    track: primaryTrack,
    filteredSkills: primaryFilteredSkills,
    selectedCategories,
    selectedSubCategories,
    searchTerm,
    highlightedSkills,
  } = useSkillsViewContext();

  const diffStatusMap = useMemo(
    () => deriveTrackDiff(primaryTrack, compareTrack),
    [primaryTrack, compareTrack]
  );

  const primarySearched = useMemo(() => {
    if (!hasSearchTerm(searchTerm)) return primaryFilteredSkills;

    return primaryFilteredSkills.filter((skill) => skillMatchesSearch(skill, searchTerm));
  }, [primaryFilteredSkills, searchTerm]);

  const compareFiltered = useMemo(
    () => filterSkillsByCategory(compareSkills, selectedCategories, selectedSubCategories),
    [compareSkills, selectedCategories, selectedSubCategories]
  );

  const compareSearched = useMemo(() => {
    if (!hasSearchTerm(searchTerm)) return compareFiltered;

    return compareFiltered.filter((skill) => skillMatchesSearch(skill, searchTerm));
  }, [compareFiltered, searchTerm]);

  const { primary: primaryGroups, compare: compareGroups } = useMemo(() => {
    const rawPrimary = groupSkillsByTrack(primaryTrack, primarySearched);
    const rawCompare = groupSkillsByTrack(compareTrack, compareSearched);

    return alignCompareGroups(rawPrimary, rawCompare);
  }, [primaryTrack, primarySearched, compareTrack, compareSearched]);

  return (
    <>
      <CompareLegend />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ alignItems: 'flex-start', mt: 1.5 }}
      >
        <Box
          sx={{ flex: 1, minWidth: 0 }}
          aria-label={`${primaryTrack.label} skills`}
          component="section"
        >
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
            {primaryTrack.label}
          </Typography>
          <SkillsTable
            categoryGroups={primaryGroups}
            highlightedSkills={highlightedSkills}
            diffStatusMap={diffStatusMap}
            diffSide="a"
            hideTypeColumn
          />
        </Box>
        <Box
          sx={{ flex: 1, minWidth: 0 }}
          aria-label={`${compareTrack.label} skills`}
          component="section"
        >
          <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
            {compareTrack.label}
          </Typography>
          <SkillsTable
            categoryGroups={compareGroups}
            highlightedSkills={highlightedSkills}
            diffStatusMap={diffStatusMap}
            diffSide="b"
            hideTypeColumn
          />
        </Box>
      </Stack>
    </>
  );
};
