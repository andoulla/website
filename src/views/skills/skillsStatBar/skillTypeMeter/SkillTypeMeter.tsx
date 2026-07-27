import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import type { SkillTypeSplit } from '@/utils/deriveSkillTypeSplit';

interface Props {
  split: SkillTypeSplit;
}

export const SkillTypeMeter = ({ split }: Props) => {
  const { techCount, skillCount, techPercent } = split;

  if (techCount + skillCount === 0) return null;

  const softPercent = 100 - techPercent;

  return (
    <Tooltip title={`${techCount} technical, ${skillCount} non-technical`}>
      <Box
        role="img"
        aria-label={`${techPercent.toFixed(1)}% technical, ${softPercent.toFixed(1)}% non-technical`}
        sx={{
          display: 'flex',
          height: 8,
          borderRadius: 4,
          overflow: 'hidden',
          width: 120,
        }}
      >
        <Box sx={{ width: `${techPercent}%`, bgcolor: 'primary.main' }} />
        <Box sx={{ width: `${softPercent}%`, bgcolor: 'action.hover' }} />
      </Box>
    </Tooltip>
  );
};
