import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

interface SkillSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}

export const SkillSearchBar = ({ value, onChange, hint }: SkillSearchBarProps) => {
  const searchIcon = (
    <InputAdornment position="start">
      <SearchIcon fontSize="small" />
    </InputAdornment>
  );

  const clearButton =
    value !== '' ? (
      <InputAdornment position="end">
        {/* Padding widens the tap target to ≥44×44 without resizing the icon glyph. */}
        <Tooltip title="Clear search">
          <IconButton
            aria-label="Clear search"
            size="small"
            edge="end"
            onClick={() => onChange('')}
            sx={{ p: 1.5 }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </InputAdornment>
    ) : undefined;

  return (
    <TextField
      size="small"
      placeholder="e.g. React"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && value !== '') onChange('');
      }}
      helperText={hint !== undefined ? <span aria-live="polite">{hint}</span> : undefined}
      sx={{ width: '100%' }}
      slotProps={{
        htmlInput: { 'aria-label': 'Search skills by name', sx: { py: '6px' } },
        // MUI calls the icon/button placed inside the input's edges "adornments"
        input: {
          startAdornment: searchIcon,
          endAdornment: clearButton,
          // Match the ~36px height and divider-coloured border of the toggle group / filter button.
          sx: { height: 36, '& fieldset': { borderColor: 'divider' } },
        },
      }}
    />
  );
};
