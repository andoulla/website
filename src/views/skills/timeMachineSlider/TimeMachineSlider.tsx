import { useState } from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// SxProps without its array/function members: the object form callers pass, safe to spread.
type SxObject = Exclude<SxProps<Theme>, readonly unknown[] | ((theme: Theme) => unknown)>;

interface TimeMachineSliderProps {
  year: number;
  minYear: number;
  maxYear: number;
  onCommit: (year: number) => void;
  sx?: SxObject;
}

const single = (value: number | number[]): number => (Array.isArray(value) ? value[0] : value);

export const TimeMachineSlider = ({
  year,
  minYear,
  maxYear,
  onCommit,
  sx,
}: TimeMachineSliderProps) => {
  // Thumb tracks live; parent updates on commit only.
  const [liveYear, setLiveYear] = useState(year);

  // Suppresses the resync below while the user is mid-drag.
  const [isDragging, setIsDragging] = useState(false);

  // Resync on external year change (URL load, track switch) via adjust-during-render.
  const [committedYear, setCommittedYear] = useState(year);

  if (year !== committedYear && !isDragging) {
    setCommittedYear(year);
    setLiveYear(year);
  }

  const [infoAnchor, setInfoAnchor] = useState<HTMLElement | null>(null);

  const formatYear = (value: number): string => (value === maxYear ? 'Present' : String(value));

  // Middle mark tracks the thumb; dropped at the extremes to avoid endpoint overlap.
  const marks = [
    { value: minYear, label: String(minYear) },
    ...(liveYear !== minYear && liveYear !== maxYear
      ? [{ value: liveYear, label: formatYear(liveYear) }]
      : []),
    { value: maxYear, label: String(maxYear) },
  ];

  return (
    <Stack
      direction="row"
      spacing={1.5}
      // Nudge up so the year labels sit within the toolbar band, centring the control as a block.
      sx={{ px: 1, minWidth: 0, alignItems: 'center', transform: 'translateY(-8px)', ...sx }}
    >
      <Slider
        value={liveYear}
        min={minYear}
        max={maxYear}
        step={1}
        marks={marks}
        aria-label="Career year"
        getAriaValueText={formatYear}
        sx={{
          flexGrow: 1,
          '& .MuiSlider-markLabel': { top: 22, fontSize: '0.7rem', color: 'text.secondary' },
        }}
        onChange={(_event, value) => {
          setIsDragging(true);
          setLiveYear(single(value));
        }}
        onChangeCommitted={(_event, value) => {
          setIsDragging(false);
          onCommit(single(value));
        }}
      />
      <IconButton
        size="small"
        aria-label="About the time slider"
        onClick={(event) => setInfoAnchor(event.currentTarget)}
        sx={{ p: 0.25, color: 'text.secondary' }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Popover
        open={infoAnchor !== null}
        anchorEl={infoAnchor}
        onClose={() => setInfoAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Typography variant="body2" sx={{ p: 1.5, maxWidth: 240 }}>
          Rewind the years to see which skills were in play, and how much experience each had, at
          any point in time.
        </Typography>
      </Popover>
    </Stack>
  );
};
