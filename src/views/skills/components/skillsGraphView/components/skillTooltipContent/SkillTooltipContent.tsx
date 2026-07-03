import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import type { SkillSummary } from '../../../../../../utils/calculateSkillYears';
import type { SkillCategory } from '../../../../../../utils/skillColour';

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  engineering: 'Engineering',
  managerial: 'Managerial',
  'soft-skills': 'Soft Skills',
  other: 'Other',
};

export interface SkillTooltipContentProps {
  skill: SkillSummary;
  companyNames: string[];
}

export const SkillTooltipContent = ({ skill, companyNames }: SkillTooltipContentProps) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 1.5,
        maxWidth: 260,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {skill.skill}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {`${skill.years} year${skill.years === 1 ? '' : 's'}`}
      </Typography>
      <Box sx={{ mb: companyNames.length > 0 ? 1 : 0 }}>
        <Chip label={CATEGORY_LABELS[skill.category]} color={skill.colour} size="small" />
      </Box>
      {companyNames.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {companyNames.map((name) => (
            <Chip key={name} label={name} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
    </Paper>
  );
};
