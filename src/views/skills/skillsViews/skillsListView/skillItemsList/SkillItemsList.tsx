import { useMemo } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles';
import { alpha, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { SkillTooltipContent } from '@/components/skillTooltipContent';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';
import { sortMatchesFirst } from '@/utils/sortMatchesFirst';

import { skillElementId } from '../SkillsListView.helpers';
import { useFlipReorder } from '../useFlipReorder';

import { dotColour } from './SkillItemsList.helpers';

export interface SkillItemsListProps {
  skills: SkillSummary[];
  highlightedSkill?: string;
  searchTerm?: string;
  onItemClick: (anchor: HTMLElement, skill: SkillSummary) => void;
}

interface SkillListItemProps {
  skill: SkillSummary;
  isHighlighted: boolean;
  isSearchMatch: boolean;
  theme: Theme;
  onItemClick: (anchor: HTMLElement, skill: SkillSummary) => void;
}

// Its own component (not inlined in the .map below) so each row gets its own useFlipReorder
// instance — the FLIP slide-into-place animation needs one ref/measurement pair per skill.
const SkillListItem = ({
  skill,
  isHighlighted,
  isSearchMatch,
  theme,
  onItemClick,
}: SkillListItemProps) => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const flipRef = useFlipReorder<HTMLLIElement>(prefersReducedMotion);

  return (
    <ListItem ref={flipRef} disablePadding>
      <Tooltip
        title={<SkillTooltipContent skill={skill} />}
        slotProps={{
          tooltip: { sx: { bgcolor: 'transparent', p: 0, maxWidth: 'none' } },
        }}
      >
        <ListItemButton
          id={skillElementId(skill.skill)}
          onClick={(e) => {
            onItemClick(e.currentTarget, skill);
          }}
          sx={{
            borderRadius: 1,
            transition: 'background-color 0.4s ease, box-shadow 0.4s ease',
            ...(isHighlighted && {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            }),
            ...(isSearchMatch && {
              boxShadow: `inset 0 0 0 1.5px ${theme.palette.primary.main}`,
            }),
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: dotColour(skill, theme),
              flexShrink: 0,
              mr: 1.5,
            }}
          />
          <ListItemText primary={skill.skill} />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {`est. ${skill.years} year${skill.years === 1 ? '' : 's'}`}
          </Typography>
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
};

export const SkillItemsList = ({
  skills,
  highlightedSkill,
  searchTerm,
  onItemClick,
}: SkillItemsListProps) => {
  const theme = useTheme();

  // Search matches float to the top of their group so a match is never buried below the fold.
  const orderedSkills = useMemo(
    () =>
      sortMatchesFirst(
        skills,
        (skill) => searchTerm !== undefined && skillMatchesSearch(skill, searchTerm)
      ),
    [skills, searchTerm]
  );

  return (
    <List disablePadding dense>
      {orderedSkills.map((skill) => (
        <SkillListItem
          key={skill.skill}
          skill={skill}
          isHighlighted={skill.skill === highlightedSkill}
          isSearchMatch={searchTerm !== undefined && skillMatchesSearch(skill, searchTerm)}
          theme={theme}
          onItemClick={onItemClick}
        />
      ))}
    </List>
  );
};
