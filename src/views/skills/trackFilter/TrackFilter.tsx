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
      // Match the ~36px height and divider-coloured border of the toggle group / filter button.
      sx={{
        height: 36,
        color: 'inherit',
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
