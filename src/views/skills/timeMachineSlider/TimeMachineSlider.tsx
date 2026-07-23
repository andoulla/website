import { useState } from 'react';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface TimeMachineSliderProps {
  year: number;
  minYear: number;
  maxYear: number;
  onCommit: (year: number) => void;
}

const single = (value: number | number[]): number => (Array.isArray(value) ? value[0] : value);

export const TimeMachineSlider = ({ year, minYear, maxYear, onCommit }: TimeMachineSliderProps) => {
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

  const marks = [
    { value: minYear, label: String(minYear) },
    { value: maxYear, label: String(maxYear) },
  ];

  const formatYear = (value: number): string => (value === maxYear ? 'Present' : String(value));

  return (
    <Stack spacing={0.5} sx={{ px: 1, mb: { xs: 1.5, sm: 2 } }}>
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}
      >
        <Typography variant="caption" color="text.secondary">
          See skills as they stood at any point in time
        </Typography>
        <Typography variant="caption" color="text.secondary" aria-live="polite">
          {formatYear(liveYear)}
        </Typography>
      </Stack>
      <Slider
        value={liveYear}
        min={minYear}
        max={maxYear}
        step={1}
        marks={marks}
        aria-label="Career year"
        onChange={(_event, value) => {
          setIsDragging(true);
          setLiveYear(single(value));
        }}
        onChangeCommitted={(_event, value) => {
          setIsDragging(false);
          onCommit(single(value));
        }}
      />
    </Stack>
  );
};
