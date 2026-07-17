import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

import { useThemeContext } from '@/context/theme';

// Floats below the nav bar (absolute within App's relative wrapper) so it never
// pushes a page header down.
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
          position: 'absolute',
          top: 8,
          right: { xs: 16, sm: 24 },
          zIndex: 1,
          m: 0,
          color: 'text.secondary',
        }}
      />
    </Tooltip>
  );
};
