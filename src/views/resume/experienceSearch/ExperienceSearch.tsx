import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { useCareerDataContext } from '@/context/careerData';
import { useTrackContext } from '@/context/track';
import { filterEventsByTrack } from '@/utils/filterEventsByTrack';
import { normaliseSearchTerm } from '@/utils/normaliseSearchTerm';
import { MIN_SEARCH_TERM_LENGTH } from '@/utils/skillMatchesSearch';

import {
  buildSearchResults,
  groupLabel,
  matchesQuery,
  optionLabel,
  resultTo,
} from './ExperienceSearch.helpers';
import type { SearchResult } from './ExperienceSearch.types';

export const ExperienceSearch = () => {
  const careerHistory = useCareerDataContext();
  const { track, trackId } = useTrackContext();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const options = useMemo(
    () => buildSearchResults(filterEventsByTrack(careerHistory, track)),
    [careerHistory, track]
  );

  // Keep the dropdown (and its no-match text) shut until the query is long enough.
  const hasEnoughInput = normaliseSearchTerm(inputValue).length >= MIN_SEARCH_TERM_LENGTH;

  return (
    <Autocomplete<SearchResult>
      options={options}
      value={null}
      inputValue={inputValue}
      onInputChange={(_event, value) => setInputValue(value)}
      open={open && hasEnoughInput}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      groupBy={(option) => groupLabel(option.event)}
      getOptionLabel={optionLabel}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      filterOptions={(available, state) =>
        available.filter((option) => matchesQuery(option, state.inputValue))
      }
      onChange={(_event, selected) => {
        if (selected === null) return;
        setInputValue('');
        void navigate(resultTo(selected, trackId));
      }}
      noOptionsText="No matching experience…"
      size="small"
      fullWidth
      // Swap the dropdown arrow for a search icon; don't let it flip when the list opens.
      popupIcon={<SearchIcon />}
      sx={{
        maxWidth: 720,
        mx: 'auto',
        mb: 4,
        '& .MuiAutocomplete-popupIndicatorOpen': { transform: 'none' },
        // Slimmer than the default small size.
        '& .MuiAutocomplete-inputRoot': { py: 0.25 },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Ask about my experience…"
          slotProps={{
            ...params.slotProps,
            htmlInput: {
              ...params.slotProps.htmlInput,
              'aria-label': 'Ask about my experience',
            },
          }}
        />
      )}
    />
  );
};
