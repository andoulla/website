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

import { skillElementId } from '../SkillsListView.helpers';

import { dotColour } from './SkillItemsList.helpers';

export interface SkillItemsListProps {
  skills: SkillSummary[];
  highlightedSkill?: string;
  onItemClick: (anchor: HTMLElement, skill: SkillSummary) => void;
}

export const SkillItemsList = ({ skills, highlightedSkill, onItemClick }: SkillItemsListProps) => {
  const theme = useTheme();

  return (
    <List disablePadding dense>
      {skills.map((s) => {
        const isHighlighted = s.skill === highlightedSkill;
        return (
          <ListItem key={s.skill} disablePadding>
            <Tooltip
              title={<SkillTooltipContent skill={s} />}
              slotProps={{
                tooltip: { sx: { bgcolor: 'transparent', p: 0, maxWidth: 'none' } },
              }}
            >
              <ListItemButton
                id={skillElementId(s.skill)}
                onClick={(e) => {
                  onItemClick(e.currentTarget, s);
                }}
                sx={{
                  borderRadius: 1,
                  transition: 'background-color 0.4s ease',
                  ...(isHighlighted && {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  }),
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: dotColour(s, theme),
                    flexShrink: 0,
                    mr: 1.5,
                  }}
                />
                <ListItemText primary={s.skill} />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {`est. ${s.years} year${s.years === 1 ? '' : 's'}`}
                </Typography>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        );
      })}
    </List>
  );
};
