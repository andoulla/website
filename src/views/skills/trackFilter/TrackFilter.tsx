import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { useTrackContext } from '@/context/track';
import { tracks } from '@/data/tracks';
import type { TrackId } from '@/types';

export const TrackFilter = () => {
  const { trackId, setTrackId } = useTrackContext();

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="track-filter-label">Track</InputLabel>
      <Select<TrackId>
        labelId="track-filter-label"
        label="Track"
        value={trackId}
        onChange={(event) => {
          setTrackId(event.target.value);
        }}
      >
        {tracks.map((track) => (
          <MenuItem key={track.id} value={track.id}>
            {track.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
