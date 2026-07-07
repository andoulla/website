import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { SkillTooltipContent } from '@/components/skillTooltipContent';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { skillMatchesSearch } from '@/utils/skillMatchesSearch';

import { skillElementId } from '../SkillsListView.helpers';

import { dotColour } from './SkillItemsList.helpers';

export interface SkillItemsListProps {
  skills: SkillSummary[];
  highlightedSkill?: string;
  searchTerm?: string;
  onItemClick: (anchor: HTMLElement, skill: SkillSummary) => void;
}

export const SkillItemsList = ({
  skills,
  highlightedSkill,
  searchTerm,
  onItemClick,
}: SkillItemsListProps) => {
  const theme = useTheme();

  return (
    <List disablePadding dense>
      {skills.map((skill) => {
        const isHighlighted = skill.skill === highlightedSkill;
        const isSearchMatch = searchTerm !== undefined && skillMatchesSearch(skill, searchTerm);
        return (
          <ListItem key={skill.skill} disablePadding>
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
      })}
    </List>
  );
};
