import { Link as RouterLink } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { TRACK_PARAM, useTrackContext } from '@/context/track';
import type { SkillSummary } from '@/utils/calculateSkillYears';
import { formatYears } from '@/utils/formatYears';

interface SkillTooltipContentProps {
  skill: SkillSummary;
}

export const SkillTooltipContent = ({ skill }: SkillTooltipContentProps) => {
  const theme = useTheme();
  const { trackId } = useTrackContext();

  return (
    <Paper
      elevation={3}
      sx={{
        p: 1.5,
        width: { xs: 200, sm: 300 },
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {skill.skill}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {skill.subCategoryName}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: skill.companyYears.length > 0 ? 1 : 0 }}
      >
        {formatYears(skill.years)}
      </Typography>
      {skill.companyYears.length > 0 && (
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', mb: 1 }}>
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
      <Divider sx={{ my: 1 }} />
      <Link
        component={RouterLink}
        to={`/?skill=${encodeURIComponent(skill.skill)}&${TRACK_PARAM}=${trackId}`}
        variant="body2"
        underline="none"
        sx={{ display: 'block' }}
      >
        View on Resume
      </Link>
      {skill.recommendationIds.length > 0 && (
        <Link
          component={RouterLink}
          to={`/?recommendation=${encodeURIComponent(skill.recommendationIds[0])}&${TRACK_PARAM}=${trackId}`}
          variant="body2"
          underline="none"
          sx={{ display: 'block', mt: 0.5 }}
        >
          {`${skill.recommendationIds.length} recommendation${skill.recommendationIds.length === 1 ? '' : 's'}`}
        </Link>
      )}
    </Paper>
  );
};
