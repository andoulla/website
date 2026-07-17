import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

import { useTrackContext } from '@/context/track';
import { tracks } from '@/data/tracks';
import type { TrackId } from '@/types';

export const TrackFilter = () => {
  const { trackId, setTrackId } = useTrackContext();

  // Visible "Track:" prefix — the bare value ("General") gives sighted users no cue.
  const renderTrackValue = (id: TrackId) => {
    const track = tracks.find((candidate) => candidate.id === id);
    return `Track: ${track?.label ?? id}`;
  };

  return (
    <Select<TrackId>
      size="small"
      value={trackId}
      onChange={(event) => {
        setTrackId(event.target.value);
      }}
      renderValue={renderTrackValue}
      inputProps={{ 'aria-label': 'Track' }}
      // Match the 36px height and divider border of the other toolbar controls.
      sx={{
        height: 36,
        color: 'inherit',
        '& .MuiSelect-select': {
          py: '6px',
          // Button typography + small-button size, so the value matches the Filters button.
          typography: 'button',
          fontSize: '0.8125rem',
        },
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
