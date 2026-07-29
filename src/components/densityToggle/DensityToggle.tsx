import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

import { useThemeContext } from '@/context/theme';

export const DensityToggle = () => {
  const { density, toggleDensity } = useThemeContext();

  return (
    // describeChild — keep "Compact" as the accessible name
    <Tooltip title="Switch between compact and comfortable density" describeChild>
      <FormControlLabel
        control={<Switch checked={density === 'compact'} onChange={toggleDensity} size="small" />}
        label="Compact"
        slotProps={{ typography: { variant: 'body2' } }}
        sx={{
          m: 0,
          color: 'text.secondary',
        }}
      />
    </Tooltip>
  );
};
