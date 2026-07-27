import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import type { SkillTypeSplit } from '@/utils/deriveSkillTypeSplit';

interface Props {
  split: SkillTypeSplit;
}

const BAR_HEIGHT_BY_DENSITY = { comfortable: 10, compact: 8 } as const;

export const SkillTypeMeter = ({ split }: Props) => {
  const theme = useTheme();
  const { techCount, skillCount, techPercent } = split;

  if (techCount + skillCount === 0) return null;

  const softPercent = 100 - techPercent;
  const barHeight = BAR_HEIGHT_BY_DENSITY[theme.density ?? 'compact'];

  return (
    <Tooltip title={`${techCount} technical, ${skillCount} non-technical`}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Tech vs non-tech
        </Typography>
        <Box
          role="img"
          aria-label={`${techPercent.toFixed(1)}% technical, ${softPercent.toFixed(1)}% non-technical`}
          sx={{
            display: 'flex',
            height: barHeight,
            borderRadius: 4,
            overflow: 'hidden',
            width: 120,
          }}
        >
          <Box sx={{ width: `${techPercent}%`, bgcolor: 'primary.main' }} />
          <Box sx={{ width: `${softPercent}%`, bgcolor: 'action.hover' }} />
        </Box>
      </Stack>
    </Tooltip>
  );
};
