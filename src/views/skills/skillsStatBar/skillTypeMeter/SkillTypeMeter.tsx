import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import type { SkillTypeSplit } from '@/utils/deriveSkillTypeSplit';

interface Props {
  split: SkillTypeSplit;
}

export const SkillTypeMeter = ({ split }: Props) => {
  const { techCount, skillCount, techPct } = split;

  if (techCount + skillCount === 0) return null;

  const softPct = 100 - techPct;

  return (
    <Tooltip title={`${techCount} technical, ${skillCount} non-technical`}>
      <Box
        role="img"
        aria-label={`${techPct.toFixed(1)}% technical, ${softPct.toFixed(1)}% non-technical`}
        sx={{
          display: 'flex',
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
          width: 120,
        }}
      >
        <Box sx={{ width: `${techPct}%`, bgcolor: 'primary.main' }} />
        <Box sx={{ width: `${softPct}%`, bgcolor: 'action.hover' }} />
      </Box>
    </Tooltip>
  );
};
