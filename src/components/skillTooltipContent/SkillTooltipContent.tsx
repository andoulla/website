import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import type { SkillSummary } from '@/utils/calculateSkillYears';
import { SUBCATEGORY_LABELS } from '@/utils/skillCategory';

export interface SkillTooltipContentProps {
  skill: SkillSummary;
}

const formatYears = (years: number): string => `${years} year${years === 1 ? '' : 's'}`;

export const SkillTooltipContent = ({ skill }: SkillTooltipContentProps) => {
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
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {SUBCATEGORY_LABELS[skill.subCategory]}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: skill.companyYears.length > 0 ? 1 : 0 }}
      >
        {formatYears(skill.years)}
      </Typography>
      {skill.companyYears.length > 0 && (
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {skill.companyYears.map(({ name, years }) => (
            <Chip
              key={name}
              label={`${name} · ${formatYears(years)}`}
              size="small"
              variant="outlined"
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
};
