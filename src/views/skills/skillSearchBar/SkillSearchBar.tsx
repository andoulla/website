import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

export interface SkillSearchBarProps {
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
        <IconButton aria-label="Clear search" size="small" edge="end" onClick={() => onChange('')}>
          <ClearIcon fontSize="small" />
        </IconButton>
      </InputAdornment>
    ) : undefined;

  return (
    <TextField
      size="small"
      placeholder="Search skills"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && value !== '') onChange('');
      }}
      helperText={hint !== undefined ? <span aria-live="polite">{hint}</span> : undefined}
      sx={{ width: { xs: '100%', sm: 220 } }}
      slotProps={{
        htmlInput: { 'aria-label': 'Search skills by name' },
        // MUI calls the icon/button placed inside the input's edges "adornments"
        input: { startAdornment: searchIcon, endAdornment: clearButton },
      }}
    />
  );
};
