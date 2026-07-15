import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { useTrackContext } from '@/context/track';
import { tracks } from '@/data/tracks';
import type { TrackId } from '@/types';

export const TrackFilter = () => {
  const { trackId, setTrackId } = useTrackContext();

  return (
    <Select<TrackId>
      size="small"
      value={trackId}
      onChange={(event) => {
        setTrackId(event.target.value);
      }}
      inputProps={{ 'aria-label': 'Track' }}
      // Match the 36px height and divider border of the other toolbar controls.
      sx={{
        height: 36,
        color: 'inherit',
        // 0.8125rem = MUI small-button font size, so the value matches the Filters button.
        fontSize: '0.8125rem',
        '& .MuiSelect-select': { py: '6px' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
      }}
    >
      {tracks.map((track) => (
        <MenuItem key={track.id} value={track.id}>
          {track.label}
        </MenuItem>
      ))}
    </Select>
  );
};
