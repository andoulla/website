import { useMemo, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { SkillTooltipContent } from '@/components/skillTooltipContent';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { formatYears } from '@/utils/formatYears';
import { CategoryColourDot } from '@/views/skills/categoryColourDot';

import { skillElementId } from '../SkillsListView.helpers';

import { dotColour } from './SkillItemsList.helpers';

export interface SkillItemsListProps {
  skills: SkillSummary[];
  highlightedSkills?: string[];
}

interface SkillListItemProps {
  skill: SkillSummary;
  isHighlighted: boolean;
}

const SkillListItem = ({ skill, isHighlighted }: SkillListItemProps) => {
  const theme = useTheme();
  // Frozen at the point the pointer entered the row — not tracked on every mousemove, so the
  // tooltip sits near the cursor without chasing it as the pointer moves toward its links.
  const [anchorPosition, setAnchorPosition] = useState<{ x: number; y: number } | null>(null);

  const anchorElement = useMemo(() => {
    if (anchorPosition === null) return undefined;
    return { getBoundingClientRect: () => new DOMRect(anchorPosition.x, anchorPosition.y, 0, 0) };
  }, [anchorPosition]);

  return (
    <ListItem disablePadding>
      <Tooltip
        title={<SkillTooltipContent skill={skill} />}
        placement="right-start"
        slotProps={{
          tooltip: { sx: { bgcolor: 'transparent', p: 0, maxWidth: 'none' } },
          popper: {
            modifiers: [{ name: 'offset', options: { offset: [8, 12] } }],
            // Falls back to MUI's default child-anchored position for keyboard focus, which
            // never sets anchorPosition.
            ...(anchorElement !== undefined ? { anchorEl: anchorElement } : {}),
          },
        }}
      >
        <ListItemButton
          id={skillElementId(skill.skill)}
          onMouseEnter={(event) => {
            setAnchorPosition({ x: event.clientX, y: event.clientY });
          }}
          sx={{
            borderRadius: 1,
            transition: 'background-color 0.4s ease',
            ...(isHighlighted && {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            }),
          }}
        >
          <CategoryColourDot colour={dotColour(skill, theme)} sx={{ mr: 1.5 }} />
          <ListItemText primary={skill.skill} />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            {`est. ${formatYears(skill.years)}`}
          </Typography>
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
};

export const SkillItemsList = ({ skills, highlightedSkills = [] }: SkillItemsListProps) => {
  return (
    <List disablePadding dense>
      {skills.map((skill) => (
        <SkillListItem
          key={skill.skill}
          skill={skill}
          isHighlighted={highlightedSkills.includes(skill.skill)}
        />
      ))}
    </List>
  );
};
