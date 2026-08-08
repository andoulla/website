import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

import { useThemeContext } from '@/context/theme';

export const DensityToggle = () => {
  const { density, toggleDensity } = useThemeContext();
  // Stateful accessible name — position/fill colour alone don't convey on/off. No describeChild:
  // MUI's default Tooltip wiring puts `title` on the label as its aria-label, which becomes the
  // switch's accessible name (see WAI-ARIA label recursion via a wrapping native <label>).
  const stateLabel = `Compact view: ${density === 'compact' ? 'on' : 'off'}`;

  return (
    <Tooltip title={stateLabel}>
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
